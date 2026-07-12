const MAX_SIZE_MB = 3
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_DIMENSION = 900
const JPEG_QUALITY = 0.72

export type ImageProgress = (message: string) => void

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn file ảnh'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error(`Ảnh vượt quá ${MAX_SIZE_MB}MB`))
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const raw = String(reader.result)
        const compressed = await compressDataUrl(raw)
        resolve(compressed)
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Không nén được ảnh'))
      }
    }
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.readAsDataURL(file)
  })
}

export function readMainImageAsDataUrl(
  file: File,
  onProgress?: ImageProgress,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn file ảnh'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error(`Ảnh vượt quá ${MAX_SIZE_MB}MB`))
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const raw = String(reader.result)
        const prepared = await prepareFloatingMainImage(raw, onProgress)
        resolve(prepared)
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Không xử lý được ảnh'))
      }
    }
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.readAsDataURL(file)
  })
}

export function compressDataUrl(
  dataUrl: string,
  options?: { forcePng?: boolean },
): Promise<string> {
  return loadImage(dataUrl).then((img) => {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, width, height)
    const keepPng = options?.forcePng || dataUrl.startsWith('data:image/png')
    return keepPng
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Ảnh không hợp lệ'))
    img.src = src
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.readAsDataURL(blob)
  })
}

async function hasSignificantTransparency(dataUrl: string): Promise<boolean> {
  const img = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  let transparent = 0
  let samples = 0
  const step = Math.max(1, Math.floor(Math.min(width, height) / 80))

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4
      samples++
      if (data[i + 3] < 220) transparent++
    }
  }

  return samples > 0 && transparent / samples > 0.12
}

async function trimTransparentCutout(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl

  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 20) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxX <= minX || maxY <= minY) return dataUrl

  const pad = 0
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const cropW = maxX - minX + 1
  const cropH = maxY - minY + 1
  const out = document.createElement('canvas')
  out.width = cropW
  out.height = cropH
  const outCtx = out.getContext('2d')
  if (!outCtx) return dataUrl
  outCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH)
  return out.toDataURL('image/png')
}

/** Tách nền ảnh chính → PNG cut-out nổi trên background */
export async function prepareFloatingMainImage(
  dataUrl: string,
  onProgress?: ImageProgress,
): Promise<string> {
  onProgress?.('Đang chuẩn bị ảnh...')
  const resized = await compressDataUrl(dataUrl, { forcePng: true })

  if (await hasSignificantTransparency(resized)) {
    onProgress?.('Ảnh đã có nền trong suốt')
    return trimTransparentCutout(resized)
  }

  try {
    onProgress?.('Đang tải AI tách nền...')
    const { removeBackground } = await import('@imgly/background-removal')

    const blob = await removeBackground(resized, {
      model: 'isnet_quint8',
      output: { format: 'image/png', quality: 0.92 },
      progress: (_key, current, total) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100)
          onProgress?.(`Đang tách nền... ${pct}%`)
        }
      },
    })

    onProgress?.('Hoàn tất tách nền')
    const cutout = await blobToDataUrl(blob)
    return trimTransparentCutout(cutout)
  } catch (err) {
    console.warn('AI background removal failed:', err)
    throw new Error(
      'Không tách được nền ảnh. Hãy dùng PNG đã tách nền (cut-out) hoặc thử lại.',
    )
  }
}

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}
