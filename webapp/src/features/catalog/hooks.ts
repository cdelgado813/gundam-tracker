import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/** Mapa cardId → copias totales en colección (reactivo). */
export function useOwnedMap(): Map<number, number> {
  return (
    useLiveQuery(async () => {
      const entries = await db.collection.toArray()
      const map = new Map<number, number>()
      for (const e of entries) map.set(e.cardId, (map.get(e.cardId) ?? 0) + e.quantity)
      return map
    }) ?? new Map()
  )
}

/** Set de cardIds en wishlist (reactivo). */
export function useWishlistSet(): Set<number> {
  return (
    useLiveQuery(async () => {
      const rows = await db.wishlist.toArray()
      return new Set(rows.map((r) => r.cardId))
    }) ?? new Set()
  )
}
