import { db, type CollectionEntry, type CustomCollection, type TradeList, type WishlistList } from '@/lib/db'

/**
 * Payload sincronizado — distinto del de backup (`backup.ts`): aquí sí viaja `uuid`
 * (es la identidad que permite fusionar sin duplicar, design.md D6) y las tarjetas de
 * colecciones personalizadas, referenciadas por el uuid de su colección en vez de por
 * `collectionId` local (que difiere entre dispositivos).
 */
export interface SyncCustomCollectionCard {
  collectionUuid: string
  cardId: number
  addedAt: number
}

export interface SyncPayload {
  v: 1
  updatedAt: number
  collection: Omit<CollectionEntry, 'id'>[]
  wishlistLists: Omit<WishlistList, 'id'>[]
  tradeLists: Omit<TradeList, 'id'>[]
  customCollections: Omit<CustomCollection, 'id'>[]
  customCollectionCards: SyncCustomCollectionCard[]
}

export async function buildSyncPayload(): Promise<SyncPayload> {
  const [collection, wishlistLists, tradeLists, customCollections, customCollectionCards] =
    await Promise.all([
      db.collection.toArray(),
      db.wishlistLists.toArray(),
      db.tradeLists.toArray(),
      db.customCollections.toArray(),
      db.customCollectionCards.toArray(),
    ])
  const uuidByCollectionId = new Map(customCollections.map((c) => [c.id!, c.uuid]))
  const strip = <T extends { id?: number }>(rows: T[]) => rows.map(({ id: _id, ...rest }) => rest)

  return {
    v: 1,
    updatedAt: Date.now(),
    collection: strip(collection),
    wishlistLists: strip(wishlistLists),
    tradeLists: strip(tradeLists),
    customCollections: strip(customCollections),
    customCollectionCards: customCollectionCards
      .map((cc) => ({
        collectionUuid: uuidByCollectionId.get(cc.collectionId),
        cardId: cc.cardId,
        addedAt: cc.addedAt,
      }))
      .filter((cc): cc is SyncCustomCollectionCard => cc.collectionUuid != null),
  }
}
