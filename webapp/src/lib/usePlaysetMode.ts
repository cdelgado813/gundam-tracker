import { create } from 'zustand'
import { db } from './db'

const SETTING_KEY = 'collection.playsetMode'

interface PlaysetModeState {
  enabled: boolean
  /** Carga la preferencia guardada (mismo patrón que `useListViewMode`). */
  init: () => Promise<void>
  setEnabled: (enabled: boolean) => Promise<void>
}

/**
 * Preferencia global "modo playset" (spec collection-management): con ella activa,
 * el filtro de propiedad de tres estados considera "en propiedad" solo a partir de
 * `PLAYSET_SIZE` copias, en vez de con 1. Es una preferencia de visualización local,
 * como el idioma de interfaz o list/grid — no viaja por `SyncPayload`.
 */
export const usePlaysetMode = create<PlaysetModeState>((set) => ({
  enabled: false,
  init: async () => {
    const stored = (await db.settings.get(SETTING_KEY))?.value
    if (typeof stored === 'boolean') set({ enabled: stored })
  },
  setEnabled: async (enabled) => {
    await db.settings.put({ key: SETTING_KEY, value: enabled })
    set({ enabled })
  },
}))
