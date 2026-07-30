import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { X } from 'lucide-react'
import { useT } from '@/lib/useT'

/** Lector de QR por cámara (jsQR + getUserMedia); sin dependencias de red, todo en el dispositivo. */
export function QrScanner({ onResult, onCancel }: { onResult: (text: string) => void; onCancel: () => void }) {
  const t = useT()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        tick()
      } catch {
        if (!cancelled) setError(t('sync.cameraError'))
      }
    }

    const tick = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(frame.data, frame.width, frame.height)
          if (code?.data) {
            onResult(code.data)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    void start()
    return () => {
      cancelled = true
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6">
      <button
        aria-label={t('common.cancel')}
        onClick={onCancel}
        className="absolute right-4 top-4 rounded-lg p-2 text-hangar-100 hover:bg-white/10"
      >
        <X size={22} />
      </button>
      {error ? (
        <p className="max-w-xs text-center text-sm text-zeon-400">{error}</p>
      ) : (
        <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-hangar-700">
          <video ref={videoRef} className="w-full" muted playsInline />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      <p className="mt-4 text-center text-sm text-hangar-300">{t('sync.scanHint')}</p>
    </div>
  )
}
