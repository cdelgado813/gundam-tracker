import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, ListChecks, Trash2, X } from 'lucide-react'
import { db } from '@/lib/db'
import { CardTile } from '@/ui/CardTile'
import { useCardFilter } from '@/ui/CardListControls'
import { useOwnedMap, useTradeListSet, useWishlistSet } from '@/features/catalog/hooks'
import { deleteCustomCollection } from './data'
import { collectionColorClasses } from './colors'
import { useT } from '@/lib/useT'
import { BulkAssignBar } from './BulkAssignBar'

/**
 * Una colección personalizada es, para el usuario, una colección propia: lo que importa
 * es cuántas de las cartas que ha añadido ya posee, igual que el progreso por expansión.
 */
export function CustomCollectionDetailPage() {
  const t = useT()
  const { id } = useParams()
  const navigate = useNavigate()
  const collectionId = Number(id)
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const collection = useLiveQuery(() => db.customCollections.get(collectionId), [collectionId])
  const cards =
    useLiveQuery(async () => {
      const rows = await db.customCollectionCards.where('collectionId').equals(collectionId).toArray()
      const resolved = await db.cards.bulkGet(rows.map((r) => r.cardId))
      return resolved.filter((c) => c != null).sort((a, b) => a.name.localeCompare(b.name))
    }, [collectionId]) ?? []
  const owned = useOwnedMap()
  const wishlist = useWishlistSet()
  const trades = useTradeListSet()
  const { filtered, controls } = useCardFilter(cards)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!collection) return null

  const ownedUniques = cards.filter((c) => (owned.get(c.id) ?? 0) > 0).length
  const pct = cards.length ? Math.round((ownedUniques / cards.length) * 100) : 0
  const visible = onlyMissing ? filtered.filter((c) => !(owned.get(c.id) ?? 0)) : filtered
  const colors = collectionColorClasses[collection.color]

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
          <Link to="/collection" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
            <ArrowLeft size={14} /> {t('nav.collection')}
          </Link>
          {cards.length > 0 &&
            (selecting ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-federation-400 hover:underline"
                >
                  {allVisibleSelected ? t('common.selectNone') : t('common.selectAll')}
                </button>
                <button
                  onClick={stopSelecting}
                  className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
                >
                  <X size={14} /> {t('common.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelecting(true)}
                className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
              >
                <ListChecks size={14} /> {t('common.select')}
              </button>
            ))}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-display text-xl font-bold text-hangar-100">
            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            {collection.name}
          </h1>
          <button
            aria-label={t('customCollection.deleteLabel')}
            onClick={() => {
              if (window.confirm(t('customCollection.deleteConfirm', { name: collection.name }))) {
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
            {t('customCollection.empty')}
          </p>
        )}

        {cards.length > 0 && (
          <>
            <div className="mt-3">{controls}</div>
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-hangar-300">
              <input
                type="checkbox"
                checked={onlyMissing}
                onChange={(e) => setOnlyMissing(e.target.checked)}
                className="accent-zeon-500"
              />
              {t('common.onlyMissing')}
            </label>
          </>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {visible.map((c) => (
          <CardTile
            key={c.id}
            card={c}
            ownedCount={owned.get(c.id)}
            wishlisted={wishlist.has(c.id)}
            inTradeList={trades.has(c.id)}
            dimIfMissing
            selectionMode={selecting}
            selected={selectedIds.has(c.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>

      {selecting && (
        // La selección se mantiene tras cada acción: puede querer marcar en propiedad
        // Y quitar de la colección sobre la misma tanda sin volver a seleccionar.
        <BulkAssignBar
          selectedIds={selectedIds}
          removeFromCollectionId={collectionId}
          onDone={setToast}
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
