import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { InvitationRecord } from '@/types/invitation'
import { getInvitationPublicUrl } from '@/services/invitationApi'

interface QrShareBoxProps {
  invitation: InvitationRecord
}

export function QrShareBox({ invitation }: QrShareBoxProps) {
  const url = useMemo(
    () => getInvitationPublicUrl(invitation.id),
    [invitation.id],
  )
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy link:', url)
    }
  }

  return (
    <div className="share-box">
      <h3 className="share-box__title">Mã QR — gửi cho {invitation.recipientName}</h3>
      <p className="share-box__desc">
        Quét QR bất kỳ lúc nào để xem thư mời — dữ liệu lưu trên server.
      </p>

      <div className="share-box__qr">
        <QRCodeSVG value={url} size={180} level="M" includeMargin />
      </div>

      <p className="share-box__url">{url}</p>

      <div className="form-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn--primary" onClick={copyLink}>
          {copied ? 'Đã copy!' : 'Copy link'}
        </button>
        <a className="btn btn--ghost" href={url} target="_blank" rel="noreferrer">
          Mở thư mời
        </a>
      </div>
    </div>
  )
}
