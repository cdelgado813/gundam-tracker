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

/** Añade en lote a la wishlist; omite las que ya estaban. Devuelve cuántas se añadieron. */
export async function addCardsToWishlist(cardIds: number[]): Promise<number> {
  return db.transaction('rw', db.wishlist, db.cards, async () => {
    const existing = new Set((await db.wishlist.toArray()).map((w) => w.cardId))
    const pending = cardIds.filter((id) => !existing.has(id))
    if (pending.length === 0) return 0
    const cards = await db.cards.bulkGet(pending)
    const now = Date.now()
    const rows = cards
      .filter((c) => c != null)
      .map((c) => ({ cardId: c.id, expansionId: c.expansionId, desiredQuantity: 1, addedAt: now }))
    await db.wishlist.bulkAdd(rows)
    return rows.length
  })
}

/** Quita en lote de la wishlist. Devuelve cuántas se quitaron. */
export async function removeCardsFromWishlist(cardIds: number[]): Promise<number> {
  return db.transaction('rw', db.wishlist, async () => {
    const rows = await db.wishlist.where('cardId').anyOf(cardIds).toArray()
    await db.wishlist.bulkDelete(rows.map((r) => r.id!))
    return rows.length
  })
}

export async function isWishlisted(cardId: number): Promise<boolean> {
  return (await db.wishlist.where('cardId').equals(cardId).count()) > 0
}
