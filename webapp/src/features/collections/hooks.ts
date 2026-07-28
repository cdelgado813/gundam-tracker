import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CustomCollection } from '@/lib/db'

export function useCustomCollections(): CustomCollection[] {
  return useLiveQuery(() => db.customCollections.orderBy('name').toArray()) ?? []
}

/** Ids de colección a las que pertenece una carta (reactivo). */
export function useCardCollectionIds(cardId: number): Set<number> {
  return (
    useLiveQuery(async () => {
      const rows = await db.customCollectionCards.where('cardId').equals(cardId).toArray()
      return new Set(rows.map((r) => r.collectionId))
    }, [cardId]) ?? new Set()
  )
}

/** cardId → Set de collectionIds, para toda la base local (usado en filtros de grid). */
export function useCardsByCollectionMap(): Map<number, Set<number>> {
  return (
    useLiveQuery(async () => {
      const rows = await db.customCollectionCards.toArray()
      const map = new Map<number, Set<number>>()
      for (const r of rows) {
        if (!map.has(r.cardId)) map.set(r.cardId, new Set())
        map.get(r.cardId)!.add(r.collectionId)
      }
      return map
    }) ?? new Map()
  )
}
