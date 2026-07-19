export interface InvitationFormValues {
  graduateName: string
  recipientName: string
  date: string
  time: string
  timeEnd: string
  locationText: string
  locationAddress: string
  locationMap: string
  contactInfo: string
  facebookInfo: string
  message: string
  schoolCode: string
  classCode: string
  cohortYears: string
  major: string
  musicUrl: string
  backgroundImg: string
  mainImg: string
}

export interface InvitationRecord extends InvitationFormValues {
  id: string
  createdAt: string
}

export type InvitationFormInput = Omit<InvitationFormValues, 'backgroundImg' | 'mainImg'> & {
  backgroundImg: string | null
  mainImg: string | null
}
