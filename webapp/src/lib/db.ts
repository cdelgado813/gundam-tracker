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

/** Tope de unidades por lista de wishlist (suma de cantidades); usado también por la migración v4. */
export const WISHLIST_LIST_MAX_UNITS = 100

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

export interface MarketOffer {
  priceCents: number
  quantity: number
  /** Texto libre tal como lo publica CardTrader; solo se muestra, no se tipa contra CardCondition. */
  condition: string | null
}

export interface LanguagePrice {
  minCents: number
  offersCount: number
  /** Las más baratas de ese idioma (hasta 5), ya ordenadas; ver scripts/sync-catalog.mjs. */
  offers?: MarketOffer[]
}

export interface PriceCache {
  blueprintId: number
  minCents: number | null
  minNearMintCents: number | null
  currency: string
  offersCount: number
  /** Desglose por idioma de carta; ausente en precios cacheados antes del desglose. */
  byLanguage?: Partial<Record<CardLanguage, LanguagePrice>>
  fetchedAt: number
}

export interface CollectionEntry {
  id?: number
  /** Identidad estable entre dispositivos (spec cross-device-sync); ajena al `id` local. */
  uuid: string
  cardId: number
  expansionId: number
  quantity: number
  condition: CardCondition
  language: CardLanguage
  addedAt: number
  updatedAt: number
}

export interface TradeListItem {
  cardId: number
  quantity: number
  condition?: CardCondition
}

export interface TradeList {
  id?: number
  /** Identidad estable entre dispositivos (spec cross-device-sync); ajena al `id` local. */
  uuid: string
  name: string
  /** alias del autor incluido al compartir (opcional) */
  authorAlias?: string
  items: TradeListItem[]
  /** 'own' = creada por el usuario; 'received' = importada de otro */
  kind: 'own' | 'received'
  createdAt: number
  updatedAt: number
}

export interface WishlistListItem {
  cardId: number
  quantity: number
}

export interface WishlistList {
  id?: number
  /** Identidad estable entre dispositivos (spec cross-device-sync); ajena al `id` local. */
  uuid: string
  name: string
  /** alias del autor incluido al compartir (opcional) */
  authorAlias?: string
  items: WishlistListItem[]
  /** 'own' = creada por el usuario; 'received' = importada de otro */
  kind: 'own' | 'received'
  createdAt: number
  updatedAt: number
}

/** Paleta fija de acentos ya definida en index.css — sin color picker libre. */
export const CUSTOM_COLLECTION_COLORS = [
  'zeon',
  'federation',
  'newtype',
  'haro',
] as const
export type CustomCollectionColor = (typeof CUSTOM_COLLECTION_COLORS)[number]

export interface CustomCollection {
  id?: number
  /** Identidad estable entre dispositivos (spec cross-device-sync); ajena al `id` local. */
  uuid: string
  name: string
  color: CustomCollectionColor
  createdAt: number
  updatedAt: number
}

export interface CustomCollectionCard {
  id?: number
  collectionId: number
  cardId: number
  addedAt: number
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
  wishlistLists!: EntityTable<WishlistList, 'id'>
  tradeLists!: EntityTable<TradeList, 'id'>
  backups!: EntityTable<Backup, 'id'>
  customCollections!: EntityTable<CustomCollection, 'id'>
  customCollectionCards!: EntityTable<CustomCollectionCard, 'id'>

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
    // v2: colecciones personalizadas (tabla de relación separada de `cards`
    // para sobrevivir a las resincronizaciones del catálogo, ver design.md D1)
    this.version(2).stores({
      customCollections: '++id, name',
      customCollectionCards: '++id, collectionId, cardId, [collectionId+cardId]',
    })
    // v3: `prices.byLanguage` (campo nuevo, sin índice ni migración: los registros
    // antiguos quedan sin desglose hasta el siguiente refresco)
    this.version(3).stores({})
    // v4: wishlist plana -> listas con nombre y tope de 100 unidades (design.md D1/D2).
    // La tabla vieja `wishlist` se lee y se elimina dentro de la misma transacción de
    // upgrade, siguiendo el patrón de renombrado de tablas documentado por Dexie.
    this.version(4)
      .stores({
        wishlistLists: '++id, kind, updatedAt',
        wishlist: null,
      })
      .upgrade(async (tx) => {
        const oldEntries = (await tx.table('wishlist').toArray()) as {
          cardId: number
          expansionId: number
          desiredQuantity: number
          addedAt: number
        }[]
        if (oldEntries.length === 0) return

        const sorted = [...oldEntries].sort((a, b) => a.addedAt - b.addedAt)
        const now = Date.now()
        const lists: WishlistList[] = []
        let current: WishlistList | null = null
        let currentUnits = 0
        let listIndex = 1

        for (const entry of sorted) {
          const quantity = Math.max(1, entry.desiredQuantity || 1)
          if (!current || currentUnits + quantity > WISHLIST_LIST_MAX_UNITS) {
            current = {
              // Se sobrescribe en la propia migración v5 (uuid llegó una versión
              // después); se rellena ya aquí solo para satisfacer el tipo.
              uuid: crypto.randomUUID(),
              name: listIndex === 1 ? 'Mi wishlist' : `Mi wishlist ${listIndex}`,
              items: [],
              kind: 'own',
              createdAt: now,
              updatedAt: now,
            }
            lists.push(current)
            listIndex += 1
            currentUnits = 0
          }
          current.items.push({ cardId: entry.cardId, quantity })
          currentUnits += quantity
        }

        await tx.table('wishlistLists').bulkAdd(lists)
      })
    // v5: `uuid` estable por fila en las tablas sincronizables (spec cross-device-sync
    // design D6) — identidad que sobrevive a que cada dispositivo tenga su propio `id`
    // local autoincremental. Se añade como índice único y se rellena en filas existentes.
    this.version(5)
      .stores({
        collection: '++id, cardId, expansionId, [cardId+condition+language], &uuid',
        wishlistLists: '++id, kind, updatedAt, &uuid',
        tradeLists: '++id, kind, updatedAt, &uuid',
        customCollections: '++id, name, &uuid',
      })
      .upgrade(async (tx) => {
        const tables = ['collection', 'wishlistLists', 'tradeLists', 'customCollections'] as const
        for (const name of tables) {
          await tx.table(name).toCollection().modify((row: { uuid?: string }) => {
            row.uuid = crypto.randomUUID()
          })
        }
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
