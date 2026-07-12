import fs from 'node:fs'
import path from 'node:path'
import { UPLOADS_DIR } from './db.js'

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'jpg'
  return 'png'
}

export function saveImageField(
  invitationId: string,
  field: 'background' | 'main',
  src: string,
): string {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/uploads/')) return src

  const match = src.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
  if (!match) return src

  const mime = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const dir = path.join(UPLOADS_DIR, invitationId)
  fs.mkdirSync(dir, { recursive: true })

  const filename = `${field}.${extFromMime(mime)}`
  const filePath = path.join(dir, filename)
  fs.writeFileSync(filePath, buffer)

  return `/uploads/${invitationId}/${filename}`
}

export function deleteInvitationFiles(invitationId: string) {
  const dir = path.join(UPLOADS_DIR, invitationId)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
