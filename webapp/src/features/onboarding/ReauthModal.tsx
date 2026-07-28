import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { onAuthFailure } from '@/lib/api'
import { useAuth } from './useAuth'
import { JwtForm } from './JwtForm'

/**
 * Se abre cuando cualquier llamada a la API devuelve 401/403 o el token caducó (spec jwt-onboarding).
 * Cerrable: la app sigue en modo lectura con datos locales hasta que se introduzca un token nuevo.
 */
export function ReauthModal() {
  const [open, setOpen] = useState(false)
  const status = useAuth((s) => s.status)

  useEffect(() => onAuthFailure(() => setOpen(true)), [])

  // Si el onboarding aún no se completó, el tour ya pide el token: no dupliques UI.
  if (status !== 'authenticated' && !open) return null

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-hangar-700 bg-hangar-900 p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-bold text-hangar-100">
            Tu token ha dejado de funcionar
          </Dialog.Title>
          <Dialog.Description className="mt-2 mb-4 text-sm text-hangar-300">
            CardTrader ha rechazado la autenticación. Pega un token nuevo para seguir sincronizando;
            mientras tanto puedes seguir usando tus datos locales.
          </Dialog.Description>
          <JwtForm submitLabel="Reconectar" onSuccess={() => setOpen(false)} />
          <Dialog.Close className="mt-3 w-full text-center text-sm text-hangar-300 hover:text-hangar-100">
            Seguir sin conexión
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
