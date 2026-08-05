import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, CloudDownload, ListChecks, Search, X } from 'lucide-react'
import { db, type Card } from '@/lib/db'
import { useT } from '@/lib/useT'
import { useCatalogSync } from './sync'
import { isCardOwned, useOwnedMap, useTradeListSet, useWishlistSet } from './hooks'
import { RarityFilterChips } from './RarityFilterChips'
import { BulkAssignBar } from '@/features/collections/BulkAssignBar'
import { CardTile } from '@/ui/CardTile'
import { Button } from '@/ui/Button'
import { OwnershipFilter, type OwnershipFilterValue } from '@/ui/OwnershipFilter'
import { usePlaysetMode } from '@/lib/usePlaysetMode'

function SyncBanner() {
  const t = useT()
  const sync = useCatalogSync()
  const expansions = useLiveQuery(() => db.expansions.toArray()) ?? []
  const unsynced = expansions.filter((e) => e.syncedAt === undefined).length
  const nothingSynced = expansions.length === 0 || unsynced === expansions.length

  // Sin onboarding que lo posponga: la primera visita descarga el catálogo sola.
  useEffect(() => {
    if (nothingSynced && !sync.running && !sync.error) void sync.run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nothingSynced])

  if (sync.running) {
    const pct = sync.total ? Math.round((sync.done / sync.total) * 100) : 0
    return (
      <div className="mb-4 rounded-xl border border-federation-500/30 bg-federation-500/10 p-4">
        <p className="font-display text-sm font-semibold text-federation-400">
          {t('catalog.syncing', { done: sync.done, total: sync.total })}
        </p>
        {sync.currentName && <p className="mt-1 text-xs text-hangar-300">{sync.currentName}</p>}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hangar-800">
          <div
            className="h-full rounded-full bg-federation-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  if (sync.error) {
    return (
      <div className="mb-4 rounded-xl border border-zeon-500/30 bg-zeon-500/10 p-4">
        <p className="text-sm text-zeon-400">{sync.error}</p>
        <Button variant="danger" className="mt-2" onClick={() => sync.run()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  if (nothingSynced) {
    return (
      <div className="mb-4 rounded-xl border border-hangar-700 bg-hangar-900 p-6 text-center">
        <CloudDownload size={32} strokeWidth={1.5} className="mx-auto text-federation-400" />
        <h2 className="mt-2 font-display text-lg font-bold">{t('catalog.downloadTitle')}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-hangar-300">{t('catalog.downloadBody')}</p>
        <Button className="mt-4" onClick={() => sync.run()}>
          {t('catalog.syncNow')}
        </Button>
      </div>
    )
  }

  if (unsynced > 0) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-haro-400/30 bg-haro-400/10 p-3">
        <p className="text-sm text-haro-400">{t('catalog.pendingExpansions', { n: unsynced })}</p>
        <Button variant="secondary" onClick={() => sync.run()}>
          {t('catalog.download')}
        </Button>
      </div>
    )
  }
  return null
}

/** Búsqueda por texto (nombre/número) combinable con un filtro de rarezas (OR). */
function CardResults({
  query,
  rarities,
  ownership,
  selecting,
  selectedIds,
  onToggleSelect,
  onSelectAllChange,
}: {
  query: string
  rarities: Set<string>
  ownership: OwnershipFilterValue
  selecting: boolean
  selectedIds: Set<number>
  onToggleSelect: (cardId: number) => void
  onSelectAllChange: (ids: Set<number>) => void
}) {
  const t = useT()
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()
  const trades = useTradeListSet()
  const playsetMode = usePlaysetMode((s) => s.enabled)
  const MAX_RESULTS = 300
  const allMatches =
    useLiveQuery(async () => {
      let matches: Card[]
      if (query.length >= 2) {
        const q = query.toLowerCase()
        // Escaneo completo (catálogo ~2000 cartas, trivial): evita que un límite por
        // "empieza por" oculte coincidencias por subcadena que ordenan más tarde
        // alfabéticamente (p. ej. "Resource (C++)" detrás de decenas de "Resource").
        matches = await db.cards
          .filter((c) => c.searchName.includes(q) || c.collectorNumber.toLowerCase().includes(q))
          .toArray()
        matches.sort((a, b) => {
          const aStarts = a.searchName.startsWith(q) || a.collectorNumber.toLowerCase().startsWith(q)
          const bStarts = b.searchName.startsWith(q) || b.collectorNumber.toLowerCase().startsWith(q)
          if (aStarts !== bStarts) return aStarts ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      } else if (rarities.size > 0) {
        matches = await db.cards.where('rarity').anyOf([...rarities]).sortBy('name')
      } else {
        matches = []
      }

      return rarities.size > 0 ? matches.filter((c) => rarities.has(c.rarity)) : matches
    }, [query, rarities]) ?? []
  const ownershipMatches =
    ownership === 'all'
      ? allMatches
      : allMatches.filter((c) => (ownership === 'owned') === isCardOwned(owned.get(c.id) ?? 0, playsetMode))
  const results = ownershipMatches.slice(0, MAX_RESULTS)

  if (results.length === 0)
    return (
      <p className="py-10 text-center text-sm text-hangar-300">
        {query ? t('catalog.noResultsFor', { q: query }) : t('catalog.noResults')}
      </p>
    )

  const allResultsSelected = results.every((c) => selectedIds.has(c.id))

  return (
    <>
      {selecting && (
        <button
          onClick={() => onSelectAllChange(allResultsSelected ? new Set() : new Set(results.map((c) => c.id)))}
          className="mb-2 text-sm text-federation-400 hover:underline"
        >
          {allResultsSelected ? t('common.selectNone') : t('catalog.selectN', { n: results.length })}
        </button>
      )}
      {ownershipMatches.length > MAX_RESULTS && (
        <p className="mb-2 text-xs text-hangar-300">
          {t('catalog.truncated', { max: MAX_RESULTS, total: ownershipMatches.length })}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {results.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            ownedCount={owned.get(c.id)}
            wishlisted={wishlist.has(c.id)}
            inTradeList={trades.has(c.id)}
            selectionMode={selecting}
            selected={selectedIds.has(c.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </>
  )
}

export function CatalogPage() {
  const t = useT()
  // Filtros en la URL (con replace) para que «volver» desde una carta los restaure
  // vía historial en vez de perderlos con el estado del componente (spec card-catalog).
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  // useMemo: identidad estable de la Set entre renders para no relanzar el liveQuery de resultados
  const selectedRarities = useMemo(() => new Set(searchParams.getAll('r')), [searchParams])
  const updateFilters = (q: string, rarities: Set<string>) => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    for (const r of rarities) next.append('r', r)
    setSearchParams(next, { replace: true })
  }
  const setQuery = (q: string) => updateFilters(q, selectedRarities)
  const setSelectedRarities = (r: Set<string>) => updateFilters(query, r)
  const [ownership, setOwnership] = useState<OwnershipFilterValue>('all')
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const allExpansions = useLiveQuery(() => db.expansions.orderBy('code').toArray()) ?? []
  // Algunos sets (p. ej. demo decks) no tienen cartas de tipo carta suelta: no aportan nada aquí.
  const expansions = allExpansions.filter((e) => e.cardCount !== 0)
  const checkNew = useCatalogSync((s) => s.checkForNewExpansions)
  const [newCount, setNewCount] = useState(0)
  const showingResults = query.trim().length >= 2 || selectedRarities.size > 0

  useEffect(() => {
    void checkNew().then(setNewCount)
  }, [checkNew])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const toggleSelect = (cardId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const stopSelecting = () => {
    setSelecting(false)
    setSelectedIds(new Set())
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24">
      {/* Hero: el Catálogo está pensado para buscar (design D5) */}
      <header className="mb-5 pt-4 text-center">
        <div className="flex items-center justify-between">
          <span className="w-20" aria-hidden />
          <h1 className="font-display text-2xl font-bold tracking-widest text-hangar-100">
            {t('catalog.title')}
          </h1>
          <span className="w-20 text-right">
            {showingResults &&
              (selecting ? (
                <button
                  onClick={stopSelecting}
                  className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
                >
                  <X size={14} /> {t('common.cancel')}
                </button>
              ) : (
                <button
                  onClick={() => setSelecting(true)}
                  className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
                >
                  <ListChecks size={14} /> {t('common.select')}
                </button>
              ))}
          </span>
        </div>
        <p className="mt-1 text-sm text-hangar-300">
          {expansions.length > 0
            ? t('catalog.subtitle', { n: expansions.reduce((s, e) => s + (e.cardCount ?? 0), 0) })
            : t('catalog.subtitleEmpty')}
        </p>
        <div className="relative mx-auto mt-4 max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-hangar-300"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            className="w-full rounded-2xl border border-hangar-600 bg-hangar-900 py-3.5 pl-11 pr-4 text-base text-hangar-100 shadow-lg shadow-hangar-950/50 placeholder:text-hangar-300/50 focus:border-federation-400 focus:outline-none focus:ring-2 focus:ring-federation-500/20"
          />
        </div>
      </header>

      <SyncBanner />
      {newCount > 0 && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-federation-500/10 px-3 py-2 text-sm text-federation-400">
          <Bell size={14} />
          {t('catalog.newExpansions', { n: newCount })}
        </p>
      )}

      <RarityFilterChips selected={selectedRarities} onChange={setSelectedRarities} />
      {showingResults && (
        <div className="mb-3">
          <OwnershipFilter value={ownership} onChange={setOwnership} />
        </div>
      )}

      {showingResults ? (
        <CardResults
          query={query.trim()}
          rarities={selectedRarities}
          ownership={ownership}
          selecting={selecting}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAllChange={setSelectedIds}
        />
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {expansions.map((e) => {
            const syncedCards = e.cardCount
            return (
              <Link
                key={e.id}
                to={`/expansion/${e.id}`}
                className="flex items-center justify-between rounded-xl border border-hangar-800 bg-hangar-900 p-4 transition hover:border-hangar-600"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-hangar-100">{e.name}</p>
                  <p className="mt-0.5 font-mono text-xs uppercase text-hangar-300">{e.code}</p>
                </div>
                <span className="ml-3 shrink-0 rounded-lg bg-hangar-800 px-2 py-1 font-display text-xs text-hangar-300">
                  {syncedCards != null ? `${syncedCards} ${t('common.cards')}` : t('common.noData')}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {selecting && (
        // La selección se mantiene tras cada acción: puede querer marcar en propiedad
        // Y añadir a colección sobre la misma tanda sin volver a seleccionar.
        <BulkAssignBar selectedIds={selectedIds} onDone={setToast} onCancel={stopSelecting} />
      )}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-hangar-700 px-4 py-2 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
