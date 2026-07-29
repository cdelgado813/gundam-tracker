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

/** Set de cardIds presentes en alguna lista de wishlist propia (reactivo). */
export function useWishlistSet(): Set<number> {
  return (
    useLiveQuery(async () => {
      const lists = await db.wishlistLists.where('kind').equals('own').toArray()
      const ids = new Set<number>()
      for (const list of lists) for (const item of list.items) ids.add(item.cardId)
      return ids
    }) ?? new Set()
  )
}

/** Set de cardIds presentes en alguna lista de intercambio propia (reactivo). */
export function useTradeListSet(): Set<number> {
  return (
    useLiveQuery(async () => {
      const lists = await db.tradeLists.where('kind').equals('own').toArray()
      const ids = new Set<number>()
      for (const list of lists) for (const item of list.items) ids.add(item.cardId)
      return ids
    }) ?? new Set()
  )
}
