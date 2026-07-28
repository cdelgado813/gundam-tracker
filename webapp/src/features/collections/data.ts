import { db, type CustomCollectionColor } from '@/lib/db'

export async function createCustomCollection(
  name: string,
  color: CustomCollectionColor,
): Promise<number> {
  const now = Date.now()
  return (await db.customCollections.add({ name, color, createdAt: now, updatedAt: now })) as number
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
  await db.transaction('rw', db.customCollections, db.customCollectionCards, async () => {
    await db.customCollectionCards.where('collectionId').equals(id).delete()
    await db.customCollections.delete(id)
  })
}

/** Añade la carta si no estaba ya asignada; no falla si se repite. */
export async function addCardToCollection(collectionId: number, cardId: number): Promise<void> {
  const existing = await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .first()
  if (existing) return
  await db.customCollectionCards.add({ collectionId, cardId, addedAt: Date.now() })
}

export async function removeCardFromCollection(collectionId: number, cardId: number): Promise<void> {
  await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .delete()
}

export async function toggleCardInCollection(collectionId: number, cardId: number): Promise<boolean> {
  const existing = await db.customCollectionCards
    .where('[collectionId+cardId]')
    .equals([collectionId, cardId])
    .first()
  if (existing?.id != null) {
    await db.customCollectionCards.delete(existing.id)
    return false
  }
  await db.customCollectionCards.add({ collectionId, cardId, addedAt: Date.now() })
  return true
}
