import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Star } from 'lucide-react'
import { db } from '@/lib/db'
import { createWishlistList, wishlistListUnits, WISHLIST_LIST_MAX_UNITS } from './data'
import { Button } from '@/ui/Button'
import { useT } from '@/lib/useT'

export function WishlistListsPage() {
  const t = useT()
  const lists = useLiveQuery(() => db.wishlistLists.orderBy('updatedAt').reverse().toArray()) ?? []
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const own = lists.filter((l) => l.kind === 'own')
  const received = lists.filter((l) => l.kind === 'received')

  return (
    <div className="mx-auto max-w-3xl p-4">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-widest text-hangar-100">{t('wishlist.title')}</h1>
        <Button onClick={() => setCreating(true)} className="gap-1.5">
          <Plus size={16} />
          {t('wishlist.newList')}
        </Button>
      </header>

      {creating && (
        <form
          className="mb-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!name.trim()) return
            await createWishlistList(name.trim())
            setName('')
            setCreating(false)
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('wishlist.namePlaceholder')}
            className="flex-1 rounded-xl border border-hangar-700 bg-hangar-900 px-3 py-2 text-sm focus:border-federation-400 focus:outline-none"
          />
          <Button type="submit">{t('common.create')}</Button>
        </form>
      )}

      {own.length === 0 && received.length === 0 && !creating && (
        <div className="py-16 text-center">
          <Star size={32} strokeWidth={1.5} className="mx-auto text-hangar-600" />
          <p className="mx-auto mt-3 max-w-sm text-sm text-hangar-300">
            {t('wishlist.emptyLists', { max: WISHLIST_LIST_MAX_UNITS })}
          </p>
        </div>
      )}

      {own.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-hangar-300">
            {t('wishlist.myLists')}
          </h2>
          <div className="flex flex-col gap-2">
            {own.map((l) => (
              <Link
                key={l.id}
                to={`/wishlist/${l.id}`}
                className="flex items-center justify-between rounded-xl border border-hangar-800 bg-hangar-900 p-4 transition hover:border-hangar-600"
              >
                <p className="truncate font-semibold text-hangar-100">{l.name}</p>
                <span className="ml-3 shrink-0 rounded-lg bg-hangar-800 px-2 py-1 font-display text-xs text-hangar-300">
                  {wishlistListUnits(l)}/{WISHLIST_LIST_MAX_UNITS}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {received.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-hangar-300">
            {t('trades.received')}
          </h2>
          <div className="flex flex-col gap-2">
            {received.map((l) => (
              <Link
                key={l.id}
                to={`/wishlist/${l.id}`}
                className="flex items-center justify-between rounded-xl border border-federation-500/20 bg-hangar-900 p-4 transition hover:border-federation-500/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-hangar-100">{l.name}</p>
                  {l.authorAlias && (
                    <p className="text-xs text-hangar-300">{t('trades.from', { alias: l.authorAlias })}</p>
                  )}
                </div>
                <span className="ml-3 shrink-0 rounded-lg bg-hangar-800 px-2 py-1 font-display text-xs text-hangar-300">
                  {t('common.card_other', { n: wishlistListUnits(l) })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
