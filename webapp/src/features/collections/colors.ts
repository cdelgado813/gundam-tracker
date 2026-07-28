import type { CustomCollectionColor } from '@/lib/db'

/** Clases Tailwind por acento (tokens definidos en index.css). */
export const collectionColorClasses: Record<
  CustomCollectionColor,
  { dot: string; activeBg: string; activeText: string; border: string }
> = {
  zeon: {
    dot: 'bg-zeon-500',
    activeBg: 'bg-zeon-500/15',
    activeText: 'text-zeon-400',
    border: 'border-zeon-500/40',
  },
  federation: {
    dot: 'bg-federation-500',
    activeBg: 'bg-federation-500/15',
    activeText: 'text-federation-400',
    border: 'border-federation-500/40',
  },
  newtype: {
    dot: 'bg-newtype-400',
    activeBg: 'bg-newtype-400/15',
    activeText: 'text-newtype-400',
    border: 'border-newtype-400/40',
  },
  haro: {
    dot: 'bg-haro-400',
    activeBg: 'bg-haro-400/15',
    activeText: 'text-haro-400',
    border: 'border-haro-400/40',
  },
}
