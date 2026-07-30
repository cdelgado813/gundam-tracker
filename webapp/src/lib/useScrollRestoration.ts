import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Recuerda el scroll de `scrollRef` por ruta (design D1): al volver atrás en el
 * historial (POP) restaura la posición guardada; al entrar por primera vez a una
 * ruta (PUSH/REPLACE) arranca arriba, como es natural. Vive en `sessionStorage`
 * para sobrevivir a un refresco de página sin persistir entre sesiones.
 */
export function useScrollRestoration(scrollRef: React.RefObject<HTMLElement | null>) {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    const key = `scroll:${location.pathname}${location.search}`
    const el = scrollRef.current

    if (el) {
      if (navigationType === 'POP') {
        const saved = sessionStorage.getItem(key)
        const y = saved ? Number(saved) : 0
        // doble rAF: espera al commit de React y al layout antes de fijar scrollTop
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = y
          })
        })
      } else {
        el.scrollTop = 0
      }
    }

    return () => {
      if (el) sessionStorage.setItem(key, String(el.scrollTop))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, navigationType])
}

/** Limpia el scroll recordado de una ruta (design D3: reinicio de sección). */
export function clearRememberedScroll(pathname: string, search = ''): void {
  sessionStorage.removeItem(`scroll:${pathname}${search}`)
}
