import { create } from 'zustand'
import { db } from '@/lib/db'
import {
  createPairing,
  decodePairing,
  exportPairingForStorage,
  importPairingFromStorage,
  type Pairing,
} from './pairing'
import { buildSyncPayload, type SyncPayload } from './payload'
import { mergeSyncPayload } from './merge'
import { pull, push, syncConfigured } from './client'

const PAIRING_KEY = 'sync.pairing'
const LAST_SYNCED_KEY = 'sync.lastSyncedAt'
const PUSH_DEBOUNCE_MS = 15_000
const PULL_INTERVAL_MS = 30 * 60 * 1000

interface StoredPairing {
  syncId: string
  rawKey: string
}

function payloadHasData(payload: SyncPayload): boolean {
  return (
    payload.collection.length > 0 ||
    payload.wishlistLists.length > 0 ||
    payload.tradeLists.length > 0 ||
    payload.customCollections.length > 0
  )
}

interface DeviceSyncState {
  pairing: Pairing | null
  loaded: boolean
  syncing: boolean
  /** Payload remoto pendiente de que el usuario decida cómo combinarlo (design.md D5). */
  pendingReconciliation: SyncPayload | null
  toast: string | null
  init: () => Promise<void>
  startPairing: () => Promise<string>
  completePairingFromScan: (qrText: string) => Promise<void>
  resolveReconciliation: (mode: 'local' | 'remote' | 'merge') => Promise<void>
  forget: () => Promise<void>
  syncNow: () => Promise<void>
}

async function persistPairing(pairing: Pairing): Promise<void> {
  const stored = await exportPairingForStorage(pairing)
  await db.settings.put({ key: PAIRING_KEY, value: stored satisfies StoredPairing })
}

export const useDeviceSync = create<DeviceSyncState>((set, get) => ({
  pairing: null,
  loaded: false,
  syncing: false,
  pendingReconciliation: null,
  toast: null,

  init: async () => {
    const row = await db.settings.get(PAIRING_KEY)
    const stored = row?.value as StoredPairing | undefined
    if (stored) {
      const pairing = await importPairingFromStorage(stored)
      set({ pairing, loaded: true })
    } else {
      set({ loaded: true })
    }
  },

  /** Dispositivo que genera el QR: crea el emparejamiento y sube su estado actual como base. */
  startPairing: async () => {
    const { pairing, qrText } = await createPairing()
    await persistPairing(pairing)
    const payload = await buildSyncPayload()
    await push(pairing, payload)
    await db.settings.put({ key: LAST_SYNCED_KEY, value: Date.now() })
    set({ pairing, toast: null })
    return qrText
  },

  /** Dispositivo que escanea el QR (o cualquiera, al releer el mismo flujo): decide si hace
   * falta reconciliar (design.md D5) o si puede fusionar/establecer la base sin preguntar. */
  completePairingFromScan: async (qrText: string) => {
    const pairing = await decodePairing(qrText)
    await persistPairing(pairing)
    set({ pairing, syncing: true })
    try {
      const result = await pull(pairing)
      const localPayload = await buildSyncPayload()

      if (!result.found) {
        await push(pairing, localPayload)
        await db.settings.put({ key: LAST_SYNCED_KEY, value: Date.now() })
        set({ syncing: false, pendingReconciliation: null })
        return
      }

      const bothHaveData = payloadHasData(localPayload) && payloadHasData(result.payload)
      if (!bothHaveData) {
        await mergeSyncPayload(result.payload, 'merge')
        await push(pairing, await buildSyncPayload())
        await db.settings.put({ key: LAST_SYNCED_KEY, value: Date.now() })
        set({ syncing: false, pendingReconciliation: null })
        return
      }

      // Ambos dispositivos tienen datos propios: se pregunta una única vez.
      set({ syncing: false, pendingReconciliation: result.payload })
    } catch (err) {
      set({ syncing: false })
      throw err
    }
  },

  resolveReconciliation: async (mode) => {
    const { pairing, pendingReconciliation } = get()
    if (!pairing || !pendingReconciliation) return
    set({ syncing: true })
    if (mode === 'remote') {
      await mergeSyncPayload(pendingReconciliation, 'replace-local')
    } else if (mode === 'merge') {
      await mergeSyncPayload(pendingReconciliation, 'merge')
    }
    // 'local': no se toca nada localmente, solo se sube tal cual está.
    await push(pairing, await buildSyncPayload())
    await db.settings.put({ key: LAST_SYNCED_KEY, value: Date.now() })
    set({ syncing: false, pendingReconciliation: null })
  },

  forget: async () => {
    await db.settings.delete(PAIRING_KEY)
    await db.settings.delete(LAST_SYNCED_KEY)
    set({ pairing: null, pendingReconciliation: null, toast: null })
  },

  syncNow: async () => {
    const { pairing } = get()
    if (!pairing || !syncConfigured()) return
    set({ syncing: true })
    try {
      const result = await pull(pairing)
      const lastSyncedRow = await db.settings.get(LAST_SYNCED_KEY)
      const hadSyncedBefore = lastSyncedRow?.value != null

      if (result.found) {
        await mergeSyncPayload(result.payload, 'merge')
      } else if (hadSyncedBefore) {
        // La sesión existía y ya no está: caducó por inactividad (design.md D4).
        // Se recrea desde el estado local, sin pedir un QR nuevo.
        set({ toast: 'sync.restoredAfterExpiry' })
      }

      await push(pairing, await buildSyncPayload())
      await db.settings.put({ key: LAST_SYNCED_KEY, value: Date.now() })
    } finally {
      set({ syncing: false })
    }
  },
}))

let pushTimer: ReturnType<typeof setTimeout> | null = null
let pullTimer: ReturnType<typeof setInterval> | null = null

function scheduleDebouncedPush() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void useDeviceSync.getState().syncNow()
  }, PUSH_DEBOUNCE_MS)
}

const SYNCED_TABLES = [
  'collection',
  'wishlistLists',
  'tradeLists',
  'customCollections',
  'customCollectionCards',
] as const

/**
 * Ciclo de vida de la sincronización (design.md D4): push al detectar cambios
 * (debounced, igual que el auto-backup) + pull periódico (igual que la
 * comprobación de actualizaciones del service worker). Se instala una vez en
 * `App.tsx`, igual que `installAutoBackup()`.
 */
export function installDeviceSync(): void {
  db.use({
    stack: 'dbcore',
    name: 'device-sync',
    create(down) {
      return {
        ...down,
        table(name) {
          const table = down.table(name)
          if (!(SYNCED_TABLES as readonly string[]).includes(name)) return table
          return {
            ...table,
            mutate(req) {
              if (useDeviceSync.getState().pairing) scheduleDebouncedPush()
              return table.mutate(req)
            },
          }
        },
      }
    },
  })

  const pullIfPaired = () => {
    if (useDeviceSync.getState().pairing) void useDeviceSync.getState().syncNow()
  }

  if (pullTimer) clearInterval(pullTimer)
  pullTimer = setInterval(pullIfPaired, PULL_INTERVAL_MS)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pullIfPaired()
  })
  pullIfPaired()
}
