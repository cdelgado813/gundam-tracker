import { useT } from '@/lib/useT'

export type OwnershipFilterValue = 'all' | 'owned' | 'missing'

/**
 * Control segmentado de tres estados (design D4): sustituye el checkbox binario
 * "solo faltantes" allí donde ya existía y se añade donde faltaba (catálogo, wishlist).
 * No conoce `Card` ni Dexie: cada vista consumidora aplica el filtrado.
 */
export function OwnershipFilter({
  value,
  onChange,
}: {
  value: OwnershipFilterValue
  onChange: (next: OwnershipFilterValue) => void
}) {
  const t = useT()
  const options: { key: OwnershipFilterValue; label: string }[] = [
    { key: 'all', label: t('common.ownershipAll') },
    { key: 'owned', label: t('common.ownershipOwned') },
    { key: 'missing', label: t('common.ownershipMissing') },
  ]

  return (
    <div className="inline-flex rounded-xl border border-hangar-700 bg-hangar-900 p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            value === o.key
              ? 'bg-hangar-700 text-hangar-100'
              : 'text-hangar-300 hover:text-hangar-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
