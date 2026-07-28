import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import { CardTile } from '@/ui/CardTile'
import { useOwnedMap, useWishlistSet } from '@/features/catalog/hooks'
import { deleteCustomCollection } from './data'
import { collectionColorClasses } from './colors'

/**
 * Una colección personalizada es, para el usuario, una colección propia: lo que importa
 * es cuántas de las cartas que ha añadido ya posee, igual que el progreso por expansión.
 */
export function CustomCollectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const collectionId = Number(id)
  const [onlyMissing, setOnlyMissing] = useState(false)
  const collection = useLiveQuery(() => db.customCollections.get(collectionId), [collectionId])
  const cards =
    useLiveQuery(async () => {
      const rows = await db.customCollectionCards.where('collectionId').equals(collectionId).toArray()
      const resolved = await db.cards.bulkGet(rows.map((r) => r.cardId))
      return resolved.filter((c) => c != null).sort((a, b) => a.name.localeCompare(b.name))
    }, [collectionId]) ?? []
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()

  if (!collection) return null

  const ownedUniques = cards.filter((c) => (owned.get(c.id) ?? 0) > 0).length
  const pct = cards.length ? Math.round((ownedUniques / cards.length) * 100) : 0
  const visible = onlyMissing ? cards.filter((c) => !(owned.get(c.id) ?? 0)) : cards
  const colors = collectionColorClasses[collection.color]

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4">
        <Link to="/collection" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
          <ArrowLeft size={14} /> Colección
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-display text-xl font-bold text-hangar-100">
            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            {collection.name}
          </h1>
          <button
            aria-label="Eliminar colección"
            onClick={() => {
              if (window.confirm(`¿Eliminar la colección "${collection.name}"?`)) {
                void deleteCustomCollection(collectionId)
                navigate('/collection')
              }
            }}
            className="shrink-0 rounded-lg p-1.5 text-hangar-300 hover:bg-hangar-800 hover:text-zeon-400"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {cards.length > 0 ? (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hangar-800">
              <div className={`h-full rounded-full ${colors.dot}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="font-display text-xs text-hangar-300">
              {ownedUniques}/{cards.length} ({pct}%)
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-hangar-300">
            Aún no has añadido cartas. Hazlo desde el detalle de cualquier carta.
          </p>
        )}

        {cards.length > 0 && (
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
            dimIfMissing
          />
        ))}
      </div>
    </div>
  )
}
