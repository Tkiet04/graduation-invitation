import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getGuestResponse,
  getGuestResponses,
  getInvitation,
  submitGuestResponse,
  updateGuestResponse,
} from '@/services/invitationApi'
import type { GuestResponseRecord, InvitationRecord } from '@/types/invitation'
import { DEMO_FORM } from '@/constants/invitationData'
import '@/styles/confirmation.css'

type AttendanceStatus = 'attending' | 'declined'

function formatEventDate(dateValue: string): string {
  const [year, month, day] = dateValue.split('-')
  if (!year || !month || !day) return 'ngày diễn ra buổi lễ'
  return `${day}.${month}.${year}`
}

export function ConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null)
  const [status, setStatus] = useState<AttendanceStatus | null>(null)
  const [guestName, setGuestName] = useState('')
  const [wish, setWish] = useState('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const invitationId = id
    let cancelled = false
    const storageKey = `invitation-response:${invitationId}`

    async function loadInvitationAndResponse() {
      try {
        const data =
          invitationId === 'demo'
            ? {
                ...DEMO_FORM,
                id: 'demo',
                recipientName: 'TUẤN DUY',
                date: '2026-09-26',
                time: '10:30',
                timeEnd: '11:30',
                createdAt: new Date().toISOString(),
              }
            : await getInvitation(invitationId)

        if (cancelled) return
        setInvitation(data)
        if (!data) return

        // Mặc định tên khách mời lấy theo dữ liệu của thiệp trong DB
        if (data.recipientName?.trim()) {
          setGuestName(data.recipientName.trim())
        }

        if (invitationId === 'demo') {
          return
        }

        let response: GuestResponseRecord | null = null
        const savedResponseId = window.localStorage.getItem(storageKey)
        if (savedResponseId) {
          response = await getGuestResponse(invitationId, savedResponseId)
          if (!response) {
            window.localStorage.removeItem(storageKey)
          }
        }

        // Nếu trình duyệt chưa lưu responseId (ví dụ người mời mở xem),
        // tự động lấy phản hồi đã lưu của thiệp từ server
        if (!response) {
          if (data.latestResponse) {
            response = data.latestResponse
          } else {
            const list = await getGuestResponses(invitationId)
            if (list.length > 0) {
              response = list[0]
            }
          }
        }

        if (cancelled || !response) return

        setResponseId(response.id)
        setStatus(response.attendanceStatus)
        if (response.guestName?.trim()) {
          setGuestName(response.guestName.trim())
        }
        setWish(response.wish)
        setSubmitted(true)
      } catch {
        if (!cancelled) setInvitation(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInvitationAndResponse()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id || !status) {
      setError('Vui lòng chọn trạng thái tham dự.')
      return
    }
    if (!guestName.trim()) {
      setError('Vui lòng nhập tên khách mời.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const input = {
        attendanceStatus: status,
        guestName: guestName.trim(),
        wish,
      }
      if (id === 'demo') {
        setSubmitted(true)
        return
      }
      const response = responseId
        ? await updateGuestResponse(id, responseId, input)
        : await submitGuestResponse(id, input)

      window.localStorage.setItem(`invitation-response:${id}`, response.id)
      setResponseId(response.id)
      setSubmitted(true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Không thể lưu xác nhận lúc này.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="confirm-state">Đang tải biểu mẫu...</p>
  }

  if (!invitation) {
    return (
      <div className="confirm-state">
        <h1>Không tìm thấy thư mời</h1>
        <Link className="confirm-page__back" to="/">
          Về trang chủ
        </Link>
      </div>
    )
  }

  const eventDate = formatEventDate(invitation.date)
  const guestDisplayName = guestName.trim() || 'bạn'

  return (
    <main className="confirm-page">
      <section className="confirm-panel" aria-labelledby="confirm-title">
        <Link className="confirm-back" to={`/i/${invitation.id}?envelope=0`}>
          ← Xem lại thư mời
        </Link>

        {/* <p className="confirm-kicker">{invitation.graduateName || 'Thư mời tốt nghiệp'} trân trọng</p> */}
        <h1 id="confirm-title">Xác nhận tham dự</h1>
        <p className="confirm-intro">
          Tớ rất mong được đón tiếp cậu trong ngày tốt nghiệp. Hãy cho tớ biết cậu có thể đến tham dự không nhé!
        </p>

        {submitted ? (
          <div className="confirm-success" role="status" aria-live="polite">
            <span className="confirm-success__mark" aria-hidden="true">✓</span>
            <p className="confirm-success__message">
              {status === 'attending'
                ? `Cảm ơn bạn đã xác nhận tham dự! Hẹn gặp bạn ngày ${eventDate}.`
                : `Cảm ơn bạn đã phản hồi. Rất tiếc vì không thể đón tiếp bạn lần này!`}
            </p>
            {wish.trim() ? (
              <section className="confirm-wish" aria-label="Lời chúc đã gửi">
                <p className="confirm-wish__kicker">GÓC KỶ NIỆM</p>
                <h2>Những lời chúc yêu thương</h2>
                <div className="confirm-wish__card">
                  <p>{wish.trim()}</p>
                  <strong>{guestDisplayName}</strong>
                </div>
              </section>
            ) : (
              <p style={{ fontStyle: 'italic', color: '#687083', margin: '1rem 0', fontSize: '0.85rem' }}>
                (Khách mời chưa để lại lời chúc bằng chữ)
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.75rem' }}>
              <button
                type="button"
                className="confirm-back"
                style={{
                  cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid #c9a65b',
                  borderRadius: '999px',
                  padding: '0.5rem 1rem',
                  color: '#10284c',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
                onClick={() => setSubmitted(false)}
              >
                ✎ Chỉnh sửa phản hồi
              </button>
            </div>
          </div>
        ) : (
          <form className="confirm-form" onSubmit={handleSubmit}>
            <div className="confirm-options" role="group" aria-label="Trạng thái tham dự">
              <button
                className={`confirm-option${status === 'attending' ? ' is-selected' : ''}`}
                type="button"
                aria-pressed={status === 'attending'}
                onClick={() => setStatus('attending')}
              >
                Sẽ có mặt
              </button>
              <button
                className={`confirm-option${status === 'declined' ? ' is-selected' : ''}`}
                type="button"
                aria-pressed={status === 'declined'}
                onClick={() => setStatus('declined')}
              >
                Xin phép vắng
              </button>
            </div>

            <label className="confirm-field confirm-field--name">
              <span>Tên khách mời</span>
              <input
                value={guestName}
                maxLength={120}
                onChange={(event) => setGuestName(event.target.value)}
                placeholder={invitation.recipientName || 'Nhập tên của bạn...'}
                autoComplete="name"
                required
              />
            </label>

            <label className="confirm-field">
              <span>Lời chúc thân thương</span>
              <textarea
                value={wish}
                maxLength={500}
                onChange={(event) => setWish(event.target.value)}
                placeholder="Viết lời chúc của bạn..."
                rows={4}
              />
            </label>

            {error && <p className="confirm-error" role="alert">{error}</p>}

            <button className="confirm-submit" type="submit" disabled={submitting}>
              {submitting
                ? 'Đang lưu...'
                : responseId
                  ? 'Cập nhật xác nhận'
                  : 'Gửi xác nhận'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
