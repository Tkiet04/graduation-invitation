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
  cohortYears: string
  graduateName: string
}

export function Utc2Sashes({
  cohortYears,
  graduateName,
}: Utc2SashesProps) {
  const years = cohortYears.replace(/^niên\s*khóa\s*/i, '')
  const nameUpper = (graduateName || '').normalize('NFC').toUpperCase()

  return (
    <div className="inv-sash-pair" aria-hidden="true">
      <aside className="inv-sash inv-sash--left">
        <span className="inv-sash__fold" />
        <div className="inv-sash__inner">
          <UtcEmblem className="inv-sash__emblem" />
          <p className="inv-sash__letters">U<br />T<br />C<br />2</p>
          <p className="inv-sash__years">Class of<br />{years.slice(-4)}</p>
          <span className="inv-sash__spark">✦</span>
        </div>
        <span className="inv-sash__ornament" />
      </aside>

      <aside className="inv-sash inv-sash--right">
        <span className="inv-sash__fold" />
        <div className="inv-sash__inner">
          <UtcCapIcon className="inv-sash__cap" />
          <div className="inv-sash__vertical">
            <span>{nameUpper}</span>
          </div>
          <span className="inv-sash__major-name">Information Technology</span>
          <span className="inv-sash__spark">✦</span>
        </div>
        <span className="inv-sash__ornament" />
      </aside>
    </div>
  )
}
