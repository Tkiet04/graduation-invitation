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
  TypewriterText,
  typewriterDuration,
} from '@/components/invitation/TypewriterText'
import { getInvitationAudio, playInvitationMusic } from '@/utils/musicPlayer'

const UTC_LOGO = '/decorations/utc-logo.png'
import '@/styles/invitation.css'

const CHAR_MS = 26
const TYPE_START = 420

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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.6l.4-3H14V9z" />
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

export function InvitationCard({ data }: InvitationCardProps) {
  const nameLabel = data.graduateName.trim() || 'Nguyễn Tuấn Kiệt'
  const schoolLabel =
    (data.locationText.trim() ||
      'TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI PHÂN HIỆU TẠI TP.HCM').replace(
      /\s*[-–—]\s*/g,
      ' ',
    )
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
  const contactLabel = data.contactInfo.trim() || '0901 234 567'
  const contactTel = contactLabel.replace(/[^\d+]/g, '')
  const facebookRaw = data.facebookInfo.trim() || 'facebook.com/tuankiet'
  const facebookHref = /^https?:\/\//i.test(facebookRaw)
    ? facebookRaw
    : facebookRaw.includes('facebook.com')
      ? `https://${facebookRaw.replace(/^\/+/, '')}`
      : `https://www.facebook.com/${facebookRaw.replace(/^@/, '')}`
  const facebookDisplay = facebookRaw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^facebook\.com\//i, '')

  const recipientName = data.recipientName.trim()
  const dearPrefix = 'Dear: '

  // Sequential typewriter timeline (ms)
  let cursor = TYPE_START
  const dDear = cursor
  const dRecipientName = recipientName
    ? typewriterDuration(dearPrefix, cursor, CHAR_MS)
    : cursor
  if (recipientName) {
    cursor = typewriterDuration(recipientName, dRecipientName, CHAR_MS) + 120
  }
  const dSchool = cursor
  cursor = typewriterDuration(schoolLabel, cursor, CHAR_MS) + 160
  const dGrad = cursor
  cursor = typewriterDuration('Graduation', cursor, CHAR_MS) + 80
  const dCer = cursor
  cursor = typewriterDuration('Ceremony', cursor, CHAR_MS) + 120
  const dName = cursor
  cursor = typewriterDuration(nameLabel, cursor, CHAR_MS) + 140
  const dMessage = cursor
  cursor = typewriterDuration(message, cursor, CHAR_MS) + 160
  const dWeekday = cursor
  const dMonth = cursor + 40
  const dDay = cursor + 80
  const dYear = cursor + 140
  const dTime = cursor + 40
  cursor =
    Math.max(
      typewriterDuration(weekday, dWeekday, CHAR_MS),
      typewriterDuration(month, dMonth, CHAR_MS),
      typewriterDuration(day, dDay, CHAR_MS),
      typewriterDuration(year, dYear, CHAR_MS),
      typewriterDuration(timeRange, dTime, CHAR_MS),
    ) + 160
  const dLocLabel = cursor
  cursor = typewriterDuration('LOCATION', cursor, CHAR_MS) + 80
  const dAddress = cursor
  const typeDoneAt = typewriterDuration(mapAddressLabel, cursor, CHAR_MS)

  const scrollRef = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    // Chỉ phát khi có nhạc do người dùng chọn
    if (!data.musicUrl.trim()) return
    getInvitationAudio(data.musicUrl)
    void playInvitationMusic(data.musicUrl)
  }, [data.musicUrl])

  useEffect(() => {
    if (!entered) return
    const el = scrollRef.current
    if (!el) return

    const mid = Math.max(2200, Math.floor(typeDoneAt * 0.55))
    const back = Math.max(mid + 1800, typeDoneAt + 400)

    const t1 = window.setTimeout(() => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight)
      if (max < 40) return
      el.scrollTo({ top: Math.min(max, el.clientHeight * 0.42), behavior: 'smooth' })
    }, mid)
    const t2 = window.setTimeout(() => {
      el.scrollTo({ top: 0, behavior: 'smooth' })
    }, back)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [entered, typeDoneAt])

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

      <img
        className="inv-card__chibi"
        src="/decorations/grad-chibi.png"
        alt=""
        draggable={false}
        aria-hidden="true"
      />

      <div className="inv-card__corner-contact">
        {contactTel.length >= 8 ? (
          <a
            className="inv-card__corner-contact-item inv-card__corner-contact-item--phone"
            href={`tel:${contactTel}`}
            aria-label={`Gọi ${contactLabel}`}
          >
            <PhoneIcon />
            <span>{contactLabel}</span>
          </a>
        ) : (
          <span className="inv-card__corner-contact-item inv-card__corner-contact-item--phone">
            <PhoneIcon />
            <span>{contactLabel}</span>
          </span>
        )}
        <a
          className="inv-card__corner-contact-item inv-card__corner-contact-item--fb"
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Facebook ${facebookDisplay}`}
        >
          <FacebookIcon />
          <span>{facebookDisplay}</span>
        </a>
      </div>

      <div className="inv-card__content">
        <Utc2Sashes
          schoolCode={schoolCode}
          classCode={classCode}
          major={major}
          cohortYears={cohortYears}
        />

        {recipientName && (
          <p className="inv-card__recipient">
            <TypewriterText
              text={dearPrefix}
              active={entered}
              startDelay={dDear}
              charDelay={CHAR_MS}
            />
            <TypewriterText
              as="strong"
              text={recipientName}
              active={entered}
              startDelay={dRecipientName}
              charDelay={CHAR_MS}
            />
          </p>
        )}

        <header className="inv-card__brand">
          <img
            className="inv-card__logo-img inv-card__anim inv-card__anim--from-top"
            style={{ '--d': '0.15s' } as CSSProperties}
            src={data.mainImg.trim() || UTC_LOGO}
            alt="Logo Trường Đại học Giao thông Vận tải"
          />
          <TypewriterText
            as="p"
            className="inv-card__uni-name"
            text={schoolLabel}
            active={entered}
            startDelay={dSchool}
            charDelay={CHAR_MS}
          />
        </header>

        <div className="inv-card__title-block">
          <TypewriterText
            as="p"
            className="inv-card__title-grad"
            text="Graduation"
            active={entered}
            startDelay={dGrad}
            charDelay={CHAR_MS}
            decorateChar={{
              index: 7, // letter "i"
              node: <GradCapIcon />,
            }}
          />
          <TypewriterText
            as="h1"
            className="inv-card__title-cer"
            text="Ceremony"
            active={entered}
            startDelay={dCer}
            charDelay={CHAR_MS}
          />
        </div>

        <TypewriterText
          as="p"
          className="inv-card__name"
          text={nameLabel}
          active={entered}
          startDelay={dName}
          charDelay={CHAR_MS}
        />

        <TypewriterText
          as="p"
          className="inv-card__message"
          text={message}
          active={entered}
          startDelay={dMessage}
          charDelay={CHAR_MS}
        />

        <div className="inv-card__datetime">
          <div className="inv-card__side">
            <span className="inv-card__rule" />
            <TypewriterText
              as="span"
              className="inv-card__weekday"
              text={weekday}
              active={entered}
              startDelay={dWeekday}
              charDelay={CHAR_MS}
            />
            <span className="inv-card__rule" />
          </div>

          <div className="inv-card__date-core">
            <TypewriterText
              as="span"
              className="inv-card__month"
              text={month}
              active={entered}
              startDelay={dMonth}
              charDelay={CHAR_MS}
            />
            <TypewriterText
              as="span"
              className="inv-card__day"
              text={day}
              active={entered}
              startDelay={dDay}
              charDelay={CHAR_MS}
            />
            <TypewriterText
              as="span"
              className="inv-card__year"
              text={year}
              active={entered}
              startDelay={dYear}
              charDelay={CHAR_MS}
            />
          </div>

          <div className="inv-card__side">
            <span className="inv-card__rule" />
            <TypewriterText
              as="span"
              className="inv-card__time"
              text={timeRange}
              active={entered}
              startDelay={dTime}
              charDelay={CHAR_MS}
            />
            <span className="inv-card__rule" />
          </div>
        </div>

        <div className="inv-card__location">
          <TypewriterText
            as="p"
            className="inv-card__location-label"
            text="LOCATION"
            active={entered}
            startDelay={dLocLabel}
            charDelay={CHAR_MS}
          />
          {mapHref ? (
            <a
              className="inv-card__location-name inv-card__location-name--link"
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TypewriterText
                text={mapAddressLabel}
                active={entered}
                startDelay={dAddress}
                charDelay={CHAR_MS}
              />
            </a>
          ) : (
            <TypewriterText
              as="p"
              className="inv-card__location-name"
              text={mapAddressLabel}
              active={entered}
              startDelay={dAddress}
              charDelay={CHAR_MS}
            />
          )}
        </div>

        <div
          className="inv-card__actions inv-card__anim inv-card__anim--from-bottom"
          style={
            {
              '--d': `${(typeDoneAt / 1000 + 0.15).toFixed(2)}s`,
            } as CSSProperties
          }
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
        </div>
      </div>
    </article>
  )
}
