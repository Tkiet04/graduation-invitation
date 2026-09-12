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
  facebookInfo: '',
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
  date: '2026-09-26',
  time: '10:00',
  timeEnd: '11:00',
  locationText: 'TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI PHÂN HIỆU TẠI TP.HCM',
  locationAddress: '450-451 Lê Văn Việt, P. Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM',
  locationMap:
    'https://www.google.com/maps/place/Ph%C3%A2n+hi%E1%BB%87u+Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+GTVT+t%E1%BA%A1i+Tp.+H%E1%BB%93+Ch%C3%AD+Minh/@10.845696,106.7915971,17z/data=!3m1!4b1!4m6!3m5!1s0x317527158a0a5b81:0xf45c5d34ac580517!8m2!3d10.845696!4d106.794172!16s%2Fg%2F1219msrk?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D',
  contactInfo: '036 949 8372',
  facebookInfo: 'https://www.facebook.com/share/1KBhxoLhsb/',
  message: 'Hy vọng trong bức tranh thanh xuân của tớ sẽ có sự góp mặt của cậu',
  schoolCode: 'UTC2',
  classCode: 'K63',
  cohortYears: '2022-2026',
  major: 'CÔNG NGHỆ THÔNG TIN',
  musicUrl: '',
  backgroundImg: '',
  mainImg: '',
}
