import { db, type CustomCollectionColor } from '@/lib/db'
import { tombstone } from '@/features/sync/tombstones'

export async function createCustomCollection(
  name: string,
  color: CustomCollectionColor,
): Promise<number> {
  const now = Date.now()
  return (await db.customCollections.add({
    uuid: crypto.randomUUID(),
    name,
    color,
    createdAt: now,
    updatedAt: now,
  })) as number
}

export async function renameCustomCollection(id: number, name: string): Promise<void> {
  await db.customCollections.update(id, { name, updatedAt: Date.now() })
}

export async function recolorCustomCollection(
  id: number,
  color: CustomCollectionColor,
): Promise<void> {
  await db.customCollections.update(id, { color, updatedAt: Date.now() })
}

export async function deleteCustomCollection(id: number): Promise<void> {
  const [collection, cards] = await db.transaction(
    'rw',
    db.customCollections,
    db.customCollectionCards,
    async () => {
      const collection = await db.customCollections.get(id)
      const cards = await db.customCollectionCards.where('collectionId').equals(id).toArray()
      await db.customCollectionCards.where('collectionId').equals(id).delete()
      await db.customCollections.delete(id)
      return [collection, cards] as const
    },
  )
  await Promise.all(cards.map((c) => tombstone('customCollectionCards', c.uuid)))
  await tombstone('customCollections', collection?.uuid)
}

/** Añade la carta si no estaba ya asignada; no falla si se repite. */
export async function addCardToCollection(collectionId: number, cardId: number): Promise<void> {
  const existing = await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .first()
  if (existing) return
  await db.customCollectionCards.add({ uuid: crypto.randomUUID(), collectionId, cardId, addedAt: Date.now() })
}

/** Asigna varias cartas de golpe (selector masivo); ignora las que ya estuvieran asignadas. */
export async function addCardsToCollection(collectionId: number, cardIds: number[]): Promise<number> {
  return db.transaction('rw', db.customCollectionCards, async () => {
    const existing = await db.customCollectionCards.where('collectionId').equals(collectionId).toArray()
    const already = new Set(existing.map((e) => e.cardId))
    const now = Date.now()
    const toAdd = cardIds
      .filter((id) => !already.has(id))
      .map((cardId) => ({ uuid: crypto.randomUUID(), collectionId, cardId, addedAt: now }))
    if (toAdd.length > 0) await db.customCollectionCards.bulkAdd(toAdd)
    return toAdd.length
  })
}

export async function removeCardFromCollection(collectionId: number, cardId: number): Promise<void> {
  const existing = await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .first()
  if (!existing) return
  await db.customCollectionCards.delete(existing.id!)
  await tombstone('customCollectionCards', existing.uuid)
}

/** Quita varias cartas de una colección personalizada en lote (no toca propiedad ni otras colecciones). */
export async function removeCardsFromCollection(
  collectionId: number,
  cardIds: number[],
): Promise<void> {
  const removed = await db.transaction('rw', db.customCollectionCards, async () => {
    const rows = await db.customCollectionCards
      .where('[collectionId+cardId]')
      .anyOf(cardIds.map((cardId) => [collectionId, cardId]))
      .toArray()
    await db.customCollectionCards
      .where('[collectionId+cardId]')
      .anyOf(cardIds.map((cardId) => [collectionId, cardId]))
      .delete()
    return rows
  })
  await Promise.all(removed.map((r) => tombstone('customCollectionCards', r.uuid)))
}

export async function toggleCardInCollection(collectionId: number, cardId: number): Promise<boolean> {
  const existing = await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .first()
  if (existing?.id != null) {
    await db.customCollectionCards.delete(existing.id)
    await tombstone('customCollectionCards', existing.uuid)
    return false
  }
  await db.customCollectionCards.add({ uuid: crypto.randomUUID(), collectionId, cardId, addedAt: Date.now() })
  return true
}
