import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneNow(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari/iOS heredado: no soporta display-mode pero expone este flag.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/** iOS/iPadOS con cualquier navegador (todos usan WebKit ahí): sin API de instalación programable. */
function isIos(): boolean {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ se anuncia como Mac de escritorio; el táctil lo delata.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

/**
 * Instalación de la PWA (spec support-donation-adjacent: "instalar app" en Ajustes).
 * Android/Chrome/Edge: intercepta `beforeinstallprompt` y dispara el diálogo nativo.
 * iOS: sin API posible (restricción de Apple) — solo se puede mostrar el gesto manual.
 */
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandaloneNow())

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setDeferredEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    setDeferredEvent(null)
  }

  return {
    installed,
    canPromptInstall: deferredEvent != null,
    isIos: isIos(),
    install,
  }
}
