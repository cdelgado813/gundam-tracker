import type { TradeList, TradeListItem } from '@/lib/db'
import { decodeShareList, encodeShareList, shareUrlForList, MAX_SHARE_URL_LENGTH } from '@/lib/shareCodec'

export { MAX_SHARE_URL_LENGTH }

export function encodeTradeList(list: TradeList, alias?: string): string {
  return encodeShareList('t', list, alias)
}

export interface DecodedTradeList {
  name: string
  alias?: string
  items: TradeListItem[]
}

/** Lanza Error con mensaje legible si el payload no es válido. */
export function decodeTradeList(encoded: string): DecodedTradeList {
  const decoded = decodeShareList(encoded)
  return { name: decoded.name, alias: decoded.alias, items: decoded.items }
}

export function shareUrlFor(list: TradeList, alias?: string): string {
  return shareUrlForList('t', list, alias)
}
