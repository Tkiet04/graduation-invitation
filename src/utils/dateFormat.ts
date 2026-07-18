const WEEKDAYS_VI = [
  'CHỦ NHẬT',
  'THỨ HAI',
  'THỨ BA',
  'THỨ TƯ',
  'THỨ NĂM',
  'THỨ SÁU',
  'THỨ BẢY',
] as const

const MONTHS_EN = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const

export function parseIsoDate(isoDate: string): Date | null {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function getWeekdayVi(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return '—'
  return WEEKDAYS_VI[date.getDay()]
}

export function getMonthEn(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return '—'
  return MONTHS_EN[date.getMonth()]
}

export function getDayNumber(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return '--'
  return String(date.getDate())
}

export function getYear(isoDate: string): string {
  const date = parseIsoDate(isoDate)
  if (!date) return '----'
  return String(date.getFullYear())
}

export function formatTimeRange(start: string, end: string): string {
  const a = start?.trim() || '--:--'
  const b = end?.trim()
  return b ? `${a} - ${b}` : a
}
