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
  location_text: string
  location_address: string
  location_map: string
  contact_info: string
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
  locationText: string
  locationAddress: string
  locationMap: string
  contactInfo: string
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
    locationText: row.location_text,
    locationAddress: row.location_address,
    locationMap: row.location_map,
    contactInfo: row.contact_info,
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
      location_text TEXT NOT NULL,
      location_address TEXT NOT NULL,
      location_map TEXT NOT NULL DEFAULT '',
      contact_info TEXT NOT NULL DEFAULT '',
      background_img TEXT NOT NULL DEFAULT '',
      main_img TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  console.log('PostgreSQL connected — invitations table ready')
}
