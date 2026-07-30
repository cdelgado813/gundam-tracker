import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import QRCode from 'qrcode'
import { ArrowLeft, Download, Link2, QrCode, Trash2, X } from 'lucide-react'
import { db } from '@/lib/db'
import { removeFromTradeList, tradeListUnits, TRADE_LIST_MAX_UNITS } from './data'
import { shareUrlFor, encodeTradeList, MAX_SHARE_URL_LENGTH } from './share'
import { Button } from '@/ui/Button'
import { useT } from '@/lib/useT'
import { useListViewMode } from '@/lib/useListViewMode'
import { ListViewToggle } from '@/ui/ListViewToggle'
import { ListItemTile } from '@/ui/ListItemTile'

export function TradeListPage() {
  const t = useT()
  const { id } = useParams()
  const navigate = useNavigate()
  const listId = Number(id)
  const list = useLiveQuery(() => db.tradeLists.get(listId), [listId])
  const cards =
    useLiveQuery(
      async () => {
        if (!list) return new Map<number, Awaited<ReturnType<typeof db.cards.get>>>()
        const resolved = await db.cards.bulkGet(list.items.map((i) => i.cardId))
        return new Map(list.items.map((i, idx) => [i.cardId, resolved[idx]]))
      },
      [list],
    ) ?? new Map()

  const [qr, setQr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [urlTooLong, setUrlTooLong] = useState(false)
  const viewMode = useListViewMode((s) => s.mode)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!list) return null
  const units = tradeListUnits(list)
  const shareUrl = shareUrlFor(list)

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
    const blob = new Blob([JSON.stringify({ gundamTradeList: encodeTradeList(list) })], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${list.name.replace(/\W+/g, '-')}.gundamlist.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Link to="/trades" className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100">
        <ArrowLeft size={14} /> {t('nav.trades')}
      </Link>
      <header className="mb-4 mt-1">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-hangar-100">{list.name}</h1>
          <span className="rounded-lg bg-hangar-800 px-2 py-1 font-display text-xs text-hangar-300">
            {units}/{TRADE_LIST_MAX_UNITS}
          </span>
        </div>
        {list.kind === 'own' && (
          <div className="mt-3 flex flex-wrap gap-2">
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
            <Button
              variant="danger"
              className="gap-1.5"
              onClick={async () => {
                if (window.confirm(t('trades.deleteConfirm'))) {
                  await db.tradeLists.delete(listId)
                  navigate('/trades')
                }
              }}
            >
              <Trash2 size={14} />
              {t('common.delete')}
            </Button>
          </div>
        )}
      </header>

      {urlTooLong && (
        <p className="mb-3 rounded-xl bg-haro-400/10 px-3 py-2 text-sm text-haro-400">
          {t('trades.tooLong')}
        </p>
      )}

      {list.items.length > 0 && (
        <div className="mb-3 flex justify-end">
          <ListViewToggle />
        </div>
      )}

      {list.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-hangar-300">
          {t('trades.listEmpty')}
        </p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {list.items.map((item) => {
            const card = cards.get(item.cardId)
            return (
              <ListItemTile
                key={`${item.cardId}-${item.condition ?? ''}`}
                card={card ?? null}
                cardId={item.cardId}
                quantity={item.quantity}
                detail={item.condition ?? undefined}
                unsyncedLabel={t('trades.unsyncedCard')}
                onRemove={
                  list.kind === 'own' ? () => removeFromTradeList(listId, item.cardId, item.condition) : undefined
                }
                removeLabel={t('common.remove')}
              />
            )
          })}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.items.map((item) => {
            const card = cards.get(item.cardId)
            return (
              <li
                key={`${item.cardId}-${item.condition ?? ''}`}
                className="flex items-center gap-3 rounded-xl border border-hangar-800 bg-hangar-900 p-2.5"
              >
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-hangar-800">
                  {card?.imageUrlPreview && (
                    <img src={card.imageUrlPreview} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/card/${item.cardId}`} className="block truncate text-sm font-semibold text-hangar-100 hover:underline">
                    {card?.name ?? `Blueprint #${item.cardId}`}
                  </Link>
                  <p className="text-xs text-hangar-300">
                    ×{item.quantity}
                    {item.condition ? ` · ${item.condition}` : ''}
                    {card ? ` · ${card.collectorNumber}` : ` · ${t('trades.unsyncedCard')}`}
                  </p>
                </div>
                {list.kind === 'own' && (
                  <button
                    aria-label={t('common.remove')}
                    className="shrink-0 rounded-lg px-2 py-1 text-hangar-300 hover:bg-hangar-800 hover:text-zeon-400"
                    onClick={() => removeFromTradeList(listId, item.cardId, item.condition)}
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
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
