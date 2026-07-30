import { Link } from 'react-router-dom'
import { ImageOff, X } from 'lucide-react'
import type { Card } from '@/lib/db'

/**
 * Tarjeta de cuadrícula para un ítem de wishlist/trade list (design: toggle
 * lista/cuadrícula). A diferencia de `CardTile` (propiedad en catálogo), aquí lo
 * relevante es la cantidad en esa lista y un detalle libre (precio o condición).
 */
export function ListItemTile({
  card,
  cardId,
  quantity,
  detail,
  unsyncedLabel,
  onRemove,
  removeLabel,
}: {
  card: Card | null
  cardId: number
  quantity: number
  detail?: string
  unsyncedLabel: string
  onRemove?: () => void
  removeLabel?: string
}) {
  const inner = (
    <>
      <div className="relative aspect-[5/7] w-full overflow-hidden bg-hangar-800">
        {card?.imageUrlPreview ? (
          <img
            src={card.imageUrlPreview}
            alt={card.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-hangar-600">
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-md bg-hangar-950/80 px-1.5 py-0.5 font-display text-[11px] font-bold text-hangar-100 shadow backdrop-blur-sm">
          ×{quantity}
        </span>
        {onRemove && (
          <button
            aria-label={removeLabel}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-hangar-950/80 text-hangar-300 shadow backdrop-blur-sm transition hover:bg-zeon-500 hover:text-hangar-950"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-left text-xs font-semibold text-hangar-100">
          {card?.name ?? `Blueprint #${cardId}`}
        </p>
        <p className="mt-1 truncate text-[10px] text-hangar-300">{card ? detail : unsyncedLabel}</p>
      </div>
    </>
  )

  const className =
    'group relative overflow-hidden rounded-xl border border-hangar-800 bg-hangar-900 text-left transition hover:border-hangar-600'

  if (!card) return <div className={className}>{inner}</div>

  return (
    <Link to={`/card/${card.id}`} className={className}>
      {inner}
    </Link>
  )
}
