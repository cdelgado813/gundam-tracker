import { fetchMarketplaceByBlueprint, fetchMarketplaceByExpansion } from '@/lib/api'
import { db, type PriceCache } from '@/lib/db'
import type { ApiMarketplaceProduct } from '@/lib/api'

export const PRICE_TTL_MS = 24 * 60 * 60 * 1000

function toPriceCache(blueprintId: number, offers: ApiMarketplaceProduct[]): PriceCache {
  // Las ofertas llegan ordenadas por precio ascendente (docs/api-notes.md)
  const nearMint = offers.find((o) => o.properties_hash['condition'] === 'Near Mint')
  return {
    blueprintId,
    minCents: offers[0]?.price_cents ?? null,
    minNearMintCents: nearMint?.price_cents ?? null,
    currency: offers[0]?.price_currency ?? 'EUR',
    offersCount: offers.length,
    fetchedAt: Date.now(),
  }
}

/** Precio de una carta: caché si es fresco; si no, red y actualiza. Offline → caché aunque esté viejo. */
export async function getPrice(blueprintId: number): Promise<PriceCache | null> {
  const cached = await db.prices.get(blueprintId)
  if (cached && Date.now() - cached.fetchedAt < PRICE_TTL_MS) return cached
  try {
    const res = await fetchMarketplaceByBlueprint(blueprintId)
    const fresh = toPriceCache(blueprintId, res[String(blueprintId)] ?? [])
    await db.prices.put(fresh)
    return fresh
  } catch {
    return cached ?? null
  }
}

/** Refresca precios de toda una expansión en una sola llamada (valoración por lotes, spec collection). */
export async function refreshExpansionPrices(expansionId: number): Promise<number> {
  const res = await fetchMarketplaceByExpansion(expansionId)
  const rows = Object.entries(res).map(([bpId, offers]) => toPriceCache(Number(bpId), offers))
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
