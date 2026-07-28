import { fetchStaticPrices } from '@/lib/staticData'
import { db, type PriceCache } from '@/lib/db'

/** Los precios se refrescan por CI (ver scripts/sync-catalog.mjs); TTL local generoso. */
export const PRICE_TTL_MS = 12 * 60 * 60 * 1000

/** Precio de una carta: caché si es fresco; si no, descarga los precios de toda su expansión. */
export async function getPrice(blueprintId: number): Promise<PriceCache | null> {
  const cached = await db.prices.get(blueprintId)
  if (cached && Date.now() - cached.fetchedAt < PRICE_TTL_MS) return cached

  const card = await db.cards.get(blueprintId)
  if (!card) return cached ?? null
  try {
    await refreshExpansionPrices(card.expansionId)
    return (await db.prices.get(blueprintId)) ?? cached ?? null
  } catch {
    return cached ?? null
  }
}

/** Refresca los precios de toda una expansión en una sola petición (valoración por lotes). */
export async function refreshExpansionPrices(expansionId: number): Promise<number> {
  const rows = await fetchStaticPrices(expansionId)
  await db.prices.bulkPut(rows)
  return rows.length
}

export function formatCents(cents: number | null | undefined, currency = 'EUR'): string {
  if (cents == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100)
}

export function priceAge(fetchedAt: number): string {
  const mins = Math.floor((Date.now() - fetchedAt) / 60000)
  if (mins < 60) return `hace ${mins || 1} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}
