import { create } from 'zustand'
import { ApiAuthError, ApiNetworkError, fetchInfo, getStoredToken, storeToken } from '@/lib/api'
import { decodeJwtPayload, isJwtExpired } from '@/lib/jwt'

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

interface AuthState {
  status: AuthStatus
  /** nombre de la app CardTrader del usuario (del payload del JWT o de /info) */
  accountName: string | null
  init: () => Promise<void>
  /** Valida el token (formato + exp + GET /info) y lo guarda. Lanza Error con mensaje legible. */
  validateAndSave: (token: string) => Promise<void>
  /** Marca la sesión como caducada (la dispara el listener global de 401/403). */
  markUnauthenticated: () => void
}

export const useAuth = create<AuthState>((set) => ({
  status: 'loading',
  accountName: null,

  init: async () => {
    const token = await getStoredToken()
    if (!token || isJwtExpired(token)) {
      set({ status: 'unauthenticated' })
      return
    }
    set({ status: 'authenticated', accountName: decodeJwtPayload(token)?.name ?? null })
  },

  validateAndSave: async (raw: string) => {
    const token = raw.trim()
    const payload = decodeJwtPayload(token)
    if (!payload) throw new Error('Eso no parece un JWT válido: revisa que has copiado el token completo.')
    if (isJwtExpired(token)) throw new Error('Este token ya ha caducado. Genera uno nuevo en CardTrader.')
    try {
      const info = await fetchInfo({ token, silentAuthErrors: true })
      await storeToken(token)
      set({ status: 'authenticated', accountName: payload.name ?? info.name ?? null })
    } catch (err) {
      if (err instanceof ApiAuthError)
        throw new Error('CardTrader ha rechazado el token (401). Comprueba que sigue activo en tu cuenta.')
      if (err instanceof ApiNetworkError)
        throw new Error('No hay conexión: no se ha podido comprobar el token. Inténtalo de nuevo.')
      throw err
    }
  },

  markUnauthenticated: () => set({ status: 'unauthenticated' }),
}))
