import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'bg-zeon-500 text-white hover:bg-zeon-400 active:scale-[.98] shadow-lg shadow-zeon-500/25',
  secondary:
    'bg-hangar-700 text-hangar-100 hover:bg-hangar-600 active:scale-[.98] border border-hangar-600',
  ghost: 'bg-transparent text-hangar-300 hover:text-hangar-100 hover:bg-hangar-800',
  danger: 'bg-transparent text-zeon-400 border border-zeon-500/40 hover:bg-zeon-500/10',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-display text-sm font-semibold tracking-wide transition disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
