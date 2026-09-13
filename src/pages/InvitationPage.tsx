import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { InvitationCard } from '@/components/invitation/InvitationCard'
import { EnvelopeIntro } from '@/components/invitation/EnvelopeIntro'
import { QrShareBox } from '@/components/form/QrShareBox'
import { getInvitation } from '@/services/invitationApi'
import type { InvitationRecord } from '@/types/invitation'
import { DEMO_FORM } from '@/constants/invitationData'
import '@/styles/form.css'

export function InvitationViewPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  /** Chỉ người tạo thiệp mới thấy QR / nút tạo lại */
  const isCreator =
    searchParams.get('created') === '1' || searchParams.get('share') === '1'
  const skipEnvelope = searchParams.get('envelope') === '0'

  const [invitation, setInvitation] = useState<InvitationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showEnvelope, setShowEnvelope] = useState(!skipEnvelope)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (id === 'demo') {
      setInvitation({
        ...DEMO_FORM,
        id: 'demo',
        recipientName: 'TUẤN DUY',
        date: '2026-09-26',
        time: '10:30',
        timeEnd: '11:30',
        createdAt: new Date().toISOString(),
      })
      setNotFound(false)
      setShowEnvelope(!skipEnvelope)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setShowEnvelope(!skipEnvelope)

    getInvitation(id)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setNotFound(true)
          setInvitation(null)
          return
        }
        setInvitation(data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, skipEnvelope])

  const handleEnvelopeOpened = useCallback(() => {
    setShowEnvelope(false)
  }, [])

  if (loading) {
    return <p className="empty-state">Đang tải thư mời...</p>
  }

  if (notFound || !invitation) {
    return (
      <div className="empty-state">
        <h2>Không tìm thấy thư mời</h2>
        <p style={{ margin: '0.75rem 0 1.25rem' }}>
          Link có thể sai hoặc thư mời đã bị xóa.
        </p>
        {isCreator && (
          <Link className="btn btn--primary" to="/">
            Tạo thư mời mới
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="view-page">
      {showEnvelope ? (
        <EnvelopeIntro data={invitation} onOpened={handleEnvelopeOpened} />
      ) : (
        <>
          <InvitationCard data={invitation} />
          {isCreator && (
            <>
              {invitation.latestResponse && (
                <div
                  style={{
                    maxWidth: '420px',
                    width: '100%',
                    margin: '1.25rem auto 0',
                    padding: '1.1rem 1.25rem',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(201, 166, 91, 0.35)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>💌</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#10284c',
                        fontSize: '0.95rem',
                      }}
                    >
                      Phản hồi từ{' '}
                      {invitation.latestResponse.guestName ||
                        invitation.recipientName}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.6rem' }}>
                    <span
                      className={`badge-status ${
                        invitation.latestResponse.attendanceStatus === 'attending'
                          ? 'badge-status--attending'
                          : 'badge-status--declined'
                      }`}
                    >
                      {invitation.latestResponse.attendanceStatus === 'attending'
                        ? '✓ Sẽ có mặt tham dự'
                        : '✕ Xin phép vắng mặt'}
                    </span>
                  </div>
                  {invitation.latestResponse.wish?.trim() ? (
                    <p
                      style={{
                        fontStyle: 'italic',
                        color: '#374151',
                        fontSize: '0.9rem',
                        margin: '0.5rem 0 0',
                        lineHeight: 1.5,
                        background: '#fdfbf7',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        borderLeft: '3px solid #c9a65b',
                      }}
                    >
                      “{invitation.latestResponse.wish.trim()}”
                    </p>
                  ) : (
                    <p
                      style={{
                        fontStyle: 'italic',
                        color: '#9ca3af',
                        fontSize: '0.82rem',
                        margin: 0,
                      }}
                    >
                      (Khách mời chưa để lại lời chúc)
                    </p>
                  )}
                </div>
              )}
              <QrShareBox invitation={invitation} />
              <Link className="btn btn--ghost" to="/">
                ← Tạo thư mời khác
              </Link>
            </>
          )}
        </>
      )}
    </div>
  )
}
