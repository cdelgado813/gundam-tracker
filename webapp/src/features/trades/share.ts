import { deflateSync, inflateSync, strToU8, strFromU8 } from 'fflate'
import type { CardCondition, TradeList, TradeListItem } from '@/lib/db'

/** Formato versionado del payload compartido (design D5). Sin datos ajenos a la lista. */
interface SharePayloadV1 {
  v: 1
  name: string
  alias?: string
  items: { b: number; q: number; c?: number }[]
}

const CONDITION_CODES: CardCondition[] = [
  'Mint',
  'Near Mint',
  'Slightly Played',
  'Moderately Played',
  'Played',
  'Poor',
]

export const MAX_SHARE_URL_LENGTH = 2000

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const byte of bytes) bin += String.fromCharCode(byte)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))
  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0))
}

export function encodeTradeList(list: TradeList, alias?: string): string {
  const payload: SharePayloadV1 = {
    v: 1,
    name: list.name,
    ...(alias ? { alias } : {}),
    items: list.items.map((i) => ({
      b: i.cardId,
      q: i.quantity,
      ...(i.condition ? { c: CONDITION_CODES.indexOf(i.condition) } : {}),
    })),
  }
  return toBase64Url(deflateSync(strToU8(JSON.stringify(payload))))
}

export interface DecodedTradeList {
  name: string
  alias?: string
  items: TradeListItem[]
}

/** Lanza Error con mensaje legible si el payload no es válido. */
export function decodeTradeList(encoded: string): DecodedTradeList {
  let payload: SharePayloadV1
  try {
    payload = JSON.parse(strFromU8(inflateSync(fromBase64Url(encoded)))) as SharePayloadV1
  } catch {
    throw new Error('El enlace no contiene una lista válida (¿está cortado?).')
  }
  if (payload.v !== 1 || !Array.isArray(payload.items))
    throw new Error(`Versión de lista no soportada. Actualiza la app.`)
  return {
    name: String(payload.name ?? 'Lista recibida'),
    alias: payload.alias,
    items: payload.items.map((i) => ({
      cardId: Number(i.b),
      quantity: Math.max(1, Number(i.q) || 1),
      condition: i.c != null ? CONDITION_CODES[i.c] : undefined,
    })),
  }
}

export function shareUrlFor(list: TradeList, alias?: string): string {
  const base = `${location.origin}${location.pathname}`
  return `${base}#/t/${encodeTradeList(list, alias)}`
}
