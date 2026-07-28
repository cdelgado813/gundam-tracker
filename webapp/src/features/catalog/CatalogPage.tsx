import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bell, CloudDownload, ListChecks, X } from 'lucide-react'
import { db, type Card } from '@/lib/db'
import { useCatalogSync } from './sync'
import { useOwnedMap, useWishlistSet } from './hooks'
import { RarityFilterChips } from './RarityFilterChips'
import { BulkAssignBar } from '@/features/collections/BulkAssignBar'
import { CardTile } from '@/ui/CardTile'
import { Button } from '@/ui/Button'

function SyncBanner() {
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
          Sincronizando catálogo… {sync.done}/{sync.total}
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
          Reintentar
        </Button>
      </div>
    )
  }

  if (nothingSynced) {
    return (
      <div className="mb-4 rounded-xl border border-hangar-700 bg-hangar-900 p-6 text-center">
        <CloudDownload size={32} strokeWidth={1.5} className="mx-auto text-federation-400" />
        <h2 className="mt-2 font-display text-lg font-bold">Descarga el catálogo</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-hangar-300">
          Baja todas las expansiones del Gundam Card Game a este dispositivo para navegar y buscar
          incluso sin conexión.
        </p>
        <Button className="mt-4" onClick={() => sync.run()}>
          Sincronizar ahora
        </Button>
      </div>
    )
  }

  if (unsynced > 0) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-haro-400/30 bg-haro-400/10 p-3">
        <p className="text-sm text-haro-400">
          {unsynced} expansión{unsynced > 1 ? 'es' : ''} sin descargar
        </p>
        <Button variant="secondary" onClick={() => sync.run()}>
          Descargar
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
  selecting,
  selectedIds,
  onToggleSelect,
}: {
  query: string
  rarities: Set<string>
  selecting: boolean
  selectedIds: Set<number>
  onToggleSelect: (cardId: number) => void
}) {
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()
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
  const results = allMatches.slice(0, MAX_RESULTS)

  if (results.length === 0)
    return (
      <p className="py-10 text-center text-sm text-hangar-300">
        Sin resultados{query ? ` para «${query}»` : ''}.
      </p>
    )

  return (
    <>
      {allMatches.length > MAX_RESULTS && (
        <p className="mb-2 text-xs text-hangar-300">
          Mostrando los primeros {MAX_RESULTS} de {allMatches.length} resultados — afina la búsqueda
          para ver el resto.
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {results.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            ownedCount={owned.get(c.id)}
            wishlisted={wishlist.has(c.id)}
            selectionMode={selecting}
            selected={selectedIds.has(c.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </>
  )
}

/** expansionId → nº de cartas únicas poseídas (reactivo). */
function useOwnedUniquesByExpansion(): Map<number, number> {
  return (
    useLiveQuery(async () => {
      const entries = await db.collection.toArray()
      const perExp = new Map<number, Set<number>>()
      for (const e of entries) {
        if (!perExp.has(e.expansionId)) perExp.set(e.expansionId, new Set())
        perExp.get(e.expansionId)!.add(e.cardId)
      }
      return new Map([...perExp].map(([expId, set]) => [expId, set.size]))
    }) ?? new Map()
  )
}

export function CatalogPage() {
  const [query, setQuery] = useState('')
  const [selectedRarities, setSelectedRarities] = useState<Set<string>>(new Set())
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const allExpansions = useLiveQuery(() => db.expansions.orderBy('code').toArray()) ?? []
  // Algunos sets (p. ej. demo decks) no tienen cartas de tipo carta suelta: no aportan nada aquí.
  const expansions = allExpansions.filter((e) => e.cardCount !== 0)
  const ownedUniques = useOwnedUniquesByExpansion()
  const checkNew = useCatalogSync((s) => s.checkForNewExpansions)
  const [newCount, setNewCount] = useState(0)
  const showingResults = query.trim().length >= 2 || selectedRarities.size > 0

  useEffect(() => {
    void checkNew().then(setNewCount)
  }, [checkNew])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
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
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">CATÁLOGO</h1>
        {showingResults &&
          (selecting ? (
            <button
              onClick={stopSelecting}
              className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
            >
              <X size={14} /> Cancelar
            </button>
          ) : (
            <button
              onClick={() => setSelecting(true)}
              className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
            >
              <ListChecks size={14} /> Seleccionar
            </button>
          ))}
      </header>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o número (ST01-001)…"
        className="mb-4 w-full rounded-xl border border-hangar-700 bg-hangar-900 px-4 py-3 text-sm text-hangar-100 placeholder:text-hangar-300/50 focus:border-federation-400 focus:outline-none"
      />

      <SyncBanner />
      {newCount > 0 && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-federation-500/10 px-3 py-2 text-sm text-federation-400">
          <Bell size={14} />
          {newCount} expansión{newCount > 1 ? 'es' : ''} nueva{newCount > 1 ? 's' : ''} disponible
          — usa «Descargar» para bajarla{newCount > 1 ? 's' : ''}.
        </p>
      )}

      <RarityFilterChips selected={selectedRarities} onChange={setSelectedRarities} />

      {showingResults ? (
        <CardResults
          query={query.trim()}
          rarities={selectedRarities}
          selecting={selecting}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
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
                  {syncedCards != null ? `${ownedUniques.get(e.id) ?? 0}/${syncedCards}` : 'sin datos'}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {selecting && (
        <BulkAssignBar
          selectedIds={selectedIds}
          onDone={(msg) => {
            setToast(msg)
            stopSelecting()
          }}
          onCancel={stopSelecting}
        />
      )}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-hangar-700 px-4 py-2 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
