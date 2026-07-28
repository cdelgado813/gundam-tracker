import { db, type CardCondition, type TradeList } from '@/lib/db'

export const TRADE_LIST_MAX_UNITS = 50

export function tradeListUnits(list: TradeList): number {
  return list.items.reduce((sum, i) => sum + i.quantity, 0)
}

export async function createTradeList(name: string): Promise<number> {
  const now = Date.now()
  return (await db.tradeLists.add({
    name,
    items: [],
    kind: 'own',
    createdAt: now,
    updatedAt: now,
  })) as number
}

/**
 * Añade unidades a una lista respetando el límite duro de 50 (spec trade-lists).
 * Devuelve las unidades realmente añadidas (0 si la lista está llena).
 */
export async function addToTradeList(
  listId: number,
  cardId: number,
  quantity: number,
  condition?: CardCondition,
): Promise<number> {
  return db.transaction('rw', db.tradeLists, async () => {
    const list = await db.tradeLists.get(listId)
    if (!list || list.kind !== 'own') return 0
    const room = TRADE_LIST_MAX_UNITS - tradeListUnits(list)
    const toAdd = Math.min(room, quantity)
    if (toAdd <= 0) return 0
    const existing = list.items.find((i) => i.cardId === cardId && i.condition === condition)
    if (existing) existing.quantity += toAdd
    else list.items.push({ cardId, quantity: toAdd, condition })
    await db.tradeLists.update(listId, { items: list.items, updatedAt: Date.now() })
    return toAdd
  })
}

export async function removeFromTradeList(listId: number, cardId: number, condition?: CardCondition) {
  await db.transaction('rw', db.tradeLists, async () => {
    const list = await db.tradeLists.get(listId)
    if (!list) return
    const items = list.items.filter((i) => !(i.cardId === cardId && i.condition === condition))
    await db.tradeLists.update(listId, { items, updatedAt: Date.now() })
  })
}
