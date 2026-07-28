import { z } from 'zod'
import { db } from '@/lib/db'

const conditionSchema = z.enum([
  'Mint',
  'Near Mint',
  'Slightly Played',
  'Moderately Played',
  'Played',
  'Poor',
])
const languageSchema = z.enum(['en', 'jp', 'zh-CN'])

export const BACKUP_SCHEMA_VERSION = 1
const MAX_BACKUPS = 5
const DEBOUNCE_MS = 30_000
/** Tablas de usuario incluidas en el backup. Nunca `settings` completo (contiene el JWT) ni catálogo. */
const USER_TABLES = ['collection', 'wishlist', 'tradeLists'] as const

const backupSchema = z.object({
  schemaVersion: z.literal(BACKUP_SCHEMA_VERSION),
  exportedAt: z.number(),
  collection: z.array(
    z.object({
      cardId: z.number(),
      expansionId: z.number(),
      quantity: z.number().int().positive(),
      condition: conditionSchema,
      language: languageSchema,
      addedAt: z.number(),
      updatedAt: z.number(),
    }),
  ),
  wishlist: z.array(
    z.object({
      cardId: z.number(),
      expansionId: z.number(),
      desiredQuantity: z.number().int().positive(),
      addedAt: z.number(),
    }),
  ),
  tradeLists: z.array(
    z.object({
      name: z.string(),
      authorAlias: z.string().optional(),
      items: z.array(
        z.object({
          cardId: z.number(),
          quantity: z.number().int().positive(),
          condition: conditionSchema.optional(),
        }),
      ),
      kind: z.enum(['own', 'received']),
      createdAt: z.number(),
      updatedAt: z.number(),
    }),
  ),
})

export type BackupPayload = z.infer<typeof backupSchema>

export async function buildBackupPayload(): Promise<BackupPayload> {
  const [collection, wishlist, tradeLists] = await Promise.all([
    db.collection.toArray(),
    db.wishlist.toArray(),
    db.tradeLists.toArray(),
  ])
  const strip = <T extends { id?: number }>(rows: T[]) =>
    rows.map(({ id: _id, ...rest }) => rest)
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: Date.now(),
    collection: strip(collection),
    wishlist: strip(wishlist),
    tradeLists: strip(tradeLists),
  } as BackupPayload
}

/** Valida un JSON importado. Lanza Error legible si no cumple el esquema. */
export function parseBackup(json: string): BackupPayload {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('El fichero no es JSON válido.')
  }
  const result = backupSchema.safeParse(raw)
  if (!result.success)
    throw new Error('El fichero no es un backup de Gundam Tracker o es de una versión incompatible.')
  return result.data
}

export async function restoreBackup(payload: BackupPayload, mode: 'replace' | 'merge'): Promise<void> {
  await db.transaction('rw', db.collection, db.wishlist, db.tradeLists, async () => {
    if (mode === 'replace') {
      await Promise.all([db.collection.clear(), db.wishlist.clear(), db.tradeLists.clear()])
    }
    await db.collection.bulkAdd(payload.collection)
    if (mode === 'replace') {
      await db.wishlist.bulkAdd(payload.wishlist)
    } else {
      // merge: no dupliques cartas ya deseadas (wishlist tiene índice único por cardId)
      const existing = new Set((await db.wishlist.toArray()).map((w) => w.cardId))
      await db.wishlist.bulkAdd(payload.wishlist.filter((w) => !existing.has(w.cardId)))
    }
    await db.tradeLists.bulkAdd(payload.tradeLists)
  })
}

// ---- Backup automático (spec local-persistence-backup) ----

let dirty = false
let timer: ReturnType<typeof setTimeout> | null = null

async function writeAutoBackup(): Promise<void> {
  if (!dirty) return
  dirty = false
  const payload = await buildBackupPayload()
  await db.backups.add({
    createdAt: payload.exportedAt,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    payload: JSON.stringify(payload),
  })
  // rotación: conserva solo los MAX_BACKUPS más recientes
  const all = await db.backups.orderBy('createdAt').reverse().toArray()
  if (all.length > MAX_BACKUPS) {
    await db.backups.bulkDelete(all.slice(MAX_BACKUPS).map((b) => b.id!))
  }
  await writeBackupToFolder(payload).catch(() => {
    /* carpeta no disponible: el backup interno ya está guardado */
  })
}

function markDirty() {
  dirty = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => void writeAutoBackup(), DEBOUNCE_MS)
}

/** Middleware DBCore: marca sucio ante cualquier escritura en tablas de usuario. */
export function installAutoBackup(): void {
  db.use({
    stack: 'dbcore',
    name: 'auto-backup',
    create(down) {
      return {
        ...down,
        table(name) {
          const table = down.table(name)
          if (!(USER_TABLES as readonly string[]).includes(name)) return table
          return {
            ...table,
            mutate(req) {
              markDirty()
              return table.mutate(req)
            },
          }
        },
      }
    },
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void writeAutoBackup()
  })
}

// ---- Carpeta de backups (File System Access API, con degradación) ----

const DIR_HANDLE_KEY = 'backup.dirHandle'

export function folderBackupSupported(): boolean {
  return 'showDirectoryPicker' in window
}

export async function chooseBackupFolder(): Promise<boolean> {
  if (!folderBackupSupported()) return false
  try {
    // showDirectoryPicker no está en los tipos DOM estándar aún
    const handle = await (
      window as unknown as {
        showDirectoryPicker: (o: { mode: string }) => Promise<FileSystemDirectoryHandle>
      }
    ).showDirectoryPicker({ mode: 'readwrite' })
    await db.settings.put({ key: DIR_HANDLE_KEY, value: handle })
    return true
  } catch {
    return false
  }
}

export async function getBackupFolderName(): Promise<string | null> {
  const row = await db.settings.get(DIR_HANDLE_KEY)
  const handle = row?.value as FileSystemDirectoryHandle | undefined
  return handle?.name ?? null
}

async function writeBackupToFolder(payload: BackupPayload): Promise<void> {
  const row = await db.settings.get(DIR_HANDLE_KEY)
  const handle = row?.value as FileSystemDirectoryHandle | undefined
  if (!handle) return
  const perm = await (
    handle as unknown as { queryPermission: (o: { mode: string }) => Promise<string> }
  ).queryPermission({ mode: 'readwrite' })
  if (perm !== 'granted') return
  const d = new Date(payload.exportedAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  const name = `gundam-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`
  const file = await handle.getFileHandle(name, { create: true })
  const writable = await file.createWritable()
  await writable.write(JSON.stringify(payload, null, 1))
  await writable.close()
}
