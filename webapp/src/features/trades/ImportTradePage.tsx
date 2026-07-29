import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Inbox, Star, TriangleAlert } from 'lucide-react'
import { db } from '@/lib/db'
import { decodeTradeList } from './share'
import { Button } from '@/ui/Button'
import { useT } from '@/lib/useT'

export function ImportTradePage() {
  const t = useT()
  const { payload } = useParams()
  const navigate = useNavigate()

  const decoded = useMemo(() => {
    try {
      return { ok: true as const, list: decodeTradeList(payload ?? '') }
    } catch (err) {
      // El detalle del error vive en share.ts; aquí se muestra el mensaje traducido.
      void err
      return { ok: false as const }
    }
  }, [payload])

  const resolution = useLiveQuery(async () => {
    if (!decoded.ok) return null
    const ids = decoded.list.items.map((i) => i.cardId)
    const cards = await db.cards.bulkGet(ids)
    const wishlistIds = new Set((await db.wishlist.toArray()).map((w) => w.cardId))
    const missing = decoded.list.items.filter((_, i) => cards[i] == null)
    return { cards, wishlistIds, missingCount: missing.length }
  }, [decoded])

  if (!decoded.ok) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <TriangleAlert size={32} strokeWidth={1.5} className="mx-auto text-zeon-400" />
        <p className="mt-3 text-sm text-zeon-400">{t('trades.invalidLink')}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-federation-400 underline">
          {t('trades.goToCatalog')}
        </Link>
      </div>
    )
  }
  if (!resolution) return null

  const { list } = decoded
  const { cards, wishlistIds, missingCount } = resolution
  const matches = list.items.filter((i) => wishlistIds.has(i.cardId)).length

  const save = async () => {
    const now = Date.now()
    const id = await db.tradeLists.add({
      name: list.name,
      authorAlias: list.alias,
      items: list.items,
      kind: 'received',
      createdAt: now,
      updatedAt: now,
    })
    navigate(`/trades/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-4 text-center">
        <Inbox size={32} strokeWidth={1.5} className="mx-auto text-federation-400" />
        <h1 className="mt-2 font-display text-xl font-bold text-hangar-100">{list.name}</h1>
        <p className="mt-1 text-sm text-hangar-300">
          {list.alias ? t('trades.sharedBy', { alias: list.alias }) : t('trades.shared')} ·{' '}
          {t('common.card_other', { n: list.items.length })}
        </p>
        {matches > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-haro-400/10 px-3 py-1 text-sm text-haro-400">
            <Star size={13} fill="currentColor" />
            {t('trades.wishlistMatches', { n: matches })}
          </p>
        )}
      </header>

      {missingCount > 0 && (
        <p className="mb-3 rounded-xl bg-federation-500/10 px-3 py-2 text-sm text-federation-400">
          {t('trades.unsyncedNotice', { n: missingCount })}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {list.items.map((item, i) => {
          const card = cards[i]
          const inWishlist = wishlistIds.has(item.cardId)
          return (
            <li
              key={`${item.cardId}-${item.condition ?? ''}`}
              className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                inWishlist
                  ? 'border-haro-400/40 bg-haro-400/5'
                  : 'border-hangar-800 bg-hangar-900'
              }`}
            >
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-hangar-800">
                {card?.imageUrlPreview && (
                  <img src={card.imageUrlPreview} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-semibold text-hangar-100">
                  {inWishlist && (
                    <Star size={12} fill="currentColor" className="shrink-0 text-haro-400" />
                  )}
                  <span className="truncate">{card?.name ?? `Blueprint #${item.cardId}`}</span>
                </p>
                <p className="text-xs text-hangar-300">
                  ×{item.quantity}
                  {item.condition ? ` · ${item.condition}` : ''}
                  {card ? ` · ${card.collectorNumber}` : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 flex justify-center">
        <Button onClick={save}>{t('trades.saveReceived')}</Button>
      </div>
    </div>
  )
}
