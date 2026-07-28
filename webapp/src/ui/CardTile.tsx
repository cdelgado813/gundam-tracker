import { Link } from 'react-router-dom'
import { ImageOff, Star } from 'lucide-react'
import type { Card } from '@/lib/db'

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
  /** Cuando se pasa true y no hay copias, la carta se atenúa para marcarla como faltante. */
  dimIfMissing,
}: {
  card: Card
  ownedCount?: number
  wishlisted?: boolean
  dimIfMissing?: boolean
}) {
  const missing = dimIfMissing && !(ownedCount && ownedCount > 0)
  return (
    <Link
      to={`/card/${card.id}`}
      className={`group relative overflow-hidden rounded-xl border transition [content-visibility:auto] [contain-intrinsic-size:auto_240px] ${
        missing
          ? 'border-hangar-800 bg-hangar-900/60 opacity-45 grayscale hover:opacity-80'
          : 'border-hangar-800 bg-hangar-900 hover:border-hangar-600'
      }`}
    >
      <div className="aspect-[5/7] w-full overflow-hidden bg-hangar-800">
        {card.imageUrlPreview ? (
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
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-semibold text-hangar-100">{card.name}</p>
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
      {ownedCount != null && ownedCount > 0 && (
        <span className="absolute left-1.5 top-1.5 rounded-md bg-newtype-400/90 px-1.5 py-0.5 font-display text-[11px] font-bold text-hangar-950 shadow">
          ×{ownedCount}
        </span>
      )}
      {wishlisted && (
        <span
          className="absolute right-1.5 top-1.5 rounded-full bg-hangar-950/70 p-1 text-haro-400 drop-shadow"
          aria-label="En wishlist"
        >
          <Star size={12} fill="currentColor" />
        </span>
      )}
    </Link>
  )
}
