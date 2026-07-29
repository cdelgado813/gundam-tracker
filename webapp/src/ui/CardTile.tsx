import { Link } from 'react-router-dom'
import { Check, ImageOff, Plus, Star } from 'lucide-react'
import type { Card } from '@/lib/db'
import { addToCollection } from '@/features/collection/data'

const rarityColors: Record<string, string> = {
  C: 'bg-hangar-600 text-hangar-100',
  U: 'bg-newtype-400/20 text-newtype-400',
  R: 'bg-federation-400/20 text-federation-400',
  RR: 'bg-purple-400/20 text-purple-300',
  LR: 'bg-haro-400/20 text-haro-400',
  P: 'bg-zeon-400/20 text-zeon-400',
}

export function CardTile({
  card,
  ownedCount,
  wishlisted,
  /** Cuando se pasa true: atenúa la carta si falta y muestra el contador de copias poseídas. */
  dimIfMissing,
  /** En modo selección, la tarjeta no navega: alterna su selección. */
  selectionMode,
  selected,
  onToggleSelect,
}: {
  card: Card
  ownedCount?: number
  wishlisted?: boolean
  dimIfMissing?: boolean
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (cardId: number) => void
}) {
  const missing = dimIfMissing && !(ownedCount && ownedCount > 0)
  // La atenuación va sobre imagen y texto, no sobre el contenedor: el botón +1
  // debe verse a plena opacidad precisamente en las cartas que faltan.
  const dimClass = missing ? 'opacity-45 grayscale transition group-hover:opacity-80' : ''

  const inner = (
    <>
      <div className="relative aspect-[5/7] w-full overflow-hidden bg-hangar-800">
        {card.imageUrlPreview ? (
          <img
            src={card.imageUrlPreview}
            alt={card.name}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${dimClass}`}
          />
        ) : (
          <div className={`flex h-full items-center justify-center text-hangar-600 ${dimClass}`}>
            <ImageOff size={28} strokeWidth={1.5} />
          </div>
        )}
        {dimIfMissing && !selectionMode && (
          <button
            aria-label="Añadir una copia"
            onClick={(e) => {
              // Alta rápida (design D3): no navegar al detalle; el contador ×N da el feedback.
              e.preventDefault()
              e.stopPropagation()
              void addToCollection(card.id, card.expansionId, 1, 'Near Mint', 'en')
            }}
            className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-hangar-950/80 text-newtype-400 shadow backdrop-blur-sm transition hover:bg-newtype-400 hover:text-hangar-950"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className={`p-2 ${dimClass}`}>
        <p className="truncate text-left text-xs font-semibold text-hangar-100">{card.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-mono text-[10px] text-hangar-300">{card.collectorNumber}</span>
          {card.rarity && (
            <span
              className={`rounded px-1.5 py-0.5 font-display text-[10px] font-bold ${rarityColors[card.rarity] ?? 'bg-hangar-700 text-hangar-300'}`}
            >
              {card.rarity}
            </span>
          )}
        </div>
      </div>
      {dimIfMissing && ownedCount != null && ownedCount > 0 && (
        <span className="absolute left-1.5 top-1.5 rounded-md bg-newtype-400/90 px-1.5 py-0.5 font-display text-[11px] font-bold text-hangar-950 shadow">
          ×{ownedCount}
        </span>
      )}
      {wishlisted && !selectionMode && (
        <span
          className="absolute right-1.5 top-1.5 rounded-full bg-hangar-950/70 p-1 text-haro-400 drop-shadow"
          aria-label="En wishlist"
        >
          <Star size={12} fill="currentColor" />
        </span>
      )}
      {selectionMode && (
        <span
          className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 shadow ${
            selected
              ? 'border-federation-400 bg-federation-500 text-white'
              : 'border-hangar-100/70 bg-hangar-950/60'
          }`}
        >
          {selected && <Check size={12} strokeWidth={3} />}
        </span>
      )}
    </>
  )

  const className = `group relative overflow-hidden rounded-xl border text-left transition [content-visibility:auto] [contain-intrinsic-size:auto_240px] ${
    missing
      ? 'border-hangar-800 bg-hangar-900/60'
      : 'border-hangar-800 bg-hangar-900 hover:border-hangar-600'
  } ${selectionMode && selected ? 'ring-2 ring-federation-400' : ''}`

  if (selectionMode) {
    return (
      <button type="button" onClick={() => onToggleSelect?.(card.id)} className={className}>
        {inner}
      </button>
    )
  }

  return (
    <Link to={`/card/${card.id}`} className={className}>
      {inner}
    </Link>
  )
}
