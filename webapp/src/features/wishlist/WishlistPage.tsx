import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Star } from 'lucide-react'
import { db } from '@/lib/db'
import { formatCents } from '@/features/catalog/prices'

type SortKey = 'name' | 'expansion' | 'price'

export function WishlistPage() {
  const [sort, setSort] = useState<SortKey>('name')

  const data = useLiveQuery(async () => {
    const rows = await db.wishlist.toArray()
    const cards = await db.cards.bulkGet(rows.map((r) => r.cardId))
    const expansions = new Map((await db.expansions.toArray()).map((e) => [e.id, e]))
    const prices = new Map((await db.prices.toArray()).map((p) => [p.blueprintId, p]))
    return rows
      .map((row, i) => ({ row, card: cards[i] }))
      .filter((x) => x.card != null)
      .map(({ row, card }) => ({
        row,
        card: card!,
        expansionName: expansions.get(card!.expansionId)?.name ?? '',
        priceCents: prices.get(card!.id)?.minCents ?? null,
      }))
  })

  if (!data) return null

  const sorted = [...data].sort((a, b) => {
    if (sort === 'name') return a.card.name.localeCompare(b.card.name)
    if (sort === 'expansion') return a.expansionName.localeCompare(b.expansionName)
    return (a.priceCents ?? Number.MAX_SAFE_INTEGER) - (b.priceCents ?? Number.MAX_SAFE_INTEGER)
  })

  const priced = data.filter((x) => x.priceCents != null)
  const totalCents = priced.reduce((s, x) => s + (x.priceCents ?? 0) * x.row.desiredQuantity, 0)

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">WISHLIST</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-hangar-700 bg-hangar-800 px-2 py-1.5 text-sm"
        >
          <option value="name">Por nombre</option>
          <option value="expansion">Por expansión</option>
          <option value="price">Por precio</option>
        </select>
      </header>

      {data.length > 0 && (
        <div className="mb-4 rounded-xl border border-hangar-800 bg-hangar-900 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-hangar-300">Coste estimado</span>
            <span className="font-display text-xl font-bold text-haro-400">
              {formatCents(totalCents)}
            </span>
          </div>
          <p className="mt-1 text-right text-xs text-hangar-300">
            basado en {priced.length} de {data.length} cartas con precio
          </p>
        </div>
      )}

      {data.length === 0 ? (
        <div className="py-16 text-center">
          <Star size={32} strokeWidth={1.5} className="mx-auto text-hangar-600" />
          <p className="mt-3 text-sm text-hangar-300">
            Tu wishlist está vacía. Marca cartas desde el{' '}
            <Link to="/" className="text-federation-400 underline">
              catálogo
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map(({ row, card, expansionName, priceCents }) => (
            <li key={row.id}>
              <Link
                to={`/card/${card.id}`}
                className="flex items-center gap-3 rounded-xl border border-hangar-800 bg-hangar-900 p-2.5 transition hover:border-hangar-600"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-hangar-800">
                  {card.imageUrlPreview && (
                    <img
                      src={card.imageUrlPreview}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-hangar-100">{card.name}</p>
                  <p className="truncate text-xs text-hangar-300">
                    {expansionName} · {card.collectorNumber}
                  </p>
                </div>
                <span className="shrink-0 font-display text-sm text-haro-400">
                  {formatCents(priceCents)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
