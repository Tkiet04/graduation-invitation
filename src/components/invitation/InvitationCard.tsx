import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { InvitationFormValues } from '@/types/invitation'
import {
  formatTimeRange,
  getDayNumber,
  getMonthEn,
  getWeekdayVi,
  getYear,
} from '@/utils/dateFormat'
import { Utc2Sashes } from '@/components/invitation/Utc2Sashes'
import {
  getInvitationAudio,
  isInvitationMusicPlaying,
  pauseInvitationMusic,
  playInvitationMusic,
} from '@/utils/musicPlayer'

const UTC_LOGO = '/decorations/utc-logo.png'
import '@/styles/invitation.css'

interface InvitationCardProps {
  data: InvitationFormValues
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  )
}

function GradCapIcon() {
  return (
    <svg className="inv-card__cap" viewBox="0 0 64 40" aria-hidden="true">
      <polygon points="32,2 62,16 32,30 2,16" fill="#1a1a1a" />
      <rect x="28" y="16" width="8" height="14" fill="#1a1a1a" />
      <path d="M32 30 L32 36" stroke="#c9a227" strokeWidth="2" />
      <circle cx="32" cy="37" r="2.2" fill="#c9a227" />
      <polygon points="32,6 54,16 32,26 10,16" fill="#2a2a2a" opacity="0.35" />
    </svg>
  )
}

function MusicIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18V6l10-2v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      {muted && (
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  )
}

function ChevronIcon({ up }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={up ? 'M6 14l6-6 6 6' : 'M6 10l6 6 6-6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InvitationCard({ data }: InvitationCardProps) {
  const nameLabel = data.graduateName.trim() || 'Nguyễn Tuấn Kiệt'
  const schoolLabel =
    data.locationText.trim() ||
    'TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI - PHÂN HIỆU TẠI TP.HCM'
  const mapAddressLabel =
    data.locationAddress.trim() ||
    '450-451 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM'
  const schoolCode = (data.schoolCode.trim() || 'UTC2').toUpperCase()
  const classCode = (data.classCode.trim() || 'K63').toUpperCase()
  const cohortYears = data.cohortYears.trim() || '2022-2026'
  const major = data.major.trim() || 'CÔNG NGHỆ THÔNG TIN'
  const message =
    data.message.trim() ||
    'Hy vọng trong bức tranh thanh xuân của tớ sẽ có sự góp mặt của cậu'
  const weekday = getWeekdayVi(data.date)
  const month = getMonthEn(data.date)
  const day = getDayNumber(data.date)
  const year = getYear(data.date)
  const timeRange = formatTimeRange(data.time, data.timeEnd)
  const mapHref =
    data.locationMap.trim() ||
    (data.locationAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.locationAddress)}`
      : undefined)

  const scrollRef = useRef<HTMLElement>(null)
  const [muted, setMuted] = useState(!isInvitationMusicPlaying())
  const [atBottom, setAtBottom] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    // Đồng bộ icon loa với trạng thái nhạc (đã phát từ bìa thư)
    setMuted(!isInvitationMusicPlaying())
    getInvitationAudio(data.musicUrl)
  }, [data.musicUrl])

  useEffect(() => {
    if (!entered) return
    const el = scrollRef.current
    if (!el) return

    const t1 = window.setTimeout(() => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight)
      if (max < 40) return
      el.scrollTo({ top: Math.min(max, el.clientHeight * 0.42), behavior: 'smooth' })
    }, 1600)
    const t2 = window.setTimeout(() => {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }, 4200)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [entered])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onScroll() {
      if (!el) return
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24
      setAtBottom(nearBottom)
    }

    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  async function toggleMusic() {
    if (muted || !isInvitationMusicPlaying()) {
      const ok = await playInvitationMusic(data.musicUrl)
      setMuted(!ok)
    } else {
      pauseInvitationMusic()
      setMuted(true)
    }
  }

  function scrollInvite() {
    const el = scrollRef.current
    if (!el) return
    if (atBottom) {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ top: el.clientHeight * 0.55, behavior: 'smooth' })
    }
  }

  const bgStyle = data.backgroundImg
    ? { backgroundImage: `url(${data.backgroundImg})` }
    : undefined

  return (
    <article
      ref={scrollRef}
      className={`inv-card${entered ? ' inv-card--entered' : ''}`}
      aria-label="Thư mời lễ tốt nghiệp UTC2"
    >
      <div className="inv-card__silk" style={bgStyle} aria-hidden="true" />
      <div className="inv-card__shimmer" aria-hidden="true" />

      <div className="inv-card__content">
        <Utc2Sashes
          schoolCode={schoolCode}
          classCode={classCode}
          major={major}
          cohortYears={cohortYears}
        />

        {data.recipientName.trim() && (
          <p
            className="inv-card__recipient inv-card__anim"
            style={{ '--d': '0.05s' } as CSSProperties}
          >
            Thân gửi <strong>{data.recipientName.trim()}</strong>
          </p>
        )}

        <header
          className="inv-card__brand inv-card__anim"
          style={{ '--d': '0.12s' } as CSSProperties}
        >
          <img
            className="inv-card__logo-img"
            src={data.mainImg.trim() || UTC_LOGO}
            alt="Logo Trường Đại học Giao thông Vận tải"
          />
          <p className="inv-card__uni-code">{schoolCode}</p>
          <p className="inv-card__uni-name">{schoolLabel}</p>
        </header>

        <div
          className="inv-card__title-block inv-card__anim"
          style={{ '--d': '0.22s' } as CSSProperties}
        >
          <GradCapIcon />
          <p className="inv-card__title-grad">Graduation</p>
          <h1 className="inv-card__title-cer">Ceremony</h1>
        </div>

        <p
          className="inv-card__name inv-card__anim"
          style={{ '--d': '0.34s' } as CSSProperties}
        >
          {nameLabel}
        </p>

        <p className="inv-card__meta inv-card__anim" style={{ '--d': '0.38s' } as CSSProperties}>
          {classCode} · {major}
        </p>

        <p
          className="inv-card__message inv-card__anim"
          style={{ '--d': '0.44s' } as CSSProperties}
        >
          {message}
        </p>

        <div
          className="inv-card__datetime inv-card__anim"
          style={{ '--d': '0.54s' } as CSSProperties}
        >
          <div className="inv-card__side">
            <span className="inv-card__rule" />
            <span className="inv-card__weekday">{weekday}</span>
            <span className="inv-card__rule" />
          </div>

          <div className="inv-card__date-core">
            <span className="inv-card__month">{month}</span>
            <span className="inv-card__day">{day}</span>
            <span className="inv-card__year">{year}</span>
          </div>

          <div className="inv-card__side">
            <span className="inv-card__rule" />
            <span className="inv-card__time">{timeRange}</span>
            <span className="inv-card__rule" />
          </div>
        </div>

        <div
          className="inv-card__location inv-card__anim"
          style={{ '--d': '0.66s' } as CSSProperties}
        >
          <p className="inv-card__location-label">LOCATION</p>
          {mapHref ? (
            <a
              className="inv-card__location-name inv-card__location-name--link"
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {mapAddressLabel}
            </a>
          ) : (
            <p className="inv-card__location-name">{mapAddressLabel}</p>
          )}
        </div>

        <div
          className="inv-card__actions inv-card__anim"
          style={{ '--d': '0.78s' } as CSSProperties}
        >
          {mapHref ? (
            <a
              className="inv-card__directions"
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PinIcon />
              <span>Chỉ đường</span>
            </a>
          ) : (
            <span className="inv-card__directions inv-card__directions--disabled">
              <PinIcon />
              <span>Chỉ đường</span>
            </span>
          )}

          <div className="inv-card__fabs">
            <button
              type="button"
              className="inv-card__fab"
              onClick={scrollInvite}
              aria-label={atBottom ? 'Cuộn lên đầu' : 'Cuộn xuống'}
            >
              <ChevronIcon up={atBottom} />
            </button>
            <button
              type="button"
              className="inv-card__fab"
              onClick={toggleMusic}
              aria-label={muted ? 'Bật nhạc' : 'Tắt nhạc'}
              title="Bật / tắt nhạc nền"
            >
              <MusicIcon muted={muted} />
            </button>
          </div>
        </div>

        {data.contactInfo.trim() && (
          <p
            className="inv-card__contact inv-card__anim"
            style={{ '--d': '0.88s' } as CSSProperties}
          >
            {data.contactInfo.trim()}
          </p>
        )}
      </div>
    </article>
  )
}
