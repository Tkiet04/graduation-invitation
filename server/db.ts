import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'invitations.db')

fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')

db.exec(`
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
    created_at TEXT NOT NULL
  )
`)

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
  created_at: string
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
    createdAt: row.created_at,
  }
}

export const UPLOADS_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })
