/**
 * Ảnh được lưu trực tiếp vào PostgreSQL (data URL / URL ngoài).
 * Không ghi disk — tránh mất ảnh khi Render free restart/redeploy.
 */
export function saveImageField(src: string): string {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('data:image/')) return src
  if (src.startsWith('/uploads/')) return src
  return src
}

export function deleteInvitationFiles(_invitationId: string) {
  // Ảnh nằm trong DB — không còn file local cần xóa.
}
