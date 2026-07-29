import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Card } from '@/lib/db'
import { useT } from '@/lib/useT'

/**
 * Búsqueda + filtro de rareza sobre una lista ya cargada (design D3): filtra en
 * memoria, sin tocar Dexie ni URL. Los chips muestran solo las rarezas presentes
 * en la lista de esta vista.
 */
export function useCardFilter(cards: Card[]) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [rarities, setRarities] = useState<Set<string>>(new Set())

  const availableRarities = useMemo(() => {
    const present = new Set(cards.map((c) => c.rarity).filter(Boolean))
    const ORDER = ['C', 'C+', 'C++', 'U', 'U+', 'R', 'R+', 'LR', 'LR+', 'LR++', 'SP', 'LK', 'P']
    return [...present].sort((a, b) => {
      const ia = ORDER.indexOf(a)
      const ib = ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [cards])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter(
      (c) =>
        (!q || c.searchName.includes(q) || c.collectorNumber.toLowerCase().includes(q)) &&
        (rarities.size === 0 || rarities.has(c.rarity)),
    )
  }, [cards, query, rarities])

  const active = query.trim().length > 0 || rarities.size > 0

  const controls = (
    <div className="mb-3">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-hangar-300" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.searchInList')}
          className="w-full rounded-xl border border-hangar-700 bg-hangar-900 py-2 pl-9 pr-3 text-sm text-hangar-100 placeholder:text-hangar-300/50 focus:border-federation-400 focus:outline-none"
        />
      </div>
      {availableRarities.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableRarities.map((r) => {
            const on = rarities.has(r)
            return (
              <button
                key={r}
                onClick={() => {
                  const next = new Set(rarities)
                  if (next.has(r)) next.delete(r)
                  else next.add(r)
                  setRarities(next)
                }}
                className={`rounded-full border px-2.5 py-1 font-display text-xs font-bold transition ${
                  on
                    ? 'border-haro-400/50 bg-haro-400/15 text-haro-400'
                    : 'border-hangar-700 text-hangar-300 hover:border-hangar-600'
                }`}
              >
                {r}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  return { filtered, controls, active }
}
