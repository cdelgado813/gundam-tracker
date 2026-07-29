/**
 * Datos de catálogo y precios servidos como JSON estático, generados por
 * scripts/sync-catalog.mjs en CI con el token del propietario (nunca en el
 * navegador). Ningún visitante necesita autenticarse: nada de lo que se
 * sirve aquí es específico de una cuenta de CardTrader.
 */
export class StaticDataError extends Error {
  path: string
  status?: number
  constructor(path: string, status?: number) {
    super(`No se pudo cargar ${path}${status ? ` (HTTP ${status})` : ''}`)
    this.name = 'StaticDataError'
    this.path = path
    this.status = status
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(path)
  } catch {
    throw new StaticDataError(path) // sin conexión
  }
  if (!res.ok) throw new StaticDataError(path, res.status)
  return (await res.json()) as T
}

export interface StaticExpansion {
  id: number
  code: string
  name: string
  cardCount: number
}

export interface StaticCard {
  id: number
  expansionId: number
  name: string
  version: string | null
  collectorNumber: string
  rarity: string
  imageUrlPreview: string | null
  imageUrlShow: string | null
  searchName: string
}

export interface StaticPriceEntry {
  blueprintId: number
  minCents: number | null
  minNearMintCents: number | null
  currency: string
  offersCount: number
  /** Desglose por idioma de carta; ausente en datos publicados antes del desglose. */
  byLanguage?: Record<string, { minCents: number; offersCount: number }>
  fetchedAt: number
}

export interface StaticMeta {
  generatedAt: number
  expansionCount: number
  cardCount: number
}

export const fetchStaticExpansions = () => fetchJson<StaticExpansion[]>('/data/expansions.json')
export const fetchStaticCards = (expansionId: number) =>
  fetchJson<StaticCard[]>(`/data/cards/${expansionId}.json`)
export const fetchStaticPrices = (expansionId: number) =>
  fetchJson<StaticPriceEntry[]>(`/data/prices/${expansionId}.json`)
export const fetchStaticMeta = () => fetchJson<StaticMeta>('/data/meta.json')
