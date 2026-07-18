import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { InvitationCard } from '@/components/invitation/InvitationCard'
import { EnvelopeIntro } from '@/components/invitation/EnvelopeIntro'
import { QrShareBox } from '@/components/form/QrShareBox'
import { getInvitation } from '@/services/invitationApi'
import type { InvitationRecord } from '@/types/invitation'
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
