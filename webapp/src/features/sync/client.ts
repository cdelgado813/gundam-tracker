import { decryptPayload, encryptPayload, type Envelope } from './crypto'
import type { Pairing } from './pairing'
import type { SyncPayload } from './payload'

/**
 * URL del relay (design.md D7): en desarrollo apunta al Worker local levantado con
 * `wrangler dev` (sin tocar ninguna cuenta real de Cloudflare); en producción, a la
 * URL pública del Worker desplegado, configurable por variable de entorno de build
 * porque no se conoce hasta el primer `wrangler deploy` de cada instalación.
 */
const WORKER_URL =
  (import.meta.env.VITE_SYNC_WORKER_URL as string | undefined) ??
  (import.meta.env.DEV ? 'http://localhost:8787' : '')

export function syncConfigured(): boolean {
  return WORKER_URL !== ''
}

/** Cifra y sube el estado actual. */
export async function push(pairing: Pairing, payload: SyncPayload): Promise<void> {
  const envelope = await encryptPayload(pairing.key, payload)
  const res = await fetch(`${WORKER_URL}/sync/${pairing.syncId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope),
  })
  if (!res.ok) throw new Error(`No se pudo sincronizar (${res.status}).`)
}

export type PullResult = { found: true; payload: SyncPayload } | { found: false }

/** Descarga y descifra el estado remoto. `found: false` si la sesión no existe (nunca escrita o caducada). */
export async function pull(pairing: Pairing): Promise<PullResult> {
  const res = await fetch(`${WORKER_URL}/sync/${pairing.syncId}`)
  if (res.status === 404) return { found: false }
  if (!res.ok) throw new Error(`No se pudo comprobar la sincronización (${res.status}).`)
  const envelope = (await res.json()) as Envelope
  const payload = await decryptPayload<SyncPayload>(pairing.key, envelope)
  return { found: true, payload }
}
