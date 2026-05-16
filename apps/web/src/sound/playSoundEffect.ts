import { soundEffectsMuted } from './vue-store'

/**
 * 播放应用内短音效。
 * 用户选择静音后，此处不会解码或播放任何声音（无任何音效）。
 */
export function playSoundEffect(src: string): void {
  if (soundEffectsMuted.value) {
    return
  }
  const audio = new Audio(src)
  void audio.play().catch(() => {})
}
