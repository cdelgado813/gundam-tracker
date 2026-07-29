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

/**
 * Marca en propiedad un lote de cartas: +1 copia Near Mint/en de cada una,
 * en una única transacción, fusionando con la entrada existente si ya la hay
 * (spec collection-management, acción masiva). Devuelve cuántas se procesaron.
 */
export async function addCardsToOwned(cardIds: number[]): Promise<number> {
  return db.transaction('rw', db.collection, db.cards, async () => {
    const cards = await db.cards.bulkGet(cardIds)
    const now = Date.now()
    let processed = 0
    for (const card of cards) {
      if (!card) continue // carta no sincronizada: se omite
      const existing = await db.collection
        .where('[cardId+condition+language]')
        .equals([card.id, 'Near Mint', 'en'])
        .first()
      if (existing?.id != null) {
        await db.collection.update(existing.id, {
          quantity: existing.quantity + 1,
          updatedAt: now,
        })
      } else {
        await db.collection.add({
          cardId: card.id,
          expansionId: card.expansionId,
          quantity: 1,
          condition: 'Near Mint',
          language: 'en',
          addedAt: now,
          updatedAt: now,
        })
      }
      processed++
    }
    return processed
  })
}

/** Cambia la cantidad de una entrada; a 0 la elimina. */
export async function setEntryQuantity(entry: CollectionEntry, quantity: number): Promise<void> {
  if (entry.id == null) return
  if (quantity <= 0) await db.collection.delete(entry.id)
  else await db.collection.update(entry.id, { quantity, updatedAt: Date.now() })
}
