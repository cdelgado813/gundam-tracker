import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import QRCode from 'qrcode'
import { ArrowLeft, Check, Download, Link2, ListChecks, Pencil, QrCode, Star, Trash2, X } from 'lucide-react'
import { db, type Card } from '@/lib/db'
import { removeFromWishlistList, renameWishlistList, wishlistListUnits, WISHLIST_LIST_MAX_UNITS } from './data'
import { tombstone } from '@/features/sync/tombstones'
import { shareUrlFor, encodeWishlistList, MAX_SHARE_URL_LENGTH } from './share'
import { useCardFilter } from '@/ui/CardListControls'
import { OwnershipFilter, type OwnershipFilterValue } from '@/ui/OwnershipFilter'
import { ListViewToggle } from '@/ui/ListViewToggle'
import { ListItemTile } from '@/ui/ListItemTile'
import { formatCents } from '@/features/catalog/prices'
import { Button } from '@/ui/Button'
import { useT } from '@/lib/useT'
import { BulkAssignBar } from '@/features/collections/BulkAssignBar'
import { isCardOwned, useOwnedMap } from '@/features/catalog/hooks'
import { useListViewMode } from '@/lib/useListViewMode'
import { usePlaysetMode } from '@/lib/usePlaysetMode'

type SortKey = 'name' | 'expansion' | 'price'

export function WishlistListDetailPage() {
  const t = useT()
  const { id } = useParams()
  const navigate = useNavigate()
  const listId = Number(id)
  const list = useLiveQuery(() => db.wishlistLists.get(listId), [listId])
  const [sort, setSort] = useState<SortKey>('name')
  const [ownership, setOwnership] = useState<OwnershipFilterValue>('all')
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [qr, setQr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [urlTooLong, setUrlTooLong] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const resolved = useLiveQuery(async () => {
    if (!list) return null
    const cards = await db.cards.bulkGet(list.items.map((i) => i.cardId))
    const expansions = new Map((await db.expansions.toArray()).map((e) => [e.id, e]))
    const prices = new Map((await db.prices.toArray()).map((p) => [p.blueprintId, p]))
    return list.items.map((item, idx) => ({
      item,
      card: cards[idx] ?? null,
      expansionName: cards[idx] ? (expansions.get(cards[idx]!.expansionId)?.name ?? '') : '',
      priceCents: cards[idx] ? (prices.get(cards[idx]!.id)?.minCents ?? null) : null,
    }))
  }, [list])

  const cards = useMemo(
    () => (resolved ?? []).map((x) => x.card).filter((c): c is Card => c != null),
    [resolved],
  )
  const { filtered, controls } = useCardFilter(cards)
  const filteredIds = useMemo(() => new Set(filtered.map((c) => c.id)), [filtered])
  const owned = useOwnedMap()
  const playsetMode = usePlaysetMode((s) => s.enabled)
  const storedMode = useListViewMode((s) => s.mode)
  // La selección solo tiene checkboxes en modo lista; en cuadrícula se fuerza lista.
  const viewMode = selecting ? 'list' : storedMode

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!list || !resolved) return null

  const visible = resolved
    .filter((x) => x.card == null || filteredIds.has(x.card.id))
    .filter((x) => {
      if (ownership === 'all' || x.card == null) return true
      return (ownership === 'owned') === isCardOwned(owned.get(x.card.id) ?? 0, playsetMode)
    })
    .sort((a, b) => {
      if (sort === 'name') return (a.card?.name ?? '').localeCompare(b.card?.name ?? '')
      if (sort === 'expansion') return a.expansionName.localeCompare(b.expansionName)
      return (a.priceCents ?? Number.MAX_SAFE_INTEGER) - (b.priceCents ?? Number.MAX_SAFE_INTEGER)
    })

  const priced = resolved.filter((x) => x.priceCents != null)
  const totalCents = priced.reduce((s, x) => s + (x.priceCents ?? 0) * x.item.quantity, 0)
  const units = wishlistListUnits(list)
  const shareUrl = shareUrlFor(list)

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

  const allVisibleSelected = visible.length > 0 && visible.every((x) => x.card && selectedIds.has(x.card.id))
  const toggleSelectAll = () => {
    setSelectedIds(
      allVisibleSelected
        ? new Set()
        : new Set(visible.map((x) => x.card?.id).filter((id): id is number => id != null)),
    )
  }

  const copyLink = async () => {
    if (shareUrl.length > MAX_SHARE_URL_LENGTH) {
      setUrlTooLong(true)
      return
    }
    await navigator.clipboard.writeText(shareUrl)
    setToast(t('trades.linkCopied'))
  }

  const showQr = async () => {
    const dataUrl = await QRCode.toDataURL(shareUrl, { width: 480, margin: 1 })
    setQr(dataUrl)
  }

  const exportFile = () => {
    const blob = new Blob([JSON.stringify({ gundamWishlistList: encodeWishlistList(list) })], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${list.name.replace(/\W+/g, '-')}.gundamwishlist.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const saveName = async () => {
    if (nameDraft.trim() && nameDraft.trim() !== list.name) {
      await renameWishlistList(listId, nameDraft.trim())
    }
    setEditingName(false)
  }

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <div className="flex items-center justify-between">
        <Link to="/wishlist" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
          <ArrowLeft size={14} /> {t('nav.wishlist')}
        </Link>
        {list.items.length > 0 &&
          (selecting ? (
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="text-sm text-federation-400 hover:underline">
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

      <header className="mb-4 mt-1">
        <div className="flex items-center justify-between gap-2">
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              onBlur={saveName}
              className="min-w-0 flex-1 rounded-lg border border-hangar-600 bg-hangar-900 px-2 py-1 font-display text-xl font-bold text-hangar-100 focus:outline-none"
            />
          ) : (
            <h1 className="truncate font-display text-xl font-bold text-hangar-100">{list.name}</h1>
          )}
          {list.kind === 'own' && (
            <button
              aria-label={t('trades.rename')}
              onClick={() => {
                if (editingName) {
                  void saveName()
                } else {
                  setNameDraft(list.name)
                  setEditingName(true)
                }
              }}
              className="shrink-0 rounded-lg p-1.5 text-hangar-300 hover:bg-hangar-800 hover:text-hangar-100"
            >
              {editingName ? <Check size={16} /> : <Pencil size={16} />}
            </button>
          )}
          <span className="shrink-0 rounded-lg bg-hangar-800 px-2 py-1 font-display text-xs text-hangar-300">
            {units}/{WISHLIST_LIST_MAX_UNITS}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {list.kind === 'own' && (
            <>
              <Button onClick={copyLink} className="gap-1.5">
                <Link2 size={14} />
                {t('trades.copyLink')}
              </Button>
              <Button variant="secondary" onClick={showQr} className="gap-1.5">
                <QrCode size={14} />
                {t('trades.qr')}
              </Button>
              <Button variant="secondary" onClick={exportFile} className="gap-1.5">
                <Download size={14} />
                {t('trades.exportFile')}
              </Button>
            </>
          )}
          <Button
            variant="danger"
            className="gap-1.5"
            onClick={async () => {
              if (window.confirm(t('trades.deleteConfirm'))) {
                await db.wishlistLists.delete(listId)
                await tombstone('wishlistLists', list.uuid)
                navigate('/wishlist')
              }
            }}
          >
            <Trash2 size={14} />
            {t('common.delete')}
          </Button>
        </div>
      </header>

      {urlTooLong && (
        <p className="mb-3 rounded-xl bg-haro-400/10 px-3 py-2 text-sm text-haro-400">{t('trades.tooLong')}</p>
      )}

      {resolved.length > 0 && (
        <div className="mb-4 rounded-xl border border-hangar-800 bg-hangar-900 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-hangar-300">{t('wishlist.estimatedCost')}</span>
            <span className="font-display text-xl font-bold text-haro-400">{formatCents(totalCents)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-hangar-300">
            {t('wishlist.basis', { n: priced.length, m: resolved.length })}
          </p>
        </div>
      )}

      {resolved.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex-1">{controls}</div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-hangar-700 bg-hangar-800 px-2 py-1.5 text-sm"
          >
            <option value="name">{t('wishlist.sortName')}</option>
            <option value="expansion">{t('wishlist.sortExpansion')}</option>
            <option value="price">{t('wishlist.sortPrice')}</option>
          </select>
        </div>
      )}
      {resolved.length > 0 && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <OwnershipFilter value={ownership} onChange={setOwnership} />
          {!selecting && <ListViewToggle />}
        </div>
      )}

      {list.items.length === 0 ? (
        <div className="py-16 text-center">
          <Star size={32} strokeWidth={1.5} className="mx-auto text-hangar-600" />
          <p className="mt-3 text-sm text-hangar-300">{t('wishlist.listEmpty')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {visible.map(({ item, card, priceCents }) => (
            <ListItemTile
              key={item.cardId}
              card={card}
              cardId={item.cardId}
              quantity={item.quantity}
              detail={formatCents(priceCents)}
              unsyncedLabel={t('trades.unsyncedCard')}
              onRemove={
                list.kind === 'own' ? () => removeFromWishlistList(listId, item.cardId) : undefined
              }
              removeLabel={t('common.remove')}
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map(({ item, card, expansionName, priceCents }) => (
            <li
              key={item.cardId}
              className="flex items-center gap-3 rounded-xl border border-hangar-800 bg-hangar-900 p-2.5"
            >
              {selecting && card && (
                <input
                  type="checkbox"
                  checked={selectedIds.has(card.id)}
                  onChange={() => toggleSelect(card.id)}
                  className="shrink-0 accent-zeon-500"
                />
              )}
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-hangar-800">
                {card?.imageUrlPreview && (
                  <img src={card.imageUrlPreview} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {card ? (
                  <Link to={`/card/${card.id}`} className="block truncate text-sm font-semibold text-hangar-100 hover:underline">
                    {card.name}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-semibold text-hangar-100">{`Blueprint #${item.cardId}`}</p>
                )}
                <p className="truncate text-xs text-hangar-300">
                  ×{item.quantity}
                  {card ? ` · ${expansionName} · ${card.collectorNumber}` : ` · ${t('trades.unsyncedCard')}`}
                </p>
              </div>
              <span className="shrink-0 font-display text-sm text-haro-400">{formatCents(priceCents)}</span>
              {list.kind === 'own' && !selecting && (
                <button
                  aria-label={t('common.remove')}
                  className="shrink-0 rounded-lg px-2 py-1 text-hangar-300 hover:bg-hangar-800 hover:text-zeon-400"
                  onClick={() => removeFromWishlistList(listId, item.cardId)}
                >
                  <X size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {selecting && list.kind === 'own' && (
        <BulkAssignBar
          selectedIds={selectedIds}
          removeFromWishlistListId={listId}
          onDone={setToast}
          onCancel={stopSelecting}
        />
      )}

      {qr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setQr(null)}
        >
          <div className="rounded-2xl bg-white p-4">
            <img src={qr} alt={t('trades.qrAlt')} className="h-72 w-72" />
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-hangar-700 px-4 py-2 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
