import { useState } from 'react'
import {
  FolderMinus,
  FolderPlus,
  PackageMinus,
  PackagePlus,
  Plus,
  Repeat,
  Star,
  StarOff,
  X,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, CUSTOM_COLLECTION_COLORS, type CustomCollectionColor } from '@/lib/db'
import { Button } from '@/ui/Button'
import { addCardsToOwned, removeCardsFromOwned } from '@/features/collection/data'
import {
  addCardsToWishlistList,
  createWishlistList,
  removeCardsFromWishlistList,
  wishlistListUnits,
  WISHLIST_LIST_MAX_UNITS,
} from '@/features/wishlist/data'
import { addCardsToTradeList, createTradeList, tradeListUnits, TRADE_LIST_MAX_UNITS } from '@/features/trades/data'
import { useCustomCollections } from './hooks'
import { addCardsToCollection, createCustomCollection, removeCardsFromCollection } from './data'
import { collectionColorClasses } from './colors'
import { useT } from '@/lib/useT'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-hangar-300">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  )
}

function ActionButton({
  Icon,
  label,
  danger,
  disabled,
  wide,
  onClick,
}: {
  Icon: typeof PackagePlus
  label: string
  danger?: boolean
  disabled?: boolean
  wide?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 ${
        danger
          ? 'border-zeon-500/30 text-zeon-400 hover:bg-zeon-500/10'
          : 'border-hangar-600 text-hangar-100 hover:bg-hangar-700'
      } ${wide ? 'col-span-2' : ''}`}
    >
      <Icon size={16} className="shrink-0" />
      {label}
    </button>
  )
}

/**
 * Hoja inferior del modo selección: cabecera con recuento y cierre, y las acciones
 * agrupadas por eje — propiedad, colecciones, wishlist e intercambio. Cada eje ofrece
 * añadir y quitar donde tiene sentido. Las acciones destructivas piden confirmación.
 * La hoja no se cierra tras cada acción para poder encadenarlas sobre la misma selección.
 */
export function BulkAssignBar({
  selectedIds,
  onDone,
  onCancel,
  removeFromCollectionId,
  removeFromWishlistListId,
}: {
  selectedIds: Set<number>
  onDone: (msg: string) => void
  onCancel: () => void
  removeFromCollectionId?: number
  removeFromWishlistListId?: number
}) {
  const t = useT()
  const collections = useCustomCollections()
  const tradeLists = useLiveQuery(() => db.tradeLists.where('kind').equals('own').toArray()) ?? []
  const wishlistLists = useLiveQuery(() => db.wishlistLists.where('kind').equals('own').toArray()) ?? []
  const [panel, setPanel] = useState<'collections' | 'trades' | 'wishlists' | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<CustomCollectionColor>('federation')
  const [creatingList, setCreatingList] = useState(false)
  const [listName, setListName] = useState('')
  const [justCreatedIds, setJustCreatedIds] = useState<number[] | null>(null)

  const ids = [...selectedIds]
  const n = selectedIds.size
  const none = n === 0
  const togglePanel = (p: 'collections' | 'trades' | 'wishlists') => {
    setPanel(panel === p ? null : p)
    setCreatingList(false)
    setListName('')
    setJustCreatedIds(null)
  }

  const markOwned = async () => {
    const done = await addCardsToOwned(ids)
    onDone(t('bulk.resultAddedCopies', { n: done }))
  }

  const unmarkOwned = async () => {
    if (!window.confirm(t('bulk.confirmRemoveCopy', { n }))) return
    const done = await removeCardsFromOwned(ids)
    onDone(
      done > 0 ? t('bulk.resultRemovedCopies', { n: done }) : t('bulk.resultNoneOwned'),
    )
  }

  const assignWishlistList = async (listId: number) => {
    const { added, skipped } = await addCardsToWishlistList(listId, ids)
    onDone(
      skipped > 0
        ? t('bulk.resultWishlistPartial', { added, skipped, max: WISHLIST_LIST_MAX_UNITS })
        : t('bulk.resultAddedWishlist', { n: added }),
    )
    setPanel(null)
  }

  const removeFromWishlist = async () => {
    if (removeFromWishlistListId == null) return
    if (!window.confirm(t('bulk.confirmRemoveWishlist', { n }))) return
    await removeCardsFromWishlistList(removeFromWishlistListId, ids)
    onDone(t('bulk.resultRemovedWishlist', { n }))
  }

  const assignCollection = async (collectionId: number) => {
    const added = await addCardsToCollection(collectionId, ids)
    onDone(added > 0 ? t('bulk.resultAddedCollection', { n: added }) : t('bulk.resultAllInCollection'))
    setPanel(null)
  }

  const assignTradeList = async (listId: number) => {
    const { added, skipped } = await addCardsToTradeList(listId, ids)
    onDone(
      skipped > 0
        ? t('bulk.resultTradePartial', { added, skipped, max: TRADE_LIST_MAX_UNITS })
        : t('bulk.resultAddedTrade', { n: added }),
    )
    setPanel(null)
  }

  const removeFromCollection = async () => {
    if (removeFromCollectionId == null) return
    if (!window.confirm(t('bulk.confirmRemoveCollection', { n }))) return
    await removeCardsFromCollection(removeFromCollectionId, ids)
    onDone(t('bulk.resultRemovedCollection', { n }))
  }

  const createAndAssign = async () => {
    if (!name.trim()) return
    const id = await createCustomCollection(name.trim(), color)
    const createdIds = [...ids]
    const added = await addCardsToCollection(id, createdIds)
    onDone(added > 0 ? t('bulk.resultAddedCollection', { n: added }) : t('bulk.resultAllInCollection'))
    setName('')
    setCreating(false)
    // No se cierra el panel: se pasa al paso de confirmación de "también en propiedad"
    // (spec custom-collections) — crear ≠ poseer, y eso no siempre queda claro.
    setJustCreatedIds(createdIds)
  }

  const confirmMarkOwnedAfterCreate = async () => {
    if (!justCreatedIds) return
    const done = await addCardsToOwned(justCreatedIds)
    onDone(t('bulk.resultAddedCopies', { n: done }))
    setJustCreatedIds(null)
    setPanel(null)
  }

  const dismissMarkOwnedAfterCreate = () => {
    setJustCreatedIds(null)
    setPanel(null)
  }

  const createAndAssignWishlist = async () => {
    if (!listName.trim()) return
    const id = await createWishlistList(listName.trim())
    await assignWishlistList(id)
    setListName('')
    setCreatingList(false)
  }

  const createAndAssignTrade = async () => {
    if (!listName.trim()) return
    const id = await createTradeList(listName.trim())
    await assignTradeList(id)
    setListName('')
    setCreatingList(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-hangar-700 bg-hangar-800 p-3 shadow-2xl">
        {panel === 'collections' && justCreatedIds && (
          <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-hangar-700 bg-hangar-800 p-3 shadow-xl">
            <p className="mb-3 text-sm text-hangar-100">
              {t('bulk.confirmMarkOwnedAfterCreate', { n: justCreatedIds.length })}
            </p>
            <div className="flex gap-2">
              <Button onClick={confirmMarkOwnedAfterCreate} className="flex-1 justify-center gap-1.5">
                <PackagePlus size={14} />
                {t('bulk.confirmMarkOwnedYes')}
              </Button>
              <Button
                variant="secondary"
                onClick={dismissMarkOwnedAfterCreate}
                className="flex-1 justify-center gap-1.5"
              >
                {t('bulk.confirmMarkOwnedNo')}
              </Button>
            </div>
          </div>
        )}

        {panel === 'collections' && !justCreatedIds && (
          <div className="absolute bottom-full left-0 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => assignCollection(c.id!)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700"
              >
                <span className={`h-2 w-2 rounded-full ${collectionColorClasses[c.color].dot}`} />
                {c.name}
              </button>
            ))}
            {creating ? (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border border-hangar-700 p-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('customCollection.namePlaceholder')}
                  className="rounded-lg border border-hangar-700 bg-hangar-900 px-2.5 py-1.5 text-sm focus:border-federation-400 focus:outline-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {CUSTOM_COLLECTION_COLORS.map((c) => (
                      <button
                        key={c}
                        aria-label={`Color ${c}`}
                        onClick={() => setColor(c)}
                        className={`h-5 w-5 rounded-full ${collectionColorClasses[c].dot} ${
                          color === c ? 'ring-2 ring-hangar-100 ring-offset-1 ring-offset-hangar-800' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <Button onClick={createAndAssign} className="gap-1.5">
                    <FolderPlus size={14} />
                    {t('customCollection.createAndAdd')}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
              >
                <Plus size={14} />
                {t('bulk.newCollection')}
              </button>
            )}
          </div>
        )}

        {panel === 'wishlists' && (
          <div className="absolute bottom-full left-0 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {wishlistLists.map((l) => {
              const units = wishlistListUnits(l)
              const full = units >= WISHLIST_LIST_MAX_UNITS
              return (
                <button
                  key={l.id}
                  onClick={() => assignWishlistList(l.id!)}
                  disabled={full}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="truncate">{l.name}</span>
                  <span className="shrink-0 font-display text-xs text-hangar-300">
                    {units}/{WISHLIST_LIST_MAX_UNITS}
                  </span>
                </button>
              )
            })}
            {creatingList ? (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border border-hangar-700 p-2">
                <input
                  autoFocus
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createAndAssignWishlist()}
                  placeholder={t('wishlist.namePlaceholder')}
                  className="rounded-lg border border-hangar-700 bg-hangar-900 px-2.5 py-1.5 text-sm focus:border-federation-400 focus:outline-none"
                />
                <Button onClick={createAndAssignWishlist} className="w-full justify-center gap-1.5">
                  <Plus size={14} />
                  {t('bulk.newList')}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setCreatingList(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
              >
                <Plus size={14} />
                {t('bulk.newList')}
              </button>
            )}
          </div>
        )}

        {panel === 'trades' && (
          <div className="absolute bottom-full left-0 mb-2 max-h-64 w-full overflow-y-auto rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
            {tradeLists.map((l) => {
              const units = tradeListUnits(l)
              const full = units >= TRADE_LIST_MAX_UNITS
              return (
                <button
                  key={l.id}
                  onClick={() => assignTradeList(l.id!)}
                  disabled={full}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="truncate">{l.name}</span>
                  <span className="shrink-0 font-display text-xs text-hangar-300">
                    {units}/{TRADE_LIST_MAX_UNITS}
                  </span>
                </button>
              )
            })}
            {creatingList ? (
              <div className="mt-1 flex flex-col gap-2 rounded-lg border border-hangar-700 p-2">
                <input
                  autoFocus
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createAndAssignTrade()}
                  placeholder={t('trades.namePlaceholder')}
                  className="rounded-lg border border-hangar-700 bg-hangar-900 px-2.5 py-1.5 text-sm focus:border-federation-400 focus:outline-none"
                />
                <Button onClick={createAndAssignTrade} className="w-full justify-center gap-1.5">
                  <Plus size={14} />
                  {t('bulk.newList')}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setCreatingList(true)}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
              >
                <Plus size={14} />
                {t('bulk.newList')}
              </button>
            )}
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-hangar-100">
            {t('bulk.selected', { n })}
          </span>
          <button
            aria-label={t('bulk.exit')}
            onClick={onCancel}
            className="rounded-lg p-1.5 text-hangar-300 hover:bg-hangar-700 hover:text-hangar-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          <Section title={t('bulk.sectionOwned')}>
            <ActionButton Icon={PackagePlus} label={t('bulk.addCopy')} disabled={none} onClick={markOwned} />
            <ActionButton Icon={PackageMinus} label={t('bulk.removeCopy')} danger disabled={none} onClick={unmarkOwned} />
          </Section>

          <Section title={t('bulk.sectionWishlist')}>
            <ActionButton
              Icon={Star}
              label={t('bulk.addToWishlist')}
              wide={removeFromWishlistListId == null}
              disabled={none}
              onClick={() => togglePanel('wishlists')}
            />
            {removeFromWishlistListId != null && (
              <ActionButton
                Icon={StarOff}
                label={t('bulk.removeFromThis')}
                danger
                disabled={none}
                onClick={removeFromWishlist}
              />
            )}
          </Section>

          <Section title={t('bulk.sectionCollections')}>
            <ActionButton
              Icon={FolderPlus}
              label={t('bulk.addToCollection')}
              wide={removeFromCollectionId == null}
              disabled={none}
              onClick={() => togglePanel('collections')}
            />
            {removeFromCollectionId != null && (
              <ActionButton
                Icon={FolderMinus}
                label={t('bulk.removeFromThis')}
                danger
                disabled={none}
                onClick={removeFromCollection}
              />
            )}
          </Section>

          <Section title={t('bulk.sectionTrade')}>
            <ActionButton
              Icon={Repeat}
              label={t('bulk.addToTradeList')}
              wide
              disabled={none}
              onClick={() => togglePanel('trades')}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}
