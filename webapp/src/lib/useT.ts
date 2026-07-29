import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { db } from './db'
import {
  detectLanguage,
  translate,
  type TranslateParams,
  type TranslationKey,
  type UiLanguage,
} from './i18n'

const SETTING_KEY = 'ui.language'

interface LanguageState {
  language: UiLanguage
  /** Carga la preferencia guardada; la elección explícita gana sobre la detección. */
  init: () => Promise<void>
  setLanguage: (language: UiLanguage) => Promise<void>
}

export const useUiLanguage = create<LanguageState>((set) => ({
  language: detectLanguage(),
  init: async () => {
    const stored = (await db.settings.get(SETTING_KEY))?.value
    if (stored === 'en' || stored === 'es' || stored === 'ca') set({ language: stored })
  },
  setLanguage: async (language) => {
    await db.settings.put({ key: SETTING_KEY, value: language })
    set({ language })
  },
}))

/** Mantiene `<html lang>` en sincronía con el idioma elegido. */
export function useSyncHtmlLang(): void {
  const language = useUiLanguage((s) => s.language)
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
}

export function useT(): (key: TranslationKey, params?: TranslateParams) => string {
  const language = useUiLanguage((s) => s.language)
  return useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(language, key, params),
    [language],
  )
}
