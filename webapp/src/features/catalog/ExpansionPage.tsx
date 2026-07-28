import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { CardTile } from '@/ui/CardTile'
import { useOwnedMap, useWishlistSet } from './hooks'

export function ExpansionPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  // La atenuación de faltantes es exclusiva de la vista de Colección (ver design.md D3):
  // solo se activa cuando se llega aquí con ?from=collection.
  const dimMissing = searchParams.get('from') === 'collection'
  const expansionId = Number(id)
  const [onlyMissing, setOnlyMissing] = useState(false)
  const expansion = useLiveQuery(() => db.expansions.get(expansionId), [expansionId])
  const cards =
    useLiveQuery(
      () => db.cards.where('expansionId').equals(expansionId).sortBy('collectorNumber'),
      [expansionId],
    ) ?? []
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()

  const visible = onlyMissing ? cards.filter((c) => !(owned.get(c.id) ?? 0)) : cards
  const ownedUniques = cards.filter((c) => (owned.get(c.id) ?? 0) > 0).length
  const pct = cards.length ? Math.round((ownedUniques / cards.length) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4">
        <Link
          to={dimMissing ? '/collection' : '/'}
          className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
        >
          <ArrowLeft size={14} /> {dimMissing ? 'Colección' : 'Catálogo'}
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold text-hangar-100">{expansion?.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hangar-800">
            <div className="h-full rounded-full bg-newtype-400" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-display text-xs text-hangar-300">
            {ownedUniques}/{cards.length} ({pct}%)
          </span>
        </div>
        {dimMissing && (
          <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-sm text-hangar-300">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
              className="accent-zeon-500"
            />
            Solo faltantes
          </label>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {visible.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            ownedCount={owned.get(c.id)}
            wishlisted={wishlist.has(c.id)}
            dimIfMissing={dimMissing}
          />
        ))}
      </div>
      {cards.length === 0 && (
        <p className="py-10 text-center text-sm text-hangar-300">
          Esta expansión aún no está descargada. Vuelve al catálogo y pulsa «Descargar».
        </p>
      )}
    </div>
  )
}
