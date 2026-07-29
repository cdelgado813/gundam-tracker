import { registerSW } from 'virtual:pwa-register'

/** Cada cuánto se comprueba si hay una versión nueva mientras la app sigue abierta. */
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

/**
 * El service worker generado (registerType: 'autoUpdate') ya hace skipWaiting +
 * clientsClaim y recarga la página solo cuando encuentra una versión nueva — pero
 * "encontrarla" requiere que alguien llame a registration.update(). El registro
 * mínimo que Vite inyecta por defecto solo se registra una vez y no vuelve a
 * mirar, así que una PWA instalada podía quedarse días en una versión vieja.
 * Aquí se comprueba periódicamente y también cada vez que la pestaña vuelve a
 * primer plano, que es el momento más probable de reabrir la app tras un deploy.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update()
      })
    },
  })
  void updateSW
}
