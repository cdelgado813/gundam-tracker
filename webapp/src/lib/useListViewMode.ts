import { create } from 'zustand'
import { db } from './db'

const SETTING_KEY = 'ui.listViewMode'

export type ListViewMode = 'list' | 'grid'

interface ViewModeState {
  mode: ListViewMode
  /** Carga la preferencia guardada (mismo patrón que `useUiLanguage`). */
  init: () => Promise<void>
  setMode: (mode: ListViewMode) => Promise<void>
}

/**
 * Preferencia lista/cuadrícula para wishlist y trade lists: en pantallas anchas,
 * la fila de texto hace difícil identificar cartas de un vistazo. Se recuerda
 * entre visitas vía `db.settings`, igual que el idioma de la interfaz.
 */
export const useListViewMode = create<ViewModeState>((set) => ({
  mode: 'list',
  init: async () => {
    const stored = (await db.settings.get(SETTING_KEY))?.value
    if (stored === 'list' || stored === 'grid') set({ mode: stored })
  },
  setMode: async (mode) => {
    await db.settings.put({ key: SETTING_KEY, value: mode })
    set({ mode })
  },
}))
