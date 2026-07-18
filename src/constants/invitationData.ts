import type { InvitationFormValues } from '@/types/invitation'

export const EMPTY_FORM: InvitationFormValues = {
  graduateName: '',
  recipientName: '',
  date: '',
  time: '',
  timeEnd: '',
  locationText: '',
  locationAddress: '',
  locationMap: '',
  contactInfo: '',
  message: '',
  schoolCode: '',
  classCode: '',
  cohortYears: '',
  major: '',
  musicUrl: '',
  backgroundImg: '',
  mainImg: '',
}

/** Mặc định thiệp — Nguyễn Tuấn Kiệt · UTC2 · CNTT · K63 */
export const DEMO_FORM: InvitationFormValues = {
  graduateName: 'Nguyễn Tuấn Kiệt',
  recipientName: 'Bạn thân yêu',
  date: '2026-06-21',
  time: '15:30',
  timeEnd: '16:00',
  locationText: 'TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI - PHÂN HIỆU TẠI TP.HCM',
  locationAddress: '450-451 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM',
  locationMap:
    'https://www.google.com/maps/search/?api=1&query=450-451+L%C3%AA+V%C4%83n+Vi%E1%BB%87t,+Th%E1%BB%A7+%C4%90%E1%BB%A9c,+TP.HCM',
  contactInfo: '',
  message: 'Hy vọng trong bức tranh thanh xuân của tớ sẽ có sự góp mặt của cậu',
  schoolCode: 'UTC2',
  classCode: 'K63',
  cohortYears: '2022-2026',
  major: 'CÔNG NGHỆ THÔNG TIN',
  musicUrl: '',
  backgroundImg: '',
  mainImg: '',
}
