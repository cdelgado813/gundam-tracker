import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Package, RotateCw } from 'lucide-react'
import { db, type CustomCollection } from '@/lib/db'
import { formatCents, refreshExpansionPrices } from '@/features/catalog/prices'
import { collectionColorClasses } from '@/features/collections/colors'
import { Button } from '@/ui/Button'

interface CustomCollectionStats {
  collection: CustomCollection
  total: number
  ownedUniques: number
}

function useCustomCollectionStats() {
  return useLiveQuery(async () => {
    const [collections, assignments, owned] = await Promise.all([
      db.customCollections.orderBy('name').toArray(),
      db.customCollectionCards.toArray(),
      db.collection.toArray(),
    ])
    const ownedCardIds = new Set(owned.map((e) => e.cardId))
    const byCollection = new Map<number, number[]>()
    for (const a of assignments) {
      if (!byCollection.has(a.collectionId)) byCollection.set(a.collectionId, [])
      byCollection.get(a.collectionId)!.push(a.cardId)
    }
    const stats: CustomCollectionStats[] = collections.map((c) => {
      const cardIds = byCollection.get(c.id!) ?? []
      return {
        collection: c,
        total: cardIds.length,
        ownedUniques: cardIds.filter((id) => ownedCardIds.has(id)).length,
      }
    })
    return stats
  })
}

function CustomCollectionsSection() {
  const stats = useCustomCollectionStats()
  if (!stats || stats.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-hangar-300">
        Mis colecciones
      </h2>
      <div className="flex flex-col gap-2">
        {stats.map(({ collection, total, ownedUniques }) => {
          const pct = total ? Math.round((ownedUniques / total) * 100) : 0
          const colors = collectionColorClasses[collection.color]
          return (
            <Link
              key={collection.id}
              to={`/collections/${collection.id}`}
              className="rounded-xl border border-hangar-800 bg-hangar-900 p-4 transition hover:border-hangar-600"
            >
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 truncate font-semibold text-hangar-100">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                  {collection.name}
                </p>
                <span className="ml-3 shrink-0 font-display text-xs text-hangar-300">
                  {total ? `${ownedUniques}/${total} (${pct}%)` : 'sin cartas'}
                </span>
              </div>
              {total > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hangar-800">
                  <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

interface ExpansionStats {
  id: number
  name: string
  code: string
  total: number | undefined
  ownedUniques: number
  copies: number
}

function useCollectionStats() {
  return useLiveQuery(async () => {
    const [entries, expansions, prices] = await Promise.all([
      db.collection.toArray(),
      db.expansions.toArray(),
      db.prices.toArray(),
    ])
    const priceMap = new Map(prices.map((p) => [p.blueprintId, p]))

    const perExp = new Map<number, { uniques: Set<number>; copies: number }>()
    let totalCopies = 0
    const uniqueCards = new Set<number>()
    let valuedCents = 0
    let valuedCards = 0

    for (const e of entries) {
      if (!perExp.has(e.expansionId)) perExp.set(e.expansionId, { uniques: new Set(), copies: 0 })
      const s = perExp.get(e.expansionId)!
      s.uniques.add(e.cardId)
      s.copies += e.quantity
      totalCopies += e.quantity
      uniqueCards.add(e.cardId)
      const p = priceMap.get(e.cardId)
      if (p?.minCents != null) {
        valuedCents += p.minCents * e.quantity
        valuedCards++
      }
    }

    const stats: ExpansionStats[] = expansions
      .filter((x) => perExp.has(x.id))
      .map((x) => ({
        id: x.id,
        name: x.name,
        code: x.code,
        total: x.cardCount,
        ownedUniques: perExp.get(x.id)!.uniques.size,
        copies: perExp.get(x.id)!.copies,
      }))
      .sort((a, b) => a.code.localeCompare(b.code))

    return {
      stats,
      totalCopies,
      totalUniques: uniqueCards.size,
      valuedCents,
      valuedCards,
      expansionIds: [...perExp.keys()],
    }
  })
}

export function CollectionPage() {
  const data = useCollectionStats()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null)

  const refreshPrices = async () => {
    if (!data || refreshing) return
    setRefreshing(true)
    setRefreshMsg(null)
    try {
      for (const expId of data.expansionIds) {
        await refreshExpansionPrices(expId)
      }
      setRefreshMsg('Precios actualizados')
    } catch {
      setRefreshMsg('No se pudieron actualizar los precios (¿sin conexión?)')
    } finally {
      setRefreshing(false)
    }
  }

  if (!data) return null
  const { stats, totalCopies, totalUniques, valuedCents, valuedCards } = data

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4">
        <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">COLECCIÓN</h1>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-3 text-center">
            <p className="font-display text-2xl font-bold text-hangar-100">{totalUniques}</p>
            <p className="text-xs text-hangar-300">únicas</p>
          </div>
          <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-3 text-center">
            <p className="font-display text-2xl font-bold text-hangar-100">{totalCopies}</p>
            <p className="text-xs text-hangar-300">copias</p>
          </div>
          <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-3 text-center">
            <p className="font-display text-2xl font-bold text-haro-400">
              {formatCents(valuedCents)}
            </p>
            <p className="text-xs text-hangar-300">
              basado en {valuedCards} de {totalUniques}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <Button variant="secondary" onClick={refreshPrices} disabled={refreshing} className="gap-1.5">
            <RotateCw size={14} className={refreshing ? 'animate-spin' : undefined} />
            {refreshing ? 'Actualizando…' : 'Actualizar precios'}
          </Button>
          {refreshMsg && <span className="text-xs text-hangar-300">{refreshMsg}</span>}
        </div>
      </header>

      {totalUniques > 0 && (
        <Link
          to="/collection/all"
          className="mb-6 flex items-center justify-between rounded-xl border border-federation-500/30 bg-federation-500/10 p-4 transition hover:border-federation-500/60"
        >
          <p className="font-semibold text-hangar-100">Todas las cartas</p>
          <span className="ml-3 shrink-0 font-display text-xs text-federation-400">
            {totalUniques} únicas · {totalCopies} copias
          </span>
        </Link>
      )}

      <CustomCollectionsSection />

      {stats.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={32} strokeWidth={1.5} className="mx-auto text-hangar-600" />
          <p className="mt-3 text-sm text-hangar-300">
            Aún no tienes cartas. Añádelas desde el{' '}
            <Link to="/" className="text-federation-400 underline">
              catálogo
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h2 className="mb-1 font-display text-xs font-bold uppercase tracking-widest text-hangar-300">
            Por expansión
          </h2>
          {stats.map((s) => {
            const pct = s.total ? Math.round((s.ownedUniques / s.total) * 100) : 0
            return (
              <Link
                key={s.id}
                to={`/expansion/${s.id}?from=collection`}
                className="rounded-xl border border-hangar-800 bg-hangar-900 p-4 transition hover:border-hangar-600"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold text-hangar-100">{s.name}</p>
                  <span className="ml-3 shrink-0 font-display text-xs text-hangar-300">
                    {s.ownedUniques}/{s.total ?? '?'} ({pct}%)
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hangar-800">
                  <div className="h-full rounded-full bg-newtype-400" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-hangar-300">{s.copies} copias</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
