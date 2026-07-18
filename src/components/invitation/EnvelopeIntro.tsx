import { useEffect, useState } from 'react'
import type { InvitationFormValues } from '@/types/invitation'
import { getWeekdayVi, formatTimeRange } from '@/utils/dateFormat'
import { playInvitationMusic } from '@/utils/musicPlayer'
import '@/styles/envelope.css'

interface EnvelopeIntroProps {
  data: InvitationFormValues
  onOpened: () => void
}

type Phase = 'closed' | 'opening' | 'rising' | 'exit'

export function EnvelopeIntro({ data, onOpened }: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const name = data.graduateName.trim() || 'Nguyễn Tuấn Kiệt'
  const address =
    data.locationAddress.trim() ||
    '450-451 Lê Văn Việt, TP. Thủ Đức, TP.HCM'
  const weekday = data.date ? getWeekdayVi(data.date) : '—'
  const time = formatTimeRange(data.time, data.timeEnd)

  useEffect(() => {
    if (phase !== 'opening') return
    const t1 = window.setTimeout(() => setPhase('rising'), 900)
    return () => window.clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'rising') return
    const t1 = window.setTimeout(() => setPhase('exit'), 1600)
    return () => window.clearTimeout(t1)
  }, [phase])

  useEffect(() => {
    if (phase !== 'exit') return
    const t1 = window.setTimeout(() => onOpened(), 700)
    return () => window.clearTimeout(t1)
  }, [phase, onOpened])

  async function handleOpen() {
    if (phase !== 'closed') return
    setPhase('opening')
    // Gesture người dùng → được phép autoplay nhạc
    await playInvitationMusic(data.musicUrl)
  }

  return (
    <div
      className={`env-scene env-scene--${phase}`}
      role="dialog"
      aria-label="Bìa thư mời lễ tốt nghiệp"
    >
      <div className="env-scene__sky" aria-hidden="true" />

      <header className="env-scene__title">
        <span className="env-scene__cap" aria-hidden="true">
          <svg viewBox="0 0 64 40">
            <polygon points="32,2 62,16 32,30 2,16" fill="#1a1a1a" />
            <rect x="28" y="16" width="8" height="14" fill="#1a1a1a" />
            <path d="M32 30 L32 36" stroke="#c9a227" strokeWidth="2" />
            <circle cx="32" cy="37" r="2.2" fill="#c9a227" />
          </svg>
        </span>
        <p className="env-scene__grad">Graduation</p>
        <h1 className="env-scene__cer">Ceremony</h1>
      </header>

      <button
        type="button"
        className="env-wrap"
        onClick={handleOpen}
        aria-label={phase === 'closed' ? 'Mở thư mời' : 'Đang mở thư mời'}
        disabled={phase !== 'closed'}
      >
        <div className="env">
          <div className="env__letter">
            <p className="env__letter-from">
              From: <strong>{name}</strong>
            </p>
            <p className="env__letter-meta">
              {weekday}
              {time !== '--:--' ? ` · ${time}` : ''}
            </p>
            <p className="env__letter-place">
              <span aria-hidden="true">📍</span> {address}
            </p>
            <p className="env__letter-msg">
              {data.message.trim() ||
                'Đây là ngày mình muốn được gặp cậu...'}
            </p>
          </div>

          <div className="env__pocket" aria-hidden="true" />
          <div className="env__flap" aria-hidden="true" />
          <div className="env__front" aria-hidden="true">
            <span className="env__seal">UTC2</span>
          </div>
        </div>
      </button>

      {phase === 'closed' && (
        <p className="env-scene__hint">Chạm vào bìa thư để mở · nhạc sẽ phát</p>
      )}
    </div>
  )
}
