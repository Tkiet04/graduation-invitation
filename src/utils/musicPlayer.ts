/** Nhạc nền — chỉ phát khi người dùng tự chọn (upload / link) */

let audio: HTMLAudioElement | null = null
let currentSrc = ''

function resolveSrc(url?: string): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (
    trimmed.startsWith('data:audio') ||
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }
  return null
}

export function getInvitationAudio(url?: string): HTMLAudioElement | null {
  const src = resolveSrc(url)
  if (!src) {
    pauseInvitationMusic()
    return null
  }

  const absolute = src.startsWith('data:')
    ? src
    : new URL(src, window.location.origin).href

  if (!audio || currentSrc !== absolute) {
    audio?.pause()
    audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.4
    currentSrc = absolute
  }

  return audio
}

export async function playInvitationMusic(url?: string): Promise<boolean> {
  const el = getInvitationAudio(url)
  if (!el) return false
  try {
    await el.play()
    return true
  } catch (err) {
    console.warn('Không phát được nhạc:', err)
    return false
  }
}

export function pauseInvitationMusic(): void {
  audio?.pause()
}

export function isInvitationMusicPlaying(): boolean {
  return !!audio && !audio.paused
}
