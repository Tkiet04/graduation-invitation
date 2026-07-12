import type { InvitationFormValues } from '@/types/invitation'

export const EMPTY_FORM: InvitationFormValues = {
  graduateName: '',
  recipientName: '',
  date: '',
  time: '',
  locationText: '',
  locationAddress: '',
  locationMap: '',
  contactInfo: '',
  backgroundImg: '',
  mainImg: '',
}

export const DEMO_FORM: InvitationFormValues = {
  graduateName: 'Thiên Ân',
  recipientName: 'Bạn thân yêu',
  date: '2026-06-06',
  time: '10:30',
  locationText: 'Sảnh A Trường Đại Học Hữu Duyên Nè',
  locationAddress: '114 ngõ 23 đường Hồng Bàng, Q3, TP Hồ Chí Minh',
  locationMap: 'https://maps.google.com/?q=114+ngõ+23+đường+Hồng+Bàng,+Q3,+TP+Hồ+Chí+Minh',
  contactInfo: '0901 234 567',
  backgroundImg: '',
  mainImg: '',
}
