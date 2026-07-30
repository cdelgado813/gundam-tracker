import { create } from 'zustand'
import { db } from './db'

const SETTING_KEY = 'ui.welcomeSeen'

interface WelcomeSeenState {
  /** `undefined` mientras se carga la preferencia guardada (evita parpadeo). */
  seen: boolean | undefined
  init: () => Promise<void>
  markSeen: () => Promise<void>
}

/** Pantalla de bienvenida vista una sola vez; mismo patrón que `useUiLanguage`. */
export const useWelcomeSeen = create<WelcomeSeenState>((set) => ({
  seen: undefined,
  init: async () => {
    const stored = (await db.settings.get(SETTING_KEY))?.value
    set({ seen: stored === true })
  },
  markSeen: async () => {
    await db.settings.put({ key: SETTING_KEY, value: true })
    set({ seen: true })
  },
}))
