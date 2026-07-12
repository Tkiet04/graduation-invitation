import { useState, type FormEvent } from 'react'
import type { InvitationFormValues } from '@/types/invitation'
import { DEMO_FORM, EMPTY_FORM } from '@/constants/invitationData'
import { ImageUploadField } from '@/components/form/ImageUploadField'

interface InvitationFormProps {
  initial?: InvitationFormValues
  onSubmit: (values: InvitationFormValues) => void
  onChange?: (values: InvitationFormValues) => void
  submitting?: boolean
}

export function InvitationForm({
  initial = DEMO_FORM,
  onSubmit,
  onChange,
  submitting = false,
}: InvitationFormProps) {
  const [values, setValues] = useState<InvitationFormValues>(initial)
  const [error, setError] = useState('')

  function update<K extends keyof InvitationFormValues>(
    key: K,
    value: InvitationFormValues[K],
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      onChange?.(next)
      return next
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.graduateName.trim()) {
      setError('Vui lòng nhập tên người tốt nghiệp')
      return
    }
    if (!values.recipientName.trim()) {
      setError('Vui lòng nhập tên người nhận')
      return
    }
    if (!values.date || !values.time) {
      setError('Vui lòng nhập ngày và giờ')
      return
    }
    if (!values.locationText.trim() || !values.locationAddress.trim()) {
      setError('Vui lòng nhập địa điểm và địa chỉ')
      return
    }
    setError('')
    onSubmit(values)
  }

  function handleReset() {
    setValues(EMPTY_FORM)
    onChange?.(EMPTY_FORM)
    setError('')
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <h2 className="form-panel__title">Tạo thư mời</h2>
      <p className="form-panel__desc">
        Điền thông tin — xem trước bên cạnh — tạo QR riêng cho từng người nhận.
      </p>

      <div className="form-grid form-grid--2">
        <div className="form-field">
          <label htmlFor="graduateName">Tên người tốt nghiệp</label>
          <input
            id="graduateName"
            value={values.graduateName}
            onChange={(e) => update('graduateName', e.target.value)}
            placeholder="Thiên Ân"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="recipientName">Tên người nhận</label>
          <input
            id="recipientName"
            value={values.recipientName}
            onChange={(e) => update('recipientName', e.target.value)}
            placeholder="Bạn thân yêu"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="date">Ngày</label>
          <input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="time">Giờ</label>
          <input
            id="time"
            type="time"
            value={values.time}
            onChange={(e) => update('time', e.target.value)}
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationText">Địa điểm (text)</label>
          <input
            id="locationText"
            value={values.locationText}
            onChange={(e) => update('locationText', e.target.value)}
            placeholder="Sảnh A Trường Đại Học..."
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationAddress">Địa chỉ</label>
          <input
            id="locationAddress"
            value={values.locationAddress}
            onChange={(e) => update('locationAddress', e.target.value)}
            placeholder="114 ngõ 23 đường Hồng Bàng..."
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationMap">Link Google Maps</label>
          <input
            id="locationMap"
            type="url"
            value={values.locationMap}
            onChange={(e) => update('locationMap', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="contactInfo">Thông tin liên lạc</label>
          <input
            id="contactInfo"
            value={values.contactInfo}
            onChange={(e) => update('contactInfo', e.target.value)}
            placeholder="0901 234 567 · facebook.com/..."
          />
        </div>

        <ImageUploadField
          label="Ảnh nền (background)"
          value={values.backgroundImg}
          onChange={(v) => update('backgroundImg', v)}
          hint="Ảnh phía sau (grayscale) — nên dùng ảnh chân dung"
        />

        <ImageUploadField
          label="Ảnh chính (foreground)"
          value={values.mainImg}
          onChange={(v) => update('mainImg', v)}
          floating
          hint="Tự động tách nền khi upload — chỉ giữ người, nổi trên background như mẫu"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Tạo thư mời + QR'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleReset}
          disabled={submitting}
        >
          Xóa form
        </button>
      </div>
    </form>
  )
}
