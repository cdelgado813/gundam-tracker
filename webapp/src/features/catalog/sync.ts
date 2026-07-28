import { create } from 'zustand'
import {
  ApiAuthError,
  fetchBlueprints,
  fetchExpansions,
  GUNDAM_GAME_ID,
  SINGLES_CATEGORY_ID,
  type ApiBlueprint,
} from '@/lib/api'
import { db, type Card } from '@/lib/db'

const CDN_BASE = 'https://cardtrader.com'
const LAST_CHECK_KEY = 'catalog.lastNewExpansionCheck'

function blueprintToCard(bp: ApiBlueprint): Card {
  const name = bp.version ? `${bp.name} (${bp.version})` : bp.name
  const showUrl = bp.image?.show?.url
  return {
    id: bp.id,
    expansionId: bp.expansion_id,
    name,
    version: bp.version,
    collectorNumber: bp.fixed_properties.collector_number ?? '',
    rarity: bp.fixed_properties.gundam_rarity ?? '',
    imageUrlPreview: bp.image_url ?? null,
    imageUrlShow: showUrl ? `${CDN_BASE}${showUrl}` : (bp.image_url ?? null),
    searchName: name.toLowerCase(),
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Descarga y persiste los blueprints de una expansión, con reintentos y backoff. */
async function syncExpansion(expansionId: number): Promise<void> {
  let attempt = 0
  for (;;) {
    try {
      const bps = await fetchBlueprints(expansionId)
      const cards = bps.filter((b) => b.category_id === SINGLES_CATEGORY_ID).map(blueprintToCard)
      await db.transaction('rw', db.cards, db.expansions, async () => {
        await db.cards.where('expansionId').equals(expansionId).delete()
        await db.cards.bulkPut(cards)
        await db.expansions.update(expansionId, { cardCount: cards.length, syncedAt: Date.now() })
      })
      return
    } catch (err) {
      if (err instanceof ApiAuthError || attempt >= 3) throw err
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
  /** ids de expansiones aún no sincronizadas (para reanudar) */
  pendingIds: number[]
}

interface SyncState extends SyncProgress {
  /** Sincroniza expansiones y blueprints pendientes. `force` re-descarga todo. */
  run: (force?: boolean) => Promise<void>
  /** Comprobación diaria de expansiones nuevas (no intrusiva). Devuelve nº de nuevas. */
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
      // 1. Expansiones del juego Gundam
      const all = await fetchExpansions()
      const gundam = all.filter((e) => e.game_id === GUNDAM_GAME_ID)
      const existing = new Map((await db.expansions.toArray()).map((e) => [e.id, e]))
      await db.expansions.bulkPut(
        gundam.map((e) => ({
          ...existing.get(e.id), // conserva cardCount/syncedAt si ya estaba
          id: e.id,
          gameId: e.game_id,
          code: e.code,
          name: e.name,
        })),
      )

      // 2. Expansiones pendientes (o todas si force)
      const stored = await db.expansions.toArray()
      const pending = stored.filter((e) => force || e.syncedAt === undefined)
      set({ total: pending.length, done: 0, pendingIds: pending.map((e) => e.id) })

      // 3. Descarga secuencial con backoff (design D2)
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
        error: err instanceof Error ? err.message : 'Error sincronizando el catálogo',
      })
    }
  },

  checkForNewExpansions: async () => {
    const last = (await db.settings.get(LAST_CHECK_KEY))?.value
    if (typeof last === 'number' && Date.now() - last < 24 * 60 * 60 * 1000) return 0
    try {
      const all = await fetchExpansions()
      const gundam = all.filter((e) => e.game_id === GUNDAM_GAME_ID)
      const knownIds = new Set((await db.expansions.toCollection().primaryKeys()) as number[])
      const fresh = gundam.filter((e) => !knownIds.has(e.id))
      await db.expansions.bulkPut(
        fresh.map((e) => ({ id: e.id, gameId: e.game_id, code: e.code, name: e.name })),
      )
      await db.settings.put({ key: LAST_CHECK_KEY, value: Date.now() })
      return fresh.length
    } catch {
      return 0 // silencioso: es una comprobación en segundo plano
    }
  },
}))
