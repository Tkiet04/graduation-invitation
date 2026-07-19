import { useState, type FormEvent } from 'react'
import type { InvitationFormValues } from '@/types/invitation'
import { DEMO_FORM, EMPTY_FORM } from '@/constants/invitationData'
import { ImageUploadField } from '@/components/form/ImageUploadField'
import { AudioUploadField } from '@/components/form/AudioUploadField'

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
    if (!values.locationAddress.trim()) {
      setError('Vui lòng nhập địa chỉ map (LOCATION)')
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
        Thiết kế theo mẫu Graduation Ceremony — điền thông tin, xem trước, tạo QR.
      </p>

      <div className="form-grid form-grid--2">
        <div className="form-field">
          <label htmlFor="graduateName">Tên người tốt nghiệp</label>
          <input
            id="graduateName"
            value={values.graduateName}
            onChange={(e) => update('graduateName', e.target.value)}
            placeholder="Nguyễn Tuấn Kiệt"
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
          <label htmlFor="schoolCode">Mã trường (ruy-băng trái)</label>
          <input
            id="schoolCode"
            value={values.schoolCode}
            onChange={(e) => update('schoolCode', e.target.value)}
            placeholder="UTC2"
          />
        </div>

        <div className="form-field">
          <label htmlFor="classCode">Khóa / lớp (ruy-băng phải)</label>
          <input
            id="classCode"
            value={values.classCode}
            onChange={(e) => update('classCode', e.target.value)}
            placeholder="K63"
          />
        </div>

        <div className="form-field">
          <label htmlFor="cohortYears">Niên khóa</label>
          <input
            id="cohortYears"
            value={values.cohortYears}
            onChange={(e) => update('cohortYears', e.target.value)}
            placeholder="2022-2026"
          />
        </div>

        <div className="form-field">
          <label htmlFor="major">Ngành (đáy ruy-băng phải)</label>
          <input
            id="major"
            value={values.major}
            onChange={(e) => update('major', e.target.value)}
            placeholder="CÔNG NGHỆ THÔNG TIN"
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
          <label htmlFor="time">Giờ bắt đầu</label>
          <input
            id="time"
            type="time"
            value={values.time}
            onChange={(e) => update('time', e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="timeEnd">Giờ kết thúc</label>
          <input
            id="timeEnd"
            type="time"
            value={values.timeEnd}
            onChange={(e) => update('timeEnd', e.target.value)}
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="message">Lời nhắn</label>
          <textarea
            id="message"
            rows={2}
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Hy vọng trong bức tranh thanh xuân của tớ sẽ có sự góp mặt của cậu"
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationText">Tên trường (đầu thiệp)</label>
          <input
            id="locationText"
            value={values.locationText}
            onChange={(e) => update('locationText', e.target.value)}
            placeholder="TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI PHÂN HIỆU TẠI TP.HCM"
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationAddress">Địa chỉ map (LOCATION)</label>
          <input
            id="locationAddress"
            value={values.locationAddress}
            onChange={(e) => update('locationAddress', e.target.value)}
            placeholder="450-451 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM"
            required
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="locationMap">Link Google Maps (nút Chỉ đường)</label>
          <input
            id="locationMap"
            type="url"
            value={values.locationMap}
            onChange={(e) => update('locationMap', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <AudioUploadField
          label="Nhạc nền của bạn"
          value={values.musicUrl}
          onChange={(v) => update('musicUrl', v)}
          hint="Upload mp3/wav (tối đa 5MB) hoặc dán link — để trống = không có nhạc nền"
        />

        <div className="form-field form-field--full">
          <label htmlFor="contactInfo">Số điện thoại</label>
          <input
            id="contactInfo"
            value={values.contactInfo}
            onChange={(e) => update('contactInfo', e.target.value)}
            placeholder="0901 234 567"
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="facebookInfo">Facebook</label>
          <input
            id="facebookInfo"
            value={values.facebookInfo}
            onChange={(e) => update('facebookInfo', e.target.value)}
            placeholder="facebook.com/tenban hoặc link"
          />
        </div>

        <ImageUploadField
          label="Ảnh nền lụa (tuỳ chọn)"
          value={values.backgroundImg}
          onChange={(v) => update('backgroundImg', v)}
          hint="Để trống = nền lụa mặc định theo mẫu"
        />

        <ImageUploadField
          label="Logo trường (tuỳ chọn)"
          value={values.mainImg}
          onChange={(v) => update('mainImg', v)}
          hint="Để trống = logo UTC chính thức (hình tròn)"
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
