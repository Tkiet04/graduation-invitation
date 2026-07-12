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
            invitations.map((item) => (
              <div key={item.id} className="list-item">
                <div className="list-item__meta">
                  <p className="list-item__name">
                    {item.graduateName} → {item.recipientName}
                  </p>
                  <p className="list-item__sub">/i/{item.id}</p>
                </div>
                <div className="list-item__actions">
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
            ))
          )}
        </section>
      </div>

      <aside className="form-page__preview">
        <InvitationCard data={preview} />
      </aside>
    </div>
  )
}
