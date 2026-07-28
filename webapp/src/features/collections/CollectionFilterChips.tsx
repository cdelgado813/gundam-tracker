import { useCustomCollections } from './hooks'
import { collectionColorClasses } from './colors'

/** Fila de chips multi-selección (OR) para filtrar por colecciones personalizadas. */
export function CollectionFilterChips({
  selected,
  onChange,
}: {
  selected: Set<number>
  onChange: (next: Set<number>) => void
}) {
  const collections = useCustomCollections()
  if (collections.length === 0) return null

  const toggle = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {collections.map((c) => {
        const on = selected.has(c.id!)
        const colors = collectionColorClasses[c.color]
        return (
          <button
            key={c.id}
            onClick={() => toggle(c.id!)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              on
                ? `${colors.activeBg} ${colors.activeText} ${colors.border}`
                : 'border-hangar-700 text-hangar-300 hover:border-hangar-600'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {c.name}
          </button>
        )
      })}
    </div>
  )
}
