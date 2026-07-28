import Dexie, { type EntityTable } from 'dexie'

/** Condiciones reales de CardTrader (ver docs/api-notes.md) */
export type CardCondition =
  | 'Mint'
  | 'Near Mint'
  | 'Slightly Played'
  | 'Moderately Played'
  | 'Played'
  | 'Poor'

export type CardLanguage = 'en' | 'jp' | 'zh-CN'

export interface Setting {
  key: string
  value: unknown
}

export interface Expansion {
  id: number
  gameId: number
  code: string
  name: string
  /** nº de blueprints tipo carta cacheados; undefined = aún sin sincronizar */
  cardCount?: number
  syncedAt?: number
}

export interface Card {
  id: number // blueprint id
  expansionId: number
  name: string
  version: string | null // null | "Foil" | ...
  collectorNumber: string
  rarity: string
  imageUrlPreview: string | null
  imageUrlShow: string | null
  /** nombre normalizado en minúsculas para búsqueda */
  searchName: string
}

export interface PriceCache {
  blueprintId: number
  minCents: number | null
  minNearMintCents: number | null
  currency: string
  offersCount: number
  fetchedAt: number
}

export interface CollectionEntry {
  id?: number
  cardId: number
  expansionId: number
  quantity: number
  condition: CardCondition
  language: CardLanguage
  addedAt: number
  updatedAt: number
}

export interface WishlistEntry {
  id?: number
  cardId: number
  expansionId: number
  desiredQuantity: number
  addedAt: number
}

export interface TradeListItem {
  cardId: number
  quantity: number
  condition?: CardCondition
}

export interface TradeList {
  id?: number
  name: string
  /** alias del autor incluido al compartir (opcional) */
  authorAlias?: string
  items: TradeListItem[]
  /** 'own' = creada por el usuario; 'received' = importada de otro */
  kind: 'own' | 'received'
  createdAt: number
  updatedAt: number
}

export interface Backup {
  id?: number
  createdAt: number
  schemaVersion: number
  /** JSON.stringify del payload de backup (solo datos de usuario, sin catálogo) */
  payload: string
}

export class GundamDB extends Dexie {
  settings!: EntityTable<Setting, 'key'>
  expansions!: EntityTable<Expansion, 'id'>
  cards!: EntityTable<Card, 'id'>
  prices!: EntityTable<PriceCache, 'blueprintId'>
  collection!: EntityTable<CollectionEntry, 'id'>
  wishlist!: EntityTable<WishlistEntry, 'id'>
  tradeLists!: EntityTable<TradeList, 'id'>
  backups!: EntityTable<Backup, 'id'>

  constructor() {
    super('gundam-tracker')
    this.version(1).stores({
      settings: 'key',
      expansions: 'id, code',
      cards: 'id, expansionId, searchName, collectorNumber, rarity, [expansionId+collectorNumber]',
      prices: 'blueprintId, fetchedAt',
      collection: '++id, cardId, expansionId, [cardId+condition+language]',
      wishlist: '++id, &cardId, expansionId',
      tradeLists: '++id, kind, updatedAt',
      backups: '++id, createdAt',
    })
  }
}

export const db = new GundamDB()

/** Pide almacenamiento persistente para minimizar purgas del navegador (spec local-persistence-backup). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      const already = await navigator.storage.persisted()
      return already || (await navigator.storage.persist())
    }
  } catch {
    // entorno sin Storage API: seguimos sin persistencia garantizada
  }
  return false
}
