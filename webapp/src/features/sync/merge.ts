import Dexie, { type UpdateSpec } from 'dexie'
import { db } from '@/lib/db'
import type { SyncPayload } from './payload'

/** Fila mínima fusionable por identidad estable (design.md D6). */
interface Identifiable {
  id?: number
  uuid: string
  updatedAt: number
}

// `Dexie.Table<T, number>` estricto no encaja con el tipo de `EntityTable` que expone
// `GundamDB` (su primary key admite `undefined` en algunas posiciones de los hooks);
// `any` en el parámetro de clave primaria evita pelear con esa variancia de Dexie sin
// perder el tipado de `T` en el resto de la función.
async function mergeTable<T extends Identifiable>(table: Dexie.Table<T, any>, rows: T[]): Promise<void> {
  for (const row of rows) {
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
}

async function mergeCustomCollectionCards(rows: SyncPayload['customCollectionCards']): Promise<void> {
  for (const row of rows) {
    const collection = await db.customCollections.where('uuid').equals(row.collectionUuid).first()
    if (collection?.id == null) continue // colección no encontrada localmente: se omite
    const existing = await db.customCollectionCards
      .where('[collectionId+cardId]')
      .equals([collection.id, row.cardId])
      .first()
    if (!existing) {
      await db.customCollectionCards.add({
        collectionId: collection.id,
        cardId: row.cardId,
        addedAt: row.addedAt,
      })
    }
  }
}

/**
 * Aplica un payload remoto sobre los datos locales.
 * - `'merge'` (por defecto, uso normal de sync continua): fusiona por uuid, nunca pisa
 *   una fila local más reciente. Es lo único que se ejecuta automáticamente.
 * - `'replace-local'`: solo desde la reconciliación inicial ("usar los datos del otro
 *   dispositivo", design.md D5) — vacía las tablas locales antes de aplicar el remoto.
 */
export async function mergeSyncPayload(
  remote: SyncPayload,
  mode: 'merge' | 'replace-local' = 'merge',
): Promise<void> {
  await db.transaction(
    'rw',
    db.collection,
    db.wishlistLists,
    db.tradeLists,
    db.customCollections,
    db.customCollectionCards,
    async () => {
      if (mode === 'replace-local') {
        await Promise.all([
          db.collection.clear(),
          db.wishlistLists.clear(),
          db.tradeLists.clear(),
          db.customCollections.clear(),
          db.customCollectionCards.clear(),
        ])
      }
      await mergeTable(db.collection, remote.collection)
      await mergeTable(db.wishlistLists, remote.wishlistLists)
      await mergeTable(db.tradeLists, remote.tradeLists)
      // customCollections primero: customCollectionCards depende de resolver sus ids locales.
      await mergeTable(db.customCollections, remote.customCollections)
      await mergeCustomCollectionCards(remote.customCollectionCards)
    },
  )
}
