import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useT } from '@/lib/useT'

const EDGE_THRESHOLD = 240

/**
 * Botones flotantes de ir arriba/abajo sobre el contenedor de scroll (design D2):
 * un único montaje global en `Shell`, visible solo cuando hay overflow real.
 * Posicionados a la derecha para no chocar con `BulkAssignBar`/toasts (centrados).
 */
export function ScrollEdgeButtons({ scrollRef }: { scrollRef: React.RefObject<HTMLElement | null> }) {
  const t = useT()
  const [state, setState] = useState({ showUp: false, showDown: false })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      const hasOverflow = scrollHeight > clientHeight + EDGE_THRESHOLD
      setState({
        showUp: hasOverflow && scrollTop > EDGE_THRESHOLD,
        showDown: hasOverflow && distanceToBottom > EDGE_THRESHOLD,
      })
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', update)
      resizeObserver.disconnect()
    }
  }, [scrollRef])

  if (!state.showUp && !state.showDown) return null

  const scrollBy = (dir: 'up' | 'down') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: dir === 'up' ? 0 : el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2">
      {state.showUp && (
        <button
          aria-label={t('nav.scrollToTop')}
          onClick={() => scrollBy('up')}
          className="rounded-full border border-hangar-700 bg-hangar-800/95 p-2.5 text-hangar-100 shadow-lg backdrop-blur transition hover:bg-hangar-700"
        >
          <ArrowUp size={18} />
        </button>
      )}
      {state.showDown && (
        <button
          aria-label={t('nav.scrollToBottom')}
          onClick={() => scrollBy('down')}
          className="rounded-full border border-hangar-700 bg-hangar-800/95 p-2.5 text-hangar-100 shadow-lg backdrop-blur transition hover:bg-hangar-700"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  )
}
