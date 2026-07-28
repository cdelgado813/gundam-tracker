import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import QRCode from 'qrcode'
import { db } from '@/lib/db'
import { removeFromTradeList, tradeListUnits, TRADE_LIST_MAX_UNITS } from './data'
import { shareUrlFor, encodeTradeList, MAX_SHARE_URL_LENGTH } from './share'
import { Button } from '@/ui/Button'

export function TradeListPage() {
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

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
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
    setToast('🔗 Enlace copiado')
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
      <Link to="/trades" className="text-sm text-hangar-300 hover:text-hangar-100">
        ← Trades
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
            <Button onClick={copyLink}>🔗 Copiar enlace</Button>
            <Button variant="secondary" onClick={showQr}>
              QR
            </Button>
            <Button variant="secondary" onClick={exportFile}>
              Exportar fichero
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (window.confirm('¿Eliminar esta lista?')) {
                  await db.tradeLists.delete(listId)
                  navigate('/trades')
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        )}
      </header>

      {urlTooLong && (
        <p className="mb-3 rounded-xl bg-haro-400/10 px-3 py-2 text-sm text-haro-400">
          La lista es demasiado grande para un enlace. Usa el QR o «Exportar fichero».
        </p>
      )}

      {list.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-hangar-300">
          Lista vacía. Añade cartas desde el detalle de cualquier carta que tengas.
        </p>
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
                    {card ? ` · ${card.collectorNumber}` : ' · carta no sincronizada'}
                  </p>
                </div>
                {list.kind === 'own' && (
                  <button
                    aria-label="Quitar"
                    className="shrink-0 rounded-lg px-2 py-1 text-hangar-300 hover:bg-hangar-800 hover:text-zeon-400"
                    onClick={() => removeFromTradeList(listId, item.cardId, item.condition)}
                  >
                    ✕
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
            <img src={qr} alt="QR de la lista" className="h-72 w-72" />
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
