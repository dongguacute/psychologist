import { ref } from 'vue'
import { readStoredSoundMuted, writeStoredSoundMuted } from './storage'

/** `true` 时为静音：不播放应用内任意音效（含点击音与作答对错提示） */
export const soundEffectsMuted = ref(false)

export function initSoundEffects() {
  soundEffectsMuted.value = readStoredSoundMuted()
}

export function setSoundEffectsMuted(muted: boolean) {
  soundEffectsMuted.value = muted
  writeStoredSoundMuted(muted)
}
