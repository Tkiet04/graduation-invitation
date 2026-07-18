import { useId } from 'react'

const UTC_LOGO = '/decorations/utc-logo.png'

/** Logo chính thức UTC (hình tròn) */
export function UtcEmblem({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src={UTC_LOGO}
      alt=""
      draggable={false}
    />
  )
}

export function UtcCapIcon({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '')
  const goldId = `capGold-${gid}`

  return (
    <svg className={className} viewBox="0 0 64 48" aria-hidden="true">
      <defs>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d878" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9a7410" />
        </linearGradient>
      </defs>
      <polygon points="32,4 60,18 32,32 4,18" fill={`url(#${goldId})`} />
      <polygon points="32,8 52,18 32,28 12,18" fill="#0a1628" opacity="0.35" />
      <circle cx="32" cy="18" r="6" fill="none" stroke="#0a1628" strokeWidth="1.2" />
      <path
        fill="#0a1628"
        d="M32 14c-2.5 1-4 3-4 5 1.5-.4 3-.4 4 .4 1-.8 2.5-.8 4-.4 0-2-1.5-4-4-5z"
        opacity="0.85"
      />
      <rect x="29" y="30" width="6" height="10" rx="1" fill={`url(#${goldId})`} />
      <path d="M32 40v4" stroke={`url(#${goldId})`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="45" r="2" fill={`url(#${goldId})`} />
    </svg>
  )
}

interface Utc2SashesProps {
  schoolCode: string
  classCode: string
  major: string
  cohortYears: string
}

export function Utc2Sashes({
  schoolCode,
  classCode,
  major,
  cohortYears,
}: Utc2SashesProps) {
  const code = schoolCode.toUpperCase()
  const klass = classCode.toUpperCase()
  const majorLabel = major.toUpperCase()
  const years = cohortYears.replace(/^niên\s*khóa\s*/i, '')

  return (
    <div className="inv-sash-pair" aria-hidden="true">
      <aside className="inv-sash inv-sash--left">
        <div className="inv-sash__inner">
          <UtcEmblem className="inv-sash__emblem" />
          <p className="inv-sash__label">KHÓA</p>
          <p className="inv-sash__kode">{klass}</p>
          <p className="inv-sash__line">LỄ TỐT NGHIỆP</p>
          <p className="inv-sash__major">{majorLabel}</p>
          <p className="inv-sash__years">NIÊN KHÓA {years}</p>
          <UtcEmblem className="inv-sash__emblem inv-sash__emblem--bottom" />
        </div>
        <span className="inv-sash__tassel" />
      </aside>

      <aside className="inv-sash inv-sash--right">
        <div className="inv-sash__inner">
          <UtcCapIcon className="inv-sash__cap" />
          <p className="inv-sash__utc">{code}</p>
          <div className="inv-sash__vertical">
            <span>TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI</span>
            <span className="inv-sash__vertical-sub">
              PHÂN HIỆU TẠI THÀNH PHỐ HỒ CHÍ MINH
            </span>
          </div>
          <p className="inv-sash__city">
            HOCHIMINH
            <br />
            CITY
          </p>
        </div>
        <span className="inv-sash__tassel" />
      </aside>
    </div>
  )
}
