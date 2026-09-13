import type {
  GuestResponseInput,
  GuestResponseRecord,
  InvitationFormValues,
  InvitationRecord,
} from '@/types/invitation'

const API = '/api/invitations'

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Lỗi API (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  const res = await fetch(API)
  return parseResponse(res)
}

export async function getInvitation(id: string): Promise<InvitationRecord | null> {
  const res = await fetch(`${API}/${id}`)
  if (res.status === 404) return null
  return parseResponse(res)
}

export async function createInvitation(
  values: InvitationFormValues,
): Promise<InvitationRecord> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  return parseResponse(res)
}

export async function deleteInvitation(id: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
  if (res.status === 404) {
    throw new Error('Không tìm thấy thư mời')
  }
  if (!res.ok) {
    throw new Error(`Lỗi xóa (${res.status})`)
  }
}

export async function submitGuestResponse(
  invitationId: string,
  input: GuestResponseInput,
): Promise<GuestResponseRecord> {
  const res = await fetch(`${API}/${invitationId}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse(res)
}

export async function getGuestResponses(
  invitationId: string,
): Promise<GuestResponseRecord[]> {
  const res = await fetch(`${API}/${invitationId}/responses`)
  return parseResponse(res)
}

export async function getGuestResponse(
  invitationId: string,
  responseId: string,
): Promise<GuestResponseRecord | null> {
  const res = await fetch(`${API}/${invitationId}/responses/${responseId}`)
  if (res.status === 404) return null
  return parseResponse(res)
}

export async function updateGuestResponse(
  invitationId: string,
  responseId: string,
  input: GuestResponseInput,
): Promise<GuestResponseRecord> {
  const res = await fetch(`${API}/${invitationId}/responses/${responseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse(res)
}

export function getInvitationPublicUrl(id: string): string {
  return `${window.location.origin}/i/${id}`
}
