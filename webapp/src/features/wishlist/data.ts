import { db, WISHLIST_LIST_MAX_UNITS, type WishlistList } from '@/lib/db'

export { WISHLIST_LIST_MAX_UNITS }

export function wishlistListUnits(list: WishlistList): number {
  return list.items.reduce((sum, i) => sum + i.quantity, 0)
}

export async function createWishlistList(name: string): Promise<number> {
  const now = Date.now()
  return (await db.wishlistLists.add({
    uuid: crypto.randomUUID(),
    name,
    items: [],
    kind: 'own',
    createdAt: now,
    updatedAt: now,
  })) as number
}

export async function renameWishlistList(listId: number, name: string): Promise<void> {
  await db.wishlistLists.update(listId, { name, updatedAt: Date.now() })
}

export async function deleteWishlistList(listId: number): Promise<void> {
  await db.wishlistLists.delete(listId)
}

/**
 * Añade unidades a una lista respetando el tope de 100 (spec wishlist-lists).
 * Devuelve las unidades realmente añadidas (0 si la lista está llena).
 */
export async function addToWishlistList(
  listId: number,
  cardId: number,
  quantity: number,
): Promise<number> {
  return db.transaction('rw', db.wishlistLists, async () => {
    const list = await db.wishlistLists.get(listId)
    if (!list || list.kind !== 'own') return 0
    const room = WISHLIST_LIST_MAX_UNITS - wishlistListUnits(list)
    const toAdd = Math.min(room, quantity)
    if (toAdd <= 0) return 0
    const existing = list.items.find((i) => i.cardId === cardId)
    if (existing) existing.quantity += toAdd
    else list.items.push({ cardId, quantity: toAdd })
    await db.wishlistLists.update(listId, { items: list.items, updatedAt: Date.now() })
    return toAdd
  })
}

/**
 * Añade una unidad de cada carta a la lista, respetando el tope de 100.
 * Devuelve cuántas entraron y cuántas se quedaron fuera por falta de hueco.
 */
export async function addCardsToWishlistList(
  listId: number,
  cardIds: number[],
): Promise<{ added: number; skipped: number }> {
  return db.transaction('rw', db.wishlistLists, async () => {
    const list = await db.wishlistLists.get(listId)
    if (!list || list.kind !== 'own') return { added: 0, skipped: cardIds.length }
    let room = WISHLIST_LIST_MAX_UNITS - wishlistListUnits(list)
    let added = 0
    for (const cardId of cardIds) {
      if (room <= 0) break
      const existing = list.items.find((i) => i.cardId === cardId)
      if (existing) existing.quantity += 1
      else list.items.push({ cardId, quantity: 1 })
      room--
      added++
    }
    if (added > 0) await db.wishlistLists.update(listId, { items: list.items, updatedAt: Date.now() })
    return { added, skipped: cardIds.length - added }
  })
}

export async function removeFromWishlistList(listId: number, cardId: number): Promise<void> {
  await db.transaction('rw', db.wishlistLists, async () => {
    const list = await db.wishlistLists.get(listId)
    if (!list) return
    const items = list.items.filter((i) => i.cardId !== cardId)
    await db.wishlistLists.update(listId, { items, updatedAt: Date.now() })
  })
}

/** Quita una carta de todas las listas propias que la contengan (p.ej. al conseguirla). */
export async function removeCardFromAllOwnWishlistLists(cardId: number): Promise<number> {
  return db.transaction('rw', db.wishlistLists, async () => {
    const lists = await db.wishlistLists.where('kind').equals('own').toArray()
    let removedFrom = 0
    for (const list of lists) {
      if (!list.id) continue
      if (!list.items.some((i) => i.cardId === cardId)) continue
      const items = list.items.filter((i) => i.cardId !== cardId)
      await db.wishlistLists.update(list.id, { items, updatedAt: Date.now() })
      removedFrom++
    }
    return removedFrom
  })
}

/** Elimina cartas de una lista en bloque (selección múltiple). */
export async function removeCardsFromWishlistList(listId: number, cardIds: number[]): Promise<number> {
  return db.transaction('rw', db.wishlistLists, async () => {
    const list = await db.wishlistLists.get(listId)
    if (!list) return 0
    const toRemove = new Set(cardIds)
    const before = list.items.length
    const items = list.items.filter((i) => !toRemove.has(i.cardId))
    await db.wishlistLists.update(listId, { items, updatedAt: Date.now() })
    return before - items.length
  })
}
