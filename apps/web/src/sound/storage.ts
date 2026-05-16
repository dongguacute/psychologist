import { SOUND_MUTED_STORAGE_KEY } from './constants'

const MUTED = '1' as const
const UNMUTED = '0' as const

export function readStoredSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === MUTED
  }
  catch {
    /* 无痕模式等 */
  }
  return false
}

export function writeStoredSoundMuted(muted: boolean) {
  try {
    localStorage.setItem(
      SOUND_MUTED_STORAGE_KEY,
      muted ? MUTED : UNMUTED,
    )
  }
  catch {
    /* ignore */
  }
}
