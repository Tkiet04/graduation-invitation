import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { InvitationForm } from '@/components/form/InvitationForm'
import { InvitationCard } from '@/components/invitation/InvitationCard'
import { DEMO_FORM } from '@/constants/invitationData'
import type { InvitationFormValues, InvitationRecord } from '@/types/invitation'
import {
  createInvitation,
  deleteInvitation,
  listInvitations,
} from '@/services/invitationApi'
import '@/styles/form.css'

export function CreatePage() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState<InvitationFormValues>(DEMO_FORM)
  const [invitations, setInvitations] = useState<InvitationRecord[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedWishInvitation, setSelectedWishInvitation] = useState<InvitationRecord | null>(null)

  async function loadList() {
    try {
      setLoadingList(true)
      const data = await listInvitations()
      setInvitations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  async function handleSubmit(values: InvitationFormValues) {
    try {
      setSaving(true)
      setError('')
      const record = await createInvitation(values)
      await loadList()
      navigate(`/i/${record.id}?created=1`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được thư mời')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa thư mời này?')) return
    try {
      await deleteInvitation(id)
      await loadList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xóa được')
    }
  }

  return (
    <div className="form-page">
      <div>
        <InvitationForm
          initial={DEMO_FORM}
          onChange={setPreview}
          onSubmit={handleSubmit}
          submitting={saving}
        />

        {error && <p className="form-error">{error}</p>}

        <section className="form-panel list-panel">
          <h2 className="form-panel__title">Thư mời đã tạo</h2>
          <p className="form-panel__desc">
            Lưu trên server — QR/link ngắn, quét bất kỳ lúc nào đều xem được.
          </p>

          {loadingList ? (
            <p className="empty-state">Đang tải...</p>
          ) : invitations.length === 0 ? (
            <p className="empty-state">Chưa có thư mời nào.</p>
          ) : (
            invitations.map((item) => {
              const resp = item.latestResponse
              return (
                <div key={item.id} className="list-item">
                  <div className="list-item__meta">
                    <p className="list-item__name">
                      {item.graduateName} → {item.recipientName}
                    </p>
                    <p className="list-item__sub">/i/{item.id}</p>
                    <div className="list-item__status-row">
                      {resp ? (
                        <>
                          <span
                            className={`badge-status ${
                              resp.attendanceStatus === 'attending'
                                ? 'badge-status--attending'
                                : 'badge-status--declined'
                            }`}
                          >
                            {resp.attendanceStatus === 'attending'
                              ? '✓ Sẽ có mặt'
                              : '✕ Xin phép vắng'}
                          </span>
                          {resp.wish?.trim() ? (
                            <span
                              className="list-item__wish-snippet"
                              title={resp.wish.trim()}
                            >
                              “{resp.wish.trim()}”
                            </span>
                          ) : (
                            <span className="list-item__wish-snippet">
                              (Chưa để lại lời chúc)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="badge-status badge-status--pending">
                          Chưa phản hồi
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="list-item__actions">
                    {resp && (
                      <button
                        type="button"
                        className="btn btn--wish"
                        onClick={() => setSelectedWishInvitation(item)}
                        title="Xem lời chúc từ khách mời"
                      >
                        💌 Lời chúc
                      </button>
                    )}
                    <Link className="btn btn--ghost" to={`/i/${item.id}`}>
                      Xem
                    </Link>
                    <Link className="btn btn--primary" to={`/i/${item.id}?share=1`}>
                      QR
                    </Link>
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </section>

        {selectedWishInvitation && selectedWishInvitation.latestResponse && (
          <div
            className="wish-modal-overlay"
            onClick={() => setSelectedWishInvitation(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wish-modal-title"
          >
            <div className="wish-modal" onClick={(e) => e.stopPropagation()}>
              <div className="wish-modal__header">
                <h3 id="wish-modal-title" className="wish-modal__title">
                  💌 Lời chúc từ khách mời
                </h3>
                <button
                  type="button"
                  className="wish-modal__close"
                  onClick={() => setSelectedWishInvitation(null)}
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>

              <div className="wish-modal__body">
                <div className="wish-modal__info-row">
                  <span style={{ color: '#9ca3af' }}>Khách mời:</span>
                  <span className="wish-modal__guest-name">
                    {selectedWishInvitation.latestResponse.guestName ||
                      selectedWishInvitation.recipientName}
                  </span>
                </div>

                <div className="wish-modal__info-row">
                  <span style={{ color: '#9ca3af' }}>Trạng thái:</span>
                  <span
                    className={`badge-status ${
                      selectedWishInvitation.latestResponse.attendanceStatus === 'attending'
                        ? 'badge-status--attending'
                        : 'badge-status--declined'
                    }`}
                  >
                    {selectedWishInvitation.latestResponse.attendanceStatus === 'attending'
                      ? '✓ Sẽ có mặt tham dự'
                      : '✕ Xin phép vắng mặt'}
                  </span>
                </div>

                <div className="wish-modal__info-row">
                  <span style={{ color: '#9ca3af' }}>Thư mời:</span>
                  <span style={{ color: '#e5e7eb', fontSize: '0.85rem' }}>
                    {selectedWishInvitation.graduateName} → {selectedWishInvitation.recipientName}
                  </span>
                </div>

                <div>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                    Nội dung lời chúc:
                  </p>
                  {selectedWishInvitation.latestResponse.wish?.trim() ? (
                    <div className="wish-modal__quote">
                      “{selectedWishInvitation.latestResponse.wish.trim()}”
                    </div>
                  ) : (
                    <p className="wish-modal__empty-wish">
                      (Khách mời không để lại lời chúc dạng chữ)
                    </p>
                  )}
                </div>

                {selectedWishInvitation.latestResponse.createdAt && (
                  <div className="wish-modal__time">
                    Gửi lúc:{' '}
                    {new Date(
                      selectedWishInvitation.latestResponse.createdAt,
                    ).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>

              <div className="wish-modal__actions">
                <Link
                  className="btn btn--primary"
                  to={`/i/${selectedWishInvitation.id}`}
                  onClick={() => setSelectedWishInvitation(null)}
                >
                  Xem thư mời
                </Link>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setSelectedWishInvitation(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="form-page__preview">
        <InvitationCard data={preview} />
      </aside>
    </div>
  )
}
