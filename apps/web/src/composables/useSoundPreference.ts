import {
  setSoundEffectsMuted,
  soundEffectsMuted,
} from '@/sound/vue-store'

export function useSoundPreference() {
  return {
    muted: soundEffectsMuted,
    setMuted: setSoundEffectsMuted,
  }
}
