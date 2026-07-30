import { db, type SyncTombstone } from '@/lib/db'

/** Igual que el TTL del Worker (design.md D4): pasado ese tiempo el blob remoto ya
 * habrá caducado y se recreará desde cero, así que no hace falta recordar borrados más viejos. */
const TOMBSTONE_RETENTION_MS = 90 * 24 * 60 * 60 * 1000

export type SyncedTableName = SyncTombstone['table']

/**
 * Registra (o renueva) el borrado de `uuid` en `table` — sin esto, la sincronización
 * no puede distinguir "esto es nuevo, añádelo" de "esto se borró, no lo resucites"
 * (spec cross-device-sync). Se llama explícitamente desde cada función que borra,
 * en vez de engancharse a un hook de Dexie: la tabla `syncTombstones` no forma parte
 * de las transacciones de borrado ya existentes, y Dexie exige declarar de antemano
 * qué tablas toca cada transacción.
 */
export async function tombstone(table: SyncedTableName, uuid: string | null | undefined): Promise<void> {
  if (!uuid) return
  const now = Date.now()
  const existing = await db.syncTombstones.where('[table+key]').equals([table, uuid]).first()
  if (existing?.id != null) {
    await db.syncTombstones.update(existing.id, { deletedAt: now })
  } else {
    await db.syncTombstones.add({ table, key: uuid, deletedAt: now })
  }
}

/** Tombstones recientes, para incluir en el payload de sincronización. */
export async function getRecentTombstones(): Promise<SyncTombstone[]> {
  const cutoff = Date.now() - TOMBSTONE_RETENTION_MS
  return db.syncTombstones.where('deletedAt').aboveOrEqual(cutoff).toArray()
}

/** Limpia tombstones más antiguos que la ventana de retención. */
export async function pruneOldTombstones(): Promise<void> {
  const cutoff = Date.now() - TOMBSTONE_RETENTION_MS
  await db.syncTombstones.where('deletedAt').below(cutoff).delete()
}

/** Fusiona tombstones remotos con los locales, quedándose con el `deletedAt` más reciente. */
export async function mergeIncomingTombstones(
  incoming: { table: SyncedTableName; key: string; deletedAt: number }[],
): Promise<void> {
  for (const t of incoming) {
    const existing = await db.syncTombstones.where('[table+key]').equals([t.table, t.key]).first()
    if (!existing) {
      await db.syncTombstones.add(t)
    } else if (t.deletedAt > existing.deletedAt) {
      await db.syncTombstones.update(existing.id!, { deletedAt: t.deletedAt })
    }
  }
}
