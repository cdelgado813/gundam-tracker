import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Card } from '@/lib/db'
import { useCatalogSync } from './sync'
import { useOwnedMap, useWishlistSet } from './hooks'
import { CardTile } from '@/ui/CardTile'
import { Button } from '@/ui/Button'

function SyncBanner() {
  const sync = useCatalogSync()
  const expansions = useLiveQuery(() => db.expansions.toArray()) ?? []
  const unsynced = expansions.filter((e) => e.syncedAt === undefined).length
  const nothingSynced = expansions.length === 0 || unsynced === expansions.length

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
        <span className="text-4xl">📡</span>
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

function SearchResults({ query }: { query: string }) {
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()
  const results =
    useLiveQuery(async () => {
      const q = query.toLowerCase()
      const byName = await db.cards.where('searchName').startsWith(q).limit(60).toArray()
      const byNumber = await db.cards
        .where('collectorNumber')
        .startsWithIgnoreCase(query)
        .limit(30)
        .toArray()
      const contains =
        byName.length < 20
          ? (await db.cards.filter((c) => c.searchName.includes(q)).limit(40).toArray()).filter(
              (c) => !c.searchName.startsWith(q),
            )
          : []
      const seen = new Set<number>()
      const merged: Card[] = []
      for (const c of [...byNumber, ...byName, ...contains]) {
        if (!seen.has(c.id)) {
          seen.add(c.id)
          merged.push(c)
        }
      }
      return merged
    }, [query]) ?? []

  if (results.length === 0)
    return <p className="py-10 text-center text-sm text-hangar-300">Sin resultados para «{query}»</p>

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {results.map((c) => (
        <CardTile key={c.id} card={c} ownedCount={owned.get(c.id)} wishlisted={wishlist.has(c.id)} />
      ))}
    </div>
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
  const allExpansions = useLiveQuery(() => db.expansions.orderBy('code').toArray()) ?? []
  // Algunos sets (p. ej. demo decks) no tienen cartas de tipo carta suelta: no aportan nada aquí.
  const expansions = allExpansions.filter((e) => e.cardCount !== 0)
  const ownedUniques = useOwnedUniquesByExpansion()
  const checkNew = useCatalogSync((s) => s.checkForNewExpansions)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    void checkNew().then(setNewCount)
  }, [checkNew])

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">CATÁLOGO</h1>
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
        <p className="mb-4 rounded-xl bg-federation-500/10 px-3 py-2 text-sm text-federation-400">
          ✨ {newCount} expansión{newCount > 1 ? 'es' : ''} nueva{newCount > 1 ? 's' : ''} disponible
          — usa «Descargar» para bajarla{newCount > 1 ? 's' : ''}.
        </p>
      )}

      {query.trim().length >= 2 ? (
        <SearchResults query={query.trim()} />
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
    </div>
  )
}
