import type { ThemePreference } from './constants'
import { THEME_STORAGE_KEY } from './constants'

export function readStoredThemePreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system')
      return v
  }
  catch {
    /* 无痕模式等 */
  }
  return 'system'
}

export function writeStoredThemePreference(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref)
  }
  catch {
    /* ignore */
  }
}
