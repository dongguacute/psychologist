import { ref } from 'vue'

import type { ThemePreference } from './constants'
import { readStoredThemePreference, writeStoredThemePreference } from './storage'

export const themePreference = ref<ThemePreference>('system')
export const systemPrefersDark = ref(false)

let listenersAttached = false

function resolvedScheme(): 'light' | 'dark' {
  const p = themePreference.value
  if (p === 'light')
    return 'light'
  if (p === 'dark')
    return 'dark'
  return systemPrefersDark.value ? 'dark' : 'light'
}

function applyHtmlScheme() {
  document.documentElement.dataset.theme = resolvedScheme()
}

export function initTheme() {
  themePreference.value = readStoredThemePreference()
  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyHtmlScheme()

  if (listenersAttached)
    return
  listenersAttached = true

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
      if (themePreference.value === 'system')
        applyHtmlScheme()
    })
}

export function setThemePreference(pref: ThemePreference) {
  themePreference.value = pref
  writeStoredThemePreference(pref)
  applyHtmlScheme()
}
