import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ListChecks, X } from 'lucide-react'
import { db } from '@/lib/db'
import { CardTile } from '@/ui/CardTile'
import { useOwnedMap, useWishlistSet } from './hooks'
import { BulkAssignBar } from '@/features/collections/BulkAssignBar'

export function ExpansionPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  // La atenuación de faltantes es exclusiva de la vista de Colección (ver design.md D3):
  // solo se activa cuando se llega aquí con ?from=collection.
  const dimMissing = searchParams.get('from') === 'collection'
  const expansionId = Number(id)
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const expansion = useLiveQuery(() => db.expansions.get(expansionId), [expansionId])
  const cards =
    useLiveQuery(
      () => db.cards.where('expansionId').equals(expansionId).sortBy('collectorNumber'),
      [expansionId],
    ) ?? []
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const visible = onlyMissing ? cards.filter((c) => !(owned.get(c.id) ?? 0)) : cards
  const ownedUniques = cards.filter((c) => (owned.get(c.id) ?? 0) > 0).length
  const pct = cards.length ? Math.round((ownedUniques / cards.length) * 100) : 0

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

  const allVisibleSelected = visible.length > 0 && visible.every((c) => selectedIds.has(c.id))
  const toggleSelectAll = () => {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(visible.map((c) => c.id)))
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24">
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <Link
            to={dimMissing ? '/collection' : '/'}
            className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
          >
            <ArrowLeft size={14} /> {dimMissing ? 'Colección' : 'Catálogo'}
          </Link>
          {cards.length > 0 &&
            (selecting ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-federation-400 hover:underline"
                >
                  {allVisibleSelected ? 'Ninguna' : 'Todas'}
                </button>
                <button
                  onClick={stopSelecting}
                  className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
                >
                  <X size={14} /> Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelecting(true)}
                className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
              >
                <ListChecks size={14} /> Seleccionar
              </button>
            ))}
        </div>
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
            selectionMode={selecting}
            selected={selectedIds.has(c.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
      {cards.length === 0 && (
        <p className="py-10 text-center text-sm text-hangar-300">
          Esta expansión aún no está descargada. Vuelve al catálogo y pulsa «Descargar».
        </p>
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
