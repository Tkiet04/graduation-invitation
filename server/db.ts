import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const UPLOADS_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  console.error(
    'Thiếu DATABASE_URL. Tạo PostgreSQL (Neon/Render) rồi set biến môi trường DATABASE_URL.',
  )
  process.exit(1)
}

/** Render/Neon thường yêu cầu SSL */
export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
})

export interface InvitationRow {
  id: string
  graduate_name: string
  recipient_name: string
  date: string
  time: string
  time_end: string
  location_text: string
  location_address: string
  location_map: string
  contact_info: string
  facebook_info: string
  message: string
  school_code: string
  class_code: string
  cohort_years: string
  major: string
  music_url: string
  background_img: string
  main_img: string
  created_at: string | Date
}

export interface InvitationPayload {
  id: string
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
  createdAt: string
}

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString()
  return value
}

export function rowToRecord(row: InvitationRow): InvitationPayload {
  return {
    id: row.id,
    graduateName: row.graduate_name,
    recipientName: row.recipient_name,
    date: row.date,
    time: row.time,
    timeEnd: row.time_end ?? '',
    locationText: row.location_text,
    locationAddress: row.location_address,
    locationMap: row.location_map,
    contactInfo: row.contact_info,
    facebookInfo: row.facebook_info ?? '',
    message: row.message ?? '',
    schoolCode: row.school_code ?? '',
    classCode: row.class_code ?? '',
    cohortYears: row.cohort_years ?? '',
    major: row.major ?? '',
    musicUrl: row.music_url ?? '',
    backgroundImg: row.background_img,
    mainImg: row.main_img,
    createdAt: toIso(row.created_at),
  }
}

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      graduate_name TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      time_end TEXT NOT NULL DEFAULT '',
      location_text TEXT NOT NULL,
      location_address TEXT NOT NULL,
      location_map TEXT NOT NULL DEFAULT '',
      contact_info TEXT NOT NULL DEFAULT '',
      facebook_info TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      school_code TEXT NOT NULL DEFAULT '',
      class_code TEXT NOT NULL DEFAULT '',
      cohort_years TEXT NOT NULL DEFAULT '',
      major TEXT NOT NULL DEFAULT '',
      music_url TEXT NOT NULL DEFAULT '',
      background_img TEXT NOT NULL DEFAULT '',
      main_img TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const migrations = [
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS time_end TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS school_code TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS class_code TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS cohort_years TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS major TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS music_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS facebook_info TEXT NOT NULL DEFAULT ''`,
  ]

  for (const sql of migrations) {
    await pool.query(sql)
  }

  console.log('PostgreSQL connected — invitations table ready')
}
