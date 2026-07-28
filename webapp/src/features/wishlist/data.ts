import { db } from '@/lib/db'

export async function toggleWishlist(cardId: number, expansionId: number): Promise<boolean> {
  return db.transaction('rw', db.wishlist, async () => {
    const existing = await db.wishlist.where('cardId').equals(cardId).first()
    if (existing?.id != null) {
      await db.wishlist.delete(existing.id)
      return false
    }
    await db.wishlist.add({ cardId, expansionId, desiredQuantity: 1, addedAt: Date.now() })
    return true
  })
}

export async function isWishlisted(cardId: number): Promise<boolean> {
  return (await db.wishlist.where('cardId').equals(cardId).count()) > 0
}
