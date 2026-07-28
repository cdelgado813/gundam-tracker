import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/** Orden aproximado de menor a mayor rareza; valores no listados van al final, alfabéticos. */
const RARITY_ORDER = ['C', 'C+', 'C++', 'U', 'U+', 'R', 'R+', 'LR', 'LR+', 'LR++', 'SP', 'LK', 'P']

function sortRarities(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = RARITY_ORDER.indexOf(a)
    const ib = RARITY_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

/** Fila de chips multi-selección (OR) para filtrar el catálogo por rareza. */
export function RarityFilterChips({
  selected,
  onChange,
}: {
  selected: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const rarities =
    useLiveQuery(async () => {
      const keys = await db.cards.orderBy('rarity').uniqueKeys()
      return sortRarities(keys.filter((k): k is string => typeof k === 'string' && k !== ''))
    }) ?? []

  if (rarities.length === 0) return null

  const toggle = (r: string) => {
    const next = new Set(selected)
    if (next.has(r)) next.delete(r)
    else next.add(r)
    onChange(next)
  }

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {rarities.map((r) => {
        const on = selected.has(r)
        return (
          <button
            key={r}
            onClick={() => toggle(r)}
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
  )
}
