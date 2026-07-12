import type { InvitationFormValues } from '@/types/invitation'
import { formatDateDisplay } from '@/utils/image'
import '@/styles/invitation.css'

interface InvitationCardProps {
  data: InvitationFormValues
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  )
}

export function InvitationCard({ data }: InvitationCardProps) {
  const dateLabel = formatDateDisplay(data.date) || '--/--/----'
  const timeLabel = data.time || '--:--'
  const nameLabel = data.graduateName.trim() || 'Tên bạn'
  const locationLabel = data.locationText.trim() || 'Địa điểm sự kiện'
  const addressLabel = data.locationAddress.trim() || 'Địa chỉ chi tiết'
  const mapHref =
    data.locationMap.trim() ||
    (data.locationAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.locationAddress)}`
      : undefined)

  return (
    <article className="inv-card" aria-label="Thư mời lễ tốt nghiệp">
      <div className="inv-card__glow" aria-hidden="true" />

      <div className="inv-card__content">
        {data.recipientName.trim() && (
          <p className="inv-card__recipient">
            <span className="inv-card__recipient-label">Thân gửi:</span>{' '}
            <strong>{data.recipientName.trim()}</strong>
          </p>
        )}

        <header className="inv-card__header">
          <p className="inv-card__script">Thư mời</p>
          <h1 className="inv-card__title">Lễ tốt nghiệp</h1>
        </header>

        {/* Photo stage: bg frame (back) + main cutout (front) */}
        <div className="inv-card__stage">
          <div className="inv-card__bg-frame">
            {data.backgroundImg ? (
              <img
                className="inv-card__bg-img"
                src={data.backgroundImg}
                alt=""
              />
            ) : (
              <div className="inv-card__bg-fallback" />
            )}
          </div>

          <img
            className="inv-card__bubble"
            src="/decorations/hi-bubble.svg"
            alt=""
            aria-hidden="true"
          />

          {data.mainImg ? (
            <div className="inv-card__main-wrap">
              <img className="inv-card__main" src={data.mainImg} alt={nameLabel} />
            </div>
          ) : (
            <div className="inv-card__main-placeholder" aria-hidden="true" />
          )}

          <img
            className="inv-card__chibi"
            src="/decorations/chibi-grad.png?v=2"
            alt=""
            aria-hidden="true"
          />

          <span className="inv-card__name">{nameLabel}</span>
        </div>

        <div className="inv-card__pill">
          <div className="inv-card__pill-time">
            <ClockIcon />
            <span>{timeLabel}</span>
          </div>
          <div className="inv-card__pill-date">
            <CalendarIcon />
            <span>{dateLabel}</span>
          </div>
        </div>

        <footer className="inv-card__footer">
          <p className="inv-card__location">{locationLabel}</p>

          {mapHref ? (
            <a
              className="inv-card__address"
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PinIcon />
              <span>{addressLabel}</span>
            </a>
          ) : (
            <span className="inv-card__address">
              <PinIcon />
              <span>{addressLabel}</span>
            </span>
          )}

          {data.contactInfo.trim() && (
            <p className="inv-card__contact">{data.contactInfo.trim()}</p>
          )}
        </footer>
      </div>
    </article>
  )
}
