import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Check, ImageOff, Minus, Plus, Repeat, Star } from 'lucide-react'
import { db, type CardCondition, type CardLanguage, type PriceCache } from '@/lib/db'
import { addToCollection, setEntryQuantity } from '@/features/collection/data'
import { toggleWishlist } from '@/features/wishlist/data'
import { addToTradeList, createTradeList, tradeListUnits, TRADE_LIST_MAX_UNITS } from '@/features/trades/data'
import { CustomCollectionsPicker } from '@/features/collections/CustomCollectionsPicker'
import { formatCents, getPrice, priceAge } from './prices'
import { Button } from '@/ui/Button'

const CONDITIONS: CardCondition[] = [
  'Mint',
  'Near Mint',
  'Slightly Played',
  'Moderately Played',
  'Played',
  'Poor',
]
const LANGUAGES: CardLanguage[] = ['en', 'jp', 'zh-CN']

function AddToCollectionForm({ cardId, expansionId }: { cardId: number; expansionId: number }) {
  const [condition, setCondition] = useState<CardCondition>('Near Mint')
  const [language, setLanguage] = useState<CardLanguage>('en')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  return (
    <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
      <h3 className="mb-3 font-display text-sm font-bold text-hangar-100">Añadir a colección</h3>
      <div className="flex flex-wrap gap-2">
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as CardCondition)}
          className="rounded-lg border border-hangar-700 bg-hangar-800 px-2 py-1.5 text-sm"
        >
          {CONDITIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as CardLanguage)}
          className="rounded-lg border border-hangar-700 bg-hangar-800 px-2 py-1.5 text-sm"
        >
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <div className="flex items-center rounded-lg border border-hangar-700 bg-hangar-800">
          <button className="px-2.5 py-1.5" onClick={() => setQty(Math.max(1, qty - 1))}>
            <Minus size={14} />
          </button>
          <span className="min-w-6 text-center font-display text-sm">{qty}</span>
          <button className="px-2.5 py-1.5" onClick={() => setQty(qty + 1)}>
            <Plus size={14} />
          </button>
        </div>
        <Button
          className="gap-1.5"
          onClick={async () => {
            await addToCollection(cardId, expansionId, qty, condition, language)
            setAdded(true)
            setTimeout(() => setAdded(false), 1500)
            // Spec wishlist: si estaba deseada, ofrecer retirarla al conseguirla
            const wl = await db.wishlist.where('cardId').equals(cardId).first()
            if (wl?.id != null && window.confirm('Esta carta estaba en tu wishlist. ¿La quitamos?')) {
              await db.wishlist.delete(wl.id)
            }
          }}
        >
          {added && <Check size={14} />}
          {added ? 'Añadida' : 'Añadir'}
        </Button>
      </div>
    </div>
  )
}

function OwnedEntries({ cardId }: { cardId: number }) {
  const entries = useLiveQuery(() => db.collection.where('cardId').equals(cardId).toArray(), [cardId]) ?? []
  if (entries.length === 0) return null
  return (
    <div className="rounded-xl border border-newtype-400/20 bg-newtype-400/5 p-4">
      <h3 className="mb-2 font-display text-sm font-bold text-newtype-400">En tu colección</h3>
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between text-sm">
            <span className="text-hangar-100">
              {e.condition} · {e.language}
            </span>
            <span className="flex items-center gap-2">
              <button
                className="rounded bg-hangar-800 px-2 py-0.5 hover:bg-hangar-700"
                onClick={() => setEntryQuantity(e, e.quantity - 1)}
              >
                <Minus size={13} />
              </button>
              <span className="min-w-6 text-center font-display">{e.quantity}</span>
              <button
                className="rounded bg-hangar-800 px-2 py-0.5 hover:bg-hangar-700"
                onClick={() => setEntryQuantity(e, e.quantity + 1)}
              >
                <Plus size={13} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TradeListPicker({ cardId, onDone }: { cardId: number; onDone: (msg: string) => void }) {
  const lists = useLiveQuery(() => db.tradeLists.where('kind').equals('own').toArray()) ?? []
  const [open, setOpen] = useState(false)

  const add = async (listId: number) => {
    const added = await addToTradeList(listId, cardId, 1)
    onDone(added > 0 ? 'Añadida a la lista' : 'La lista está llena (máx. 50)')
    setOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setOpen(!open)} className="gap-1.5">
        <Repeat size={14} />
        A lista de trade
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 z-10 mb-2 w-56 rounded-xl border border-hangar-700 bg-hangar-800 p-2 shadow-xl">
          {lists.map((l) => (
            <button
              key={l.id}
              onClick={() => add(l.id!)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-hangar-700"
            >
              <span className="truncate">{l.name}</span>
              <span className="ml-2 shrink-0 text-xs text-hangar-300">
                {tradeListUnits(l)}/{TRADE_LIST_MAX_UNITS}
              </span>
            </button>
          ))}
          <button
            onClick={async () => {
              const name = `Lista ${lists.length + 1}`
              const id = await createTradeList(name)
              await add(id)
            }}
            className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-federation-400 hover:bg-hangar-700"
          >
            <Plus size={14} />
            Nueva lista
          </button>
        </div>
      )}
    </div>
  )
}

export function CardDetailPage() {
  const { id } = useParams()
  const cardId = Number(id)
  const card = useLiveQuery(() => db.cards.get(cardId), [cardId])
  const expansion = useLiveQuery(
    () => (card ? db.expansions.get(card.expansionId) : undefined),
    [card?.expansionId],
  )
  const wishlisted =
    useLiveQuery(async () => (await db.wishlist.where('cardId').equals(cardId).count()) > 0, [cardId]) ??
    false
  const [price, setPrice] = useState<PriceCache | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    void getPrice(cardId).then(setPrice)
  }, [cardId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  if (!card)
    return (
      <div className="flex h-full items-center justify-center text-hangar-300">
        Carta no encontrada en el catálogo local.
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Link
        to={`/expansion/${card.expansionId}`}
        className="inline-flex items-center gap-1 text-sm text-hangar-300 hover:text-hangar-100"
      >
        <ArrowLeft size={14} /> {expansion?.name ?? 'Expansión'}
      </Link>

      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto w-64 shrink-0 sm:mx-0 sm:w-72 md:w-80 lg:w-96">
          {card.imageUrlShow ? (
            <img
              src={card.imageUrlShow}
              alt={card.name}
              className="w-full rounded-2xl shadow-2xl"
            />
          ) : (
            <div className="flex aspect-[5/7] items-center justify-center rounded-2xl bg-hangar-800 text-hangar-600">
              <ImageOff size={40} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-hangar-100">{card.name}</h1>
            <p className="mt-1 font-mono text-sm text-hangar-300">
              {card.collectorNumber} · {card.rarity}
            </p>
          </div>

          <div className="rounded-xl border border-hangar-800 bg-hangar-900 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-hangar-300">Precio mínimo (marketplace)</span>
              <span className="font-display text-xl font-bold text-haro-400">
                {formatCents(price?.minCents, price?.currency)}
              </span>
            </div>
            {price && (
              <p className="mt-1 text-right text-xs text-hangar-300">
                {price.offersCount} ofertas · {priceAge(price.fetchedAt)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="gap-1.5"
              onClick={async () => {
                const on = await toggleWishlist(cardId, card.expansionId)
                setToast(on ? 'Añadida a wishlist' : 'Quitada de wishlist')
              }}
            >
              <Star size={14} fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'En wishlist' : 'Wishlist'}
            </Button>
            <TradeListPicker cardId={cardId} onDone={setToast} />
          </div>

          <AddToCollectionForm cardId={cardId} expansionId={card.expansionId} />
          <OwnedEntries cardId={cardId} />
          <CustomCollectionsPicker cardId={cardId} />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-hangar-700 px-4 py-2 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
