import { useRef, useState, type ChangeEvent } from 'react'

const MAX_SIZE_MB = 5
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPT = 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,.mp3,.wav,.ogg,.m4a'

interface AudioUploadFieldProps {
  label: string
  value: string
  onChange: (src: string) => void
  hint?: string
}

function readAudioAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
      reject(new Error('Vui lòng chọn file nhạc (mp3, wav, ogg, m4a)'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error(`File nhạc vượt quá ${MAX_SIZE_MB}MB`))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Không đọc được file nhạc'))
    reader.readAsDataURL(file)
  })
}

function musicLabel(value: string): string {
  if (!value) return ''
  if (value.startsWith('data:audio')) return 'Nhạc đã tải lên (file của bạn)'
  if (/^https?:\/\//i.test(value)) return value
  return 'Nhạc tùy chỉnh'
}

export function AudioUploadField({
  label,
  value,
  onChange,
  hint,
}: AudioUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [urlDraft, setUrlDraft] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setError('')
      setLoading(true)
      const dataUrl = await readAudioAsDataUrl(file)
      onChange(dataUrl)
      setUrlDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi đọc file nhạc')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  function applyUrl() {
    const url = urlDraft.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      setError('Link nhạc phải bắt đầu bằng http:// hoặc https://')
      return
    }
    setError('')
    onChange(url)
    setUrlDraft('')
  }

  return (
    <div className="form-field form-field--full">
      <label>{label}</label>
      <div className="audio-upload">
        {value ? (
          <p className="audio-upload__status">{musicLabel(value)}</p>
        ) : (
          <p className="audio-upload__status audio-upload__status--empty">
            Chưa chọn — thiệp sẽ không có nhạc nền
          </p>
        )}

        <div className="image-upload__row">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            hidden
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn btn--ghost"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? 'Đang tải...' : 'Chọn file nhạc'}
          </button>
          {value && (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => onChange('')}
            >
              Xóa nhạc
            </button>
          )}
        </div>

        <div className="image-upload__row" style={{ marginTop: '0.5rem' }}>
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Hoặc dán link https://...mp3"
          />
          <button type="button" className="btn btn--ghost" onClick={applyUrl}>
            Dùng link
          </button>
        </div>

        {hint && <p className="audio-upload__hint">{hint}</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    </div>
  )
}
