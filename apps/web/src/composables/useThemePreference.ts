import type { ThemePreference } from '@/theme/constants'

import { computed } from 'vue'
import {
  setThemePreference as commitThemePreference,
  systemPrefersDark,
  themePreference,
} from '@/theme/vue-store'

export function useThemePreference() {
  const resolvedScheme = computed<'light' | 'dark'>(() => {
    const p = themePreference.value
    if (p === 'light')
      return 'light'
    if (p === 'dark')
      return 'dark'
    return systemPrefersDark.value ? 'dark' : 'light'
  })

  function setPreference(pref: ThemePreference) {
    commitThemePreference(pref)
  }

  return {
    preference: themePreference,
    resolvedScheme,
    setPreference,
  }
}
