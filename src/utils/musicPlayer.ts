/** Nhạc nền dùng chung — mở bìa thư / nút loa trên thiệp */

const DEFAULT_MUSIC = '/audio/invitation-bg.wav'

let audio: HTMLAudioElement | null = null
let currentSrc = ''

function resolveSrc(url?: string): string {
  const trimmed = url?.trim()
  if (!trimmed) return DEFAULT_MUSIC
  if (
    trimmed.startsWith('data:audio') ||
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }
  return DEFAULT_MUSIC
}

export function getInvitationAudio(url?: string): HTMLAudioElement {
  const src = resolveSrc(url)
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

export function getDefaultMusicUrl(): string {
  return DEFAULT_MUSIC
}
