import Dexie, { type UpdateSpec } from 'dexie'
import { db, type SyncTombstone } from '@/lib/db'
import type { SyncPayload } from './payload'
import { mergeIncomingTombstones } from './tombstones'

/** Fila mínima fusionable por identidad estable (design.md D6). */
interface Identifiable {
  id?: number
  uuid: string
  updatedAt: number
}

async function tombstoneMapFor(table: SyncTombstone['table']): Promise<Map<string, number>> {
  const rows = await db.syncTombstones.where('table').equals(table).toArray()
  return new Map(rows.map((r) => [r.key, r.deletedAt]))
}

// `Dexie.Table<T, number>` estricto no encaja con el tipo de `EntityTable` que expone
// `GundamDB` (su primary key admite `undefined` en algunas posiciones de los hooks);
// `any` en el parámetro de clave primaria evita pelear con esa variancia de Dexie sin
// perder el tipado de `T` en el resto de la función.
async function mergeTable<T extends Identifiable>(
  table: Dexie.Table<T, any>,
  tableName: SyncTombstone['table'],
  rows: T[],
): Promise<void> {
  const tombstones = await tombstoneMapFor(tableName)
  for (const row of rows) {
    const deletedAt = tombstones.get(row.uuid)
    // se borró en algún dispositivo después (o a la vez) que se editó esta fila:
    // sigue borrada, no la resucites (spec cross-device-sync).
    if (deletedAt != null && deletedAt >= row.updatedAt) continue
    const existing = await table.where('uuid').equals(row.uuid).first()
    if (!existing) {
      await table.add(row)
    } else if (row.updatedAt > existing.updatedAt) {
      // Dexie no puede probar en genérico que `T & {id}` encaja en su `UpdateSpec<T>`
      // (limitación de inferencia con `T` abierto); es, en efecto, una fila T completa.
      await table.update(existing.id!, { ...row, id: existing.id! } as UpdateSpec<T>)
    }
    // si la copia local es igual o más reciente, se deja como está: nunca se pisa
    // con algo más viejo (design.md D6, "nunca sobrescribas a ciegas").
  }
  // Filas locales que ya no vienen en el payload remoto porque otro dispositivo las
  // borró: el payload solo trae lo que el otro tiene, así que el borrado se propaga
  // vía el tombstone, no vía ausencia en `rows`.
  for (const [uuid, deletedAt] of tombstones) {
    const local = await table.where('uuid').equals(uuid).first()
    if (local && local.id != null && deletedAt > local.updatedAt) {
      await table.delete(local.id)
    }
  }
}

async function mergeCustomCollectionCards(rows: SyncPayload['customCollectionCards']): Promise<void> {
  const tombstones = await tombstoneMapFor('customCollectionCards')
  for (const row of rows) {
    const deletedAt = tombstones.get(row.uuid)
    // esta tabla no tiene `updatedAt` propio (una fila no cambia tras crearse):
    // `addedAt` hace de marca de versión para comparar contra el tombstone.
    if (deletedAt != null && deletedAt >= row.addedAt) continue
    const collection = await db.customCollections.where('uuid').equals(row.collectionUuid).first()
    if (collection?.id == null) continue // colección no encontrada localmente: se omite
    const existing = await db.customCollectionCards.where('uuid').equals(row.uuid).first()
    if (!existing) {
      await db.customCollectionCards.add({
        uuid: row.uuid,
        collectionId: collection.id,
        cardId: row.cardId,
        addedAt: row.addedAt,
      })
    }
  }
  for (const [uuid, deletedAt] of tombstones) {
    const local = await db.customCollectionCards.where('uuid').equals(uuid).first()
    if (local && local.id != null && deletedAt > local.addedAt) {
      await db.customCollectionCards.delete(local.id)
    }
  }
}

/**
 * Aplica un payload remoto sobre los datos locales.
 * - `'merge'` (por defecto, uso normal de sync continua): fusiona por uuid, nunca pisa
 *   una fila local más reciente, y respeta los tombstones (borrados) de ambos lados.
 * - `'replace-local'`: solo desde la reconciliación inicial ("usar los datos del otro
 *   dispositivo", design.md D5) — vacía las tablas locales antes de aplicar el remoto.
 */
export async function mergeSyncPayload(
  remote: SyncPayload,
  mode: 'merge' | 'replace-local' = 'merge',
): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.collection,
      db.wishlistLists,
      db.tradeLists,
      db.customCollections,
      db.customCollectionCards,
      db.syncTombstones,
    ],
    async () => {
      if (mode === 'replace-local') {
        await Promise.all([
          db.collection.clear(),
          db.wishlistLists.clear(),
          db.tradeLists.clear(),
          db.customCollections.clear(),
          db.customCollectionCards.clear(),
          db.syncTombstones.clear(),
        ])
      }
      await mergeIncomingTombstones(remote.tombstones)
      await mergeTable(db.collection, 'collection', remote.collection)
      await mergeTable(db.wishlistLists, 'wishlistLists', remote.wishlistLists)
      await mergeTable(db.tradeLists, 'tradeLists', remote.tradeLists)
      // customCollections primero: customCollectionCards depende de resolver sus ids locales.
      await mergeTable(db.customCollections, 'customCollections', remote.customCollections)
      await mergeCustomCollectionCards(remote.customCollectionCards)
    },
  )
}
