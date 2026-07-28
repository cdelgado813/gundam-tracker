import { db, type CardCondition, type CardLanguage, type CollectionEntry } from '@/lib/db'

/** Suma de copias de una carta en la colección (todas las condiciones/idiomas). */
export async function ownedQuantity(cardId: number): Promise<number> {
  const entries = await db.collection.where('cardId').equals(cardId).toArray()
  return entries.reduce((sum, e) => sum + e.quantity, 0)
}

/** Añade copias; funde con la entrada existente de misma condición+idioma si la hay. */
export async function addToCollection(
  cardId: number,
  expansionId: number,
  quantity: number,
  condition: CardCondition,
  language: CardLanguage,
): Promise<void> {
  await db.transaction('rw', db.collection, async () => {
    const existing = await db.collection
      .where('[cardId+condition+language]')
      .equals([cardId, condition, language])
      .first()
    const now = Date.now()
    if (existing?.id != null) {
      await db.collection.update(existing.id, {
        quantity: existing.quantity + quantity,
        updatedAt: now,
      })
    } else {
      await db.collection.add({
        cardId,
        expansionId,
        quantity,
        condition,
        language,
        addedAt: now,
        updatedAt: now,
      })
    }
  })
}

/** Cambia la cantidad de una entrada; a 0 la elimina. */
export async function setEntryQuantity(entry: CollectionEntry, quantity: number): Promise<void> {
  if (entry.id == null) return
  if (quantity <= 0) await db.collection.delete(entry.id)
  else await db.collection.update(entry.id, { quantity, updatedAt: Date.now() })
}
