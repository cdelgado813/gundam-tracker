import { useState } from 'react'
import { Button } from '@/ui/Button'
import { useAuth } from './useAuth'

/** Formulario de captura+validación de JWT, reutilizado por el tour y el modal de re-auth. */
export function JwtForm({ onSuccess, submitLabel = 'Conectar' }: { onSuccess?: () => void; submitLabel?: string }) {
  const validateAndSave = useAuth((s) => s.validateAndSave)
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await validateAndSave(token)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado validando el token.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="Pega aquí tu JWT de CardTrader…"
        className="w-full resize-none rounded-xl border border-hangar-600 bg-hangar-900 p-3 font-mono text-xs text-hangar-100 placeholder:text-hangar-300/50 focus:border-federation-400 focus:outline-none"
      />
      {error && (
        <p role="alert" className="rounded-lg bg-zeon-500/10 px-3 py-2 text-sm text-zeon-400">
          {error}
        </p>
      )}
      <Button onClick={submit} disabled={busy || token.trim().length < 20}>
        {busy ? 'Comprobando…' : submitLabel}
      </Button>
      <p className="text-xs leading-relaxed text-hangar-300">
        El token se guarda solo en este dispositivo y únicamente se envía a la API de CardTrader.
        Puedes generarlo en{' '}
        <a
          href="https://www.cardtrader.com/es/full_api_app"
          target="_blank"
          rel="noreferrer"
          className="text-federation-400 underline"
        >
          cardtrader.com → Ajustes → API completa
        </a>
        .
      </p>
    </div>
  )
}
