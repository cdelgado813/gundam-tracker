import type { WishlistList, WishlistListItem } from '@/lib/db'
import { decodeShareList, encodeShareList, shareUrlForList, MAX_SHARE_URL_LENGTH } from '@/lib/shareCodec'

export { MAX_SHARE_URL_LENGTH }

export function encodeWishlistList(list: WishlistList, alias?: string): string {
  return encodeShareList('w', list, alias)
}

export interface DecodedWishlistList {
  name: string
  alias?: string
  items: WishlistListItem[]
}

/** Lanza Error con mensaje legible si el payload no es válido. */
export function decodeWishlistList(encoded: string): DecodedWishlistList {
  const decoded = decodeShareList(encoded)
  return {
    name: decoded.name,
    alias: decoded.alias,
    items: decoded.items.map((i) => ({ cardId: i.cardId, quantity: i.quantity })),
  }
}

export function shareUrlFor(list: WishlistList, alias?: string): string {
  return shareUrlForList('w', list, alias)
}
