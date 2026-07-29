import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ListChecks, X } from 'lucide-react'
import { db, type Card } from '@/lib/db'
import { CardTile } from '@/ui/CardTile'
import { useCardFilter } from '@/ui/CardListControls'
import { useOwnedMap, useWishlistSet } from '@/features/catalog/hooks'
import { BulkAssignBar } from '@/features/collections/BulkAssignBar'

/** Todas las cartas poseídas en un único grid (design D4). */
export function AllCardsPage() {
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()
  const cards =
    useLiveQuery(async () => {
      const entries = await db.collection.toArray()
      const ids = [...new Set(entries.map((e) => e.cardId))]
      const resolved = await db.cards.bulkGet(ids)
      return resolved
        .filter((c): c is Card => c != null)
        .sort((a, b) => a.collectorNumber.localeCompare(b.collectorNumber))
    }) ?? []
  const { filtered, controls } = useCardFilter(cards)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const totalCopies = [...owned.values()].reduce((s, n) => s + n, 0)

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

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const toggleSelectAll = () => {
    setSelectedIds(allVisibleSelected ? new Set() : new Set(filtered.map((c) => c.id)))
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-32">
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <Link
            to="/collection"
            className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
          >
            <ArrowLeft size={14} /> Colección
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
        <h1 className="mt-1 font-display text-xl font-bold text-hangar-100">Todas las cartas</h1>
        <p className="mt-0.5 text-sm text-hangar-300">
          {cards.length} únicas · {totalCopies} copias
        </p>
        <div className="mt-3">{controls}</div>
      </header>

      {cards.length === 0 ? (
        <p className="py-10 text-center text-sm text-hangar-300">
          Aún no tienes cartas en propiedad.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {filtered.map((c) => (
            <CardTile
              key={c.id}
              card={c}
              ownedCount={owned.get(c.id)}
              wishlisted={wishlist.has(c.id)}
              dimIfMissing
              selectionMode={selecting}
              selected={selectedIds.has(c.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {selecting && (
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
