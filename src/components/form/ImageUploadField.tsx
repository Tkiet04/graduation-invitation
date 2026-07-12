import { useRef, useState, type ChangeEvent } from 'react'
import {
  readFileAsDataUrl,
  readMainImageAsDataUrl,
  prepareFloatingMainImage,
} from '@/utils/image'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (dataUrl: string) => void
  hint?: string
  floating?: boolean
}

export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  floating = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [urlDraft, setUrlDraft] = useState('')
  const [processing, setProcessing] = useState('')

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setError('')
      setProcessing(floating ? 'Đang xử lý ảnh...' : '')
      const dataUrl = floating
        ? await readMainImageAsDataUrl(file, setProcessing)
        : await readFileAsDataUrl(file)
      onChange(dataUrl)
      setUrlDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đọc ảnh')
    } finally {
      setProcessing('')
      e.target.value = ''
    }
  }

  async function applyUrl() {
    const url = urlDraft.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      setError('Link ảnh phải bắt đầu bằng http:// hoặc https://')
      return
    }
    try {
      setError('')
      if (floating) {
        setProcessing('Đang tải và tách nền...')
        const processed = await prepareFloatingMainImage(url, setProcessing)
        onChange(processed)
      } else {
        onChange(url)
      }
      setUrlDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không xử lý được ảnh')
    } finally {
      setProcessing('')
    }
  }

  return (
    <div className="form-field form-field--full">
      <label>{label}</label>
      <div className="image-upload">
        {value ? (
          <img className="image-upload__preview" src={value} alt="Preview" />
        ) : (
          <div className="image-upload__preview" />
        )}
        <div className="image-upload__row">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => inputRef.current?.click()}
            disabled={!!processing}
          >
            {processing || 'Upload ảnh'}
          </button>
          {value && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                onChange('')
                setUrlDraft('')
              }}
              disabled={!!processing}
            >
              Xóa
            </button>
          )}
        </div>
        <div className="image-upload__row" style={{ marginTop: '0.5rem' }}>
          <input
            type="url"
            placeholder="Hoặc dán link ảnh (Imgur, Drive...)"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            disabled={!!processing}
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={applyUrl}
            disabled={!!processing}
          >
            Dùng link
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
        />
      </div>
      {hint && (
        <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {hint}
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
