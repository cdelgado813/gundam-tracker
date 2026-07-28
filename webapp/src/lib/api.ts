import { db } from '@/lib/db'
import { isJwtExpired } from '@/lib/jwt'

/** baseUrl configurable (D4): hoy llamada directa, cambiable sin tocar el resto de la app. */
export const API_BASE_URL = 'https://api.cardtrader.com/api/v2'

export class ApiAuthError extends Error {
  status: number
  constructor(status: number) {
    super(`Autenticación rechazada (${status})`)
    this.name = 'ApiAuthError'
    this.status = status
  }
}

export class ApiNetworkError extends Error {
  constructor(cause?: unknown) {
    super('Sin conexión o error de red')
    this.name = 'ApiNetworkError'
    this.cause = cause
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, body?: string) {
    super(`Error de API ${status}${body ? `: ${body.slice(0, 200)}` : ''}`)
    this.name = 'ApiError'
    this.status = status
  }
}

const TOKEN_KEY = 'jwt'

export async function getStoredToken(): Promise<string | null> {
  const row = await db.settings.get(TOKEN_KEY)
  return typeof row?.value === 'string' ? row.value : null
}

export async function storeToken(token: string): Promise<void> {
  await db.settings.put({ key: TOKEN_KEY, value: token.trim() })
}

export async function clearToken(): Promise<void> {
  await db.settings.delete(TOKEN_KEY)
}

type AuthFailureListener = () => void
const authFailureListeners = new Set<AuthFailureListener>()

/** La UI (modal de re-auth) se suscribe aquí; la capa API no conoce React. */
export function onAuthFailure(listener: AuthFailureListener): () => void {
  authFailureListeners.add(listener)
  return () => authFailureListeners.delete(listener)
}

function emitAuthFailure() {
  authFailureListeners.forEach((l) => l())
}

export interface RequestOptions {
  /** token explícito (p. ej. validación durante onboarding); por defecto el almacenado */
  token?: string
  /** si true, no dispara el flujo global de re-auth en 401/403 */
  silentAuthErrors?: boolean
  signal?: AbortSignal
}

export async function apiGet<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = opts.token ?? (await getStoredToken())
  if (!token || (opts.token === undefined && isJwtExpired(token))) {
    if (!opts.silentAuthErrors) emitAuthFailure()
    throw new ApiAuthError(401)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: opts.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiNetworkError(err)
  }

  if (res.status === 401 || res.status === 403) {
    if (!opts.silentAuthErrors) emitAuthFailure()
    throw new ApiAuthError(res.status)
  }
  if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => ''))
  return (await res.json()) as T
}

// ---- Endpoints tipados (ver docs/api-notes.md) ----

export interface ApiInfo {
  id: number
  user_id: number
  name: string
}

export interface ApiExpansion {
  id: number
  game_id: number
  code: string
  name: string
}

export interface ApiBlueprint {
  id: number
  name: string
  version: string | null
  game_id: number
  category_id: number
  expansion_id: number
  fixed_properties: { collector_number?: string; gundam_rarity?: string }
  image_url: string | null
  image: { show?: { url?: string }; preview?: { url?: string } } | null
}

export interface ApiMarketplaceProduct {
  id: number
  blueprint_id: number
  price_cents: number
  price_currency: string
  quantity: number
  properties_hash: Record<string, unknown>
}

export const GUNDAM_GAME_ID = 23
export const SINGLES_CATEGORY_ID = 272

export const fetchInfo = (opts?: RequestOptions) => apiGet<ApiInfo>('/info', opts)

export const fetchExpansions = (opts?: RequestOptions) =>
  apiGet<ApiExpansion[]>('/expansions', opts)

export const fetchBlueprints = (expansionId: number, opts?: RequestOptions) =>
  apiGet<ApiBlueprint[]>(`/blueprints/export?expansion_id=${expansionId}`, opts)

export const fetchMarketplaceByBlueprint = (blueprintId: number, opts?: RequestOptions) =>
  apiGet<Record<string, ApiMarketplaceProduct[]>>(
    `/marketplace/products?blueprint_id=${blueprintId}`,
    opts,
  )

export const fetchMarketplaceByExpansion = (expansionId: number, opts?: RequestOptions) =>
  apiGet<Record<string, ApiMarketplaceProduct[]>>(
    `/marketplace/products?expansion_id=${expansionId}`,
    opts,
  )
