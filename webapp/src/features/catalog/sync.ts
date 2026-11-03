import { create } from 'zustand'
import {
  fetchStaticCards,
  fetchStaticExpansions,
  fetchStaticMeta,
  type StaticCard,
} from '@/lib/staticData'
import { db, type Card } from '@/lib/db'

const LAST_CHECK_KEY = 'catalog.lastNewExpansionCheck'
/** `generatedAt` (meta.json) de la última sincronización completa de cartas. */
const SYNCED_GENERATION_KEY = 'catalog.syncedGeneratedAt'

/** Fecha de generación del catálogo publicado; null si no se puede consultar. */
async function fetchGeneration(): Promise<number | null> {
  try {
    return (await fetchStaticMeta()).generatedAt
  } catch {
    return null
  }
}

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

      // Solo las que siguen publicadas: una expansión retirada del catálogo (su JSON
      // ya no existe) daba 404 y abortaba la sincronización de todas las demás. Se
      // conserva en local para no romper colecciones que ya la referencian.
      const publishedIds = new Set(published.map((e) => e.id))
      const stored = (await db.expansions.toArray()).filter((e) => publishedIds.has(e.id))
      const generation = await fetchGeneration()
      const savedGeneration = (await db.settings.get(SYNCED_GENERATION_KEY))?.value
      // Catálogo regenerado desde la última sincronización completa: CardTrader renombra
      // ficheros de imagen y reasigna blueprints, así que las cartas guardadas pueden
      // tener URLs que ya dan 404. Hay que volver a bajarlo todo.
      const stale = generation !== null && savedGeneration !== generation
      const pending = stored.filter((e) => force || stale || e.syncedAt === undefined)
      set({ total: pending.length, done: 0, pendingIds: pending.map((e) => e.id) })

      // Un fallo en una expansión no impide sincronizar las siguientes.
      let firstError: unknown = null
      for (const exp of pending) {
        set({ currentName: exp.name })
        try {
          await syncExpansion(exp.id)
        } catch (err) {
          firstError ??= err
        }
        set((s) => ({ done: s.done + 1, pendingIds: s.pendingIds.filter((id) => id !== exp.id) }))
      }
      if (firstError) throw firstError
      if (generation !== null && pending.length === stored.length) {
        await db.settings.put({ key: SYNCED_GENERATION_KEY, value: generation })
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
    // Comprobación barata (meta.json) y sin límite de frecuencia: si el catálogo se ha
    // regenerado desde la última sincronización completa, se refresca en segundo plano.
    const generation = await fetchGeneration()
    const savedGeneration = (await db.settings.get(SYNCED_GENERATION_KEY))?.value
    if (generation !== null && savedGeneration !== generation && !get().running) {
      void get().run()
      return 0
    }
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
