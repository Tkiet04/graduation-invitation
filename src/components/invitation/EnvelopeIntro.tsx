import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { InvitationFormValues } from '@/types/invitation'
import {
  formatTimeRange,
  getDayNumber,
  getMonthEn,
  getYear,
} from '@/utils/dateFormat'
import { playInvitationMusic } from '@/utils/musicPlayer'
import { ConfettiBurst } from '@/components/invitation/ConfettiBurst'
import { DEMO_FORM } from '@/constants/invitationData'
import '@/styles/envelope.css'

interface EnvelopeIntroProps {
  data: InvitationFormValues
  onOpened: () => void
}

type Phase = 'closed' | 'opened' | 'exit'

export function EnvelopeIntro({ data, onOpened }: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<Phase>('closed')
  const [confetti, setConfetti] = useState(false)
  const autoTimerRef = useRef<number | null>(null)

  // Lấy dữ liệu tên khách mời và thời gian từ database
  const recipient = data.recipientName?.trim() || DEMO_FORM.recipientName
  const dateValue = data.date?.trim() || DEMO_FORM.date
  const day = getDayNumber(dateValue)
  const month = getMonthEn(dateValue)
  const year = getYear(dateValue)
  const displayDate =
    day !== '--' && month !== '—' && year !== '----'
      ? `${day} ${month} ${year}`
      : dateValue
  const timeFormatted = formatTimeRange(
    data.time || DEMO_FORM.time,
    data.timeEnd || DEMO_FORM.timeEnd,
  )
  const displayTime =
    timeFormatted !== '--:--'
      ? timeFormatted
      : formatTimeRange(DEMO_FORM.time, DEMO_FORM.timeEnd)

  // 1. Tự động chuyển từ 'opened' sang 'exit' sau 2.8s để vào chi tiết thiệp
  useEffect(() => {
    if (phase !== 'opened') return

    autoTimerRef.current = window.setTimeout(() => {
      goToCard()
    }, 2800)

    return () => {
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }
  }, [phase])

  // 2. Khi 'exit' hoàn tất -> chuyển hẳn sang trang chi tiết thiệp InvitationCard
  useEffect(() => {
    if (phase !== 'exit') return

    const t = window.setTimeout(() => {
      onOpened()
    }, 550)

    return () => window.clearTimeout(t)
  }, [phase, onOpened])

  async function handleOpen() {
    if (phase !== 'closed') return
    setPhase('opened')
    setConfetti(true)
    await playInvitationMusic(data.musicUrl)
  }

  function goToCard() {
    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current)
      autoTimerRef.current = null
    }
    setPhase('exit')
  }

  function handleClick() {
    if (phase === 'closed') {
      handleOpen()
    } else if (phase === 'opened') {
      // Cho phép bấm vào để xem chi tiết thiệp ngay lập tức
      goToCard()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`env-scene env-scene--${phase}`}
      role="dialog"
      aria-label="Thư mời lễ tốt nghiệp"
    >
      <button
        type="button"
        className="env-cover"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={
          phase === 'closed'
            ? 'Chạm vào bìa thư để mở'
            : phase === 'opened'
              ? 'Chạm để xem chi tiết thiệp ngay'
              : 'Đang chuyển đến chi tiết thiệp...'
        }
      >
        {/* Pháo hoa bắn bùng nổ từ miệng phong bì bên trong thiệp */}
        <ConfettiBurst active={confetti} />

        {/* Layer 1: Thư mở ra (open_Letter.png) nằm sẵn bên dưới */}
        <img
          src="/decorations/open_Letter.png"
          alt="Thư mời mở ra"
          className="env-cover__img env-cover__img--opened"
          draggable={false}
        />

        {/* Nội dung thư lấy trực tiếp từ database thiệp: Dear khách mời, Ngày, Giờ */}
        <div className="env-letter" aria-hidden="true">
          <p className="env-letter__dear">
            <span className="env-letter__dear-label">Dear: </span>
            <span className="env-letter__dear-name">{recipient}</span>
          </p>
          <p className="env-letter__date">{displayDate}</p>
          <p className="env-letter__time">{displayTime}</p>
        </div>

        {/* Layer 2: Bìa thư đóng (Bia_Thu.png) nằm đè bên trên, fade out mượt mà khi mở */}
        <img
          src="/decorations/Bia_Thu.png"
          alt="Bìa thư đóng tốt nghiệp"
          className="env-cover__img env-cover__img--closed"
          draggable={false}
        />

        {/* Hiệu ứng hào quang tại con dấu sáp khi chưa mở */}
        <span className="env-cover__seal-glow" aria-hidden="true" />
        <span className="env-cover__seal-ripple" aria-hidden="true" />
      </button>
    </div>
  )
}
