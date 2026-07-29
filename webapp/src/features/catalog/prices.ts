import { fetchStaticPrices, type StaticPriceEntry } from '@/lib/staticData'
import { db, type CardLanguage, type LanguagePrice, type PriceCache } from '@/lib/db'
import type { TranslationKey } from '@/lib/i18n'

const CARD_LANGUAGES: CardLanguage[] = ['en', 'jp', 'zh-CN']

/** Normaliza el desglose publicado (claves libres) al tipado de idiomas conocidos. */
function toPriceCache(entry: StaticPriceEntry): PriceCache {
  const { byLanguage, ...rest } = entry
  if (!byLanguage) return rest
  const typed: Partial<Record<CardLanguage, LanguagePrice>> = {}
  for (const lang of CARD_LANGUAGES) {
    const value = byLanguage[lang]
    if (value) typed[lang] = value
  }
  return Object.keys(typed).length > 0 ? { ...rest, byLanguage: typed } : rest
}

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
  const rows = (await fetchStaticPrices(expansionId)).map(toPriceCache)
  await db.prices.bulkPut(rows)
  return rows.length
}

export interface ResolvedPrice {
  cents: number | null
  /** false = no había oferta en ese idioma y se usó el mínimo global (aproximación). */
  exact: boolean
}

/**
 * Precio aplicable a una copia según su idioma: el del idioma si existe oferta,
 * si no el mínimo global marcado como aproximado (design D4).
 */
export function priceForLanguage(
  price: PriceCache | undefined,
  language: CardLanguage,
): ResolvedPrice {
  if (!price) return { cents: null, exact: false }
  const exact = price.byLanguage?.[language]
  if (exact) return { cents: exact.minCents, exact: true }
  return { cents: price.minCents, exact: false }
}

/** Idiomas con oferta, ordenados de más barato a más caro. */
export function languagePrices(price: PriceCache | undefined): [CardLanguage, LanguagePrice][] {
  if (!price?.byLanguage) return []
  return (Object.entries(price.byLanguage) as [CardLanguage, LanguagePrice][]).sort(
    (a, b) => a[1].minCents - b[1].minCents,
  )
}

/**
 * Ficha pública de la carta en CardTrader, para comprobar precio real o comprar.
 * Formato verificado (HTTP 200 con blueprint real); único punto a tocar si cambia.
 */
export function cardTraderUrl(blueprintId: number): string {
  return `https://www.cardtrader.com/cards/${blueprintId}`
}

export function formatCents(cents: number | null | undefined, currency = 'EUR'): string {
  if (cents == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100)
}

/** Antigüedad como clave + parámetro, para que la traduzca quien la pinte. */
export function priceAge(fetchedAt: number): { key: TranslationKey; n: number } {
  const mins = Math.floor((Date.now() - fetchedAt) / 60000)
  if (mins < 60) return { key: 'time.minutes', n: mins || 1 }
  const hours = Math.floor(mins / 60)
  if (hours < 24) return { key: 'time.hours', n: hours }
  return { key: 'time.days', n: Math.floor(hours / 24) }
}
