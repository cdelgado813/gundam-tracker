import { create } from 'zustand'
import { fetchStaticCards, fetchStaticExpansions, type StaticCard } from '@/lib/staticData'
import { db, type Card } from '@/lib/db'

const LAST_CHECK_KEY = 'catalog.lastNewExpansionCheck'

function toCard(c: StaticCard): Card {
  return c
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Descarga y persiste las cartas de una expansión, con reintentos y backoff. */
async function syncExpansion(expansionId: number): Promise<void> {
  let attempt = 0
  for (;;) {
    try {
      const cards = (await fetchStaticCards(expansionId)).map(toCard)
      await db.transaction('rw', db.cards, db.expansions, async () => {
        await db.cards.where('expansionId').equals(expansionId).delete()
        await db.cards.bulkPut(cards)
        await db.expansions.update(expansionId, { cardCount: cards.length, syncedAt: Date.now() })
      })
      return
    } catch (err) {
      if (attempt >= 3) throw err
      await sleep(2 ** attempt * 1000)
      attempt++
    }
  }
}

export interface SyncProgress {
  running: boolean
  total: number
  done: number
  currentName: string | null
  error: string | null
  pendingIds: number[]
}

interface SyncState extends SyncProgress {
  /** Sincroniza expansiones y cartas pendientes. `force` re-descarga todo. */
  run: (force?: boolean) => Promise<void>
  /** Comprueba si hay expansiones nuevas en los datos publicados. Devuelve cuántas. */
  checkForNewExpansions: () => Promise<number>
}

export const useCatalogSync = create<SyncState>((set, get) => ({
  running: false,
  total: 0,
  done: 0,
  currentName: null,
  error: null,
  pendingIds: [],

  run: async (force = false) => {
    if (get().running) return
    set({ running: true, error: null })
    try {
      const published = await fetchStaticExpansions()
      const existing = new Map((await db.expansions.toArray()).map((e) => [e.id, e]))
      await db.expansions.bulkPut(
        published.map((e) => ({
          ...existing.get(e.id), // conserva cardCount/syncedAt de la copia local si ya estaba
          id: e.id,
          gameId: 23,
          code: e.code,
          name: e.name,
        })),
      )

      const stored = await db.expansions.toArray()
      const pending = stored.filter((e) => force || e.syncedAt === undefined)
      set({ total: pending.length, done: 0, pendingIds: pending.map((e) => e.id) })

      for (const exp of pending) {
        set({ currentName: exp.name })
        await syncExpansion(exp.id)
        set((s) => ({ done: s.done + 1, pendingIds: s.pendingIds.filter((id) => id !== exp.id) }))
      }
      await db.settings.put({ key: LAST_CHECK_KEY, value: Date.now() })
      set({ running: false, currentName: null })
    } catch (err) {
      set({
        running: false,
        currentName: null,
        error:
          err instanceof Error
            ? err.message
            : 'Error sincronizando el catálogo. Comprueba tu conexión.',
      })
    }
  },

  checkForNewExpansions: async () => {
    const last = (await db.settings.get(LAST_CHECK_KEY))?.value
    if (typeof last === 'number' && Date.now() - last < 6 * 60 * 60 * 1000) return 0
    try {
      const published = await fetchStaticExpansions()
      const knownIds = new Set((await db.expansions.toCollection().primaryKeys()) as number[])
      const fresh = published.filter((e) => !knownIds.has(e.id))
      await db.expansions.bulkPut(
        fresh.map((e) => ({ id: e.id, gameId: 23, code: e.code, name: e.name })),
      )
      await db.settings.put({ key: LAST_CHECK_KEY, value: Date.now() })
      return fresh.length
    } catch {
      return 0 // comprobación silenciosa en segundo plano
    }
  },
}))
