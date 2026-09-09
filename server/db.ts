import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const UPLOADS_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const DATA_DIR = path.join(__dirname, 'data')
fs.mkdirSync(DATA_DIR, { recursive: true })
const LOCAL_DB_FILE = path.join(DATA_DIR, 'local-db.json')

const connectionString = process.env.DATABASE_URL?.trim()

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

export interface GuestResponseRow {
  id: string
  invitation_id: string
  guest_name: string
  attendance_status: 'attending' | 'declined'
  wish: string
  created_at: string | Date
}

export interface GuestResponsePayload {
  id: string
  invitationId: string
  guestName: string
  attendanceStatus: 'attending' | 'declined'
  wish: string
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

// ----------------------------------------------------
// Local JSON Storage Engine (Dự phòng tự động khi thiếu Postgres)
// ----------------------------------------------------
interface LocalDatabase {
  invitations: InvitationRow[]
  guest_responses: Array<{
    id: string
    invitation_id: string
    guest_name: string
    attendance_status: 'attending' | 'declined'
    wish: string
    created_at: string
  }>
}

function readLocalDb(): LocalDatabase {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      return {
        invitations: Array.isArray(parsed.invitations) ? parsed.invitations : [],
        guest_responses: Array.isArray(parsed.guest_responses) ? parsed.guest_responses : [],
      }
    }
  } catch (err) {
    console.error('Lỗi đọc local-db.json:', err)
  }
  return { invitations: [], guest_responses: [] }
}

function writeLocalDb(db: LocalDatabase): void {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(db, null, 2), 'utf-8')
  } catch (err) {
    console.error('Lỗi ghi local-db.json:', err)
  }
}

// ----------------------------------------------------
// Database Manager (PostgreSQL + Local Fallback)
// ----------------------------------------------------
let realPool: pg.Pool | null = null
let isDbReady = false
let isUsingLocalDb = false
let lastDbError: string | null = null

function getSslConfig(url: string) {
  if (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('sslmode=disable')
  ) {
    return false
  }
  return { rejectUnauthorized: false }
}

if (connectionString) {
  try {
    realPool = new Pool({
      connectionString,
      ssl: getSslConfig(connectionString),
      connectionTimeoutMillis: 10000,
    })
  } catch (err) {
    console.error('Không thể tạo PostgreSQL Pool:', err)
  }
}

async function setupPostgres(p: pg.Pool): Promise<void> {
  await p.query(`
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

  await p.query(`
    CREATE TABLE IF NOT EXISTS guest_responses (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
      guest_name TEXT NOT NULL DEFAULT '',
      attendance_status TEXT NOT NULL CHECK (attendance_status IN ('attending', 'declined')),
      wish TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await p.query(
    'CREATE INDEX IF NOT EXISTS guest_responses_invitation_id_idx ON guest_responses(invitation_id)',
  )

  const migrations = [
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS time_end TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS message TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS school_code TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS class_code TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS cohort_years TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS major TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS music_url TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS facebook_info TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE guest_responses ADD COLUMN IF NOT EXISTS guest_name TEXT NOT NULL DEFAULT ''`,
  ]

  for (const sql of migrations) {
    await p.query(sql).catch(() => {})
  }
}

export async function initDb(): Promise<void> {
  if (!connectionString || !realPool) {
    console.warn(
      '⚠️ [DB] Chưa cấu hình DATABASE_URL -> Đang chạy chế độ Local JSON DB (server/data/local-db.json). Dữ liệu vẫn được lưu trữ an toàn cục bộ.',
    )
    isUsingLocalDb = true
    isDbReady = true
    return
  }

  console.log('🔗 [DB] Đang kết nối PostgreSQL...')
  try {
    await setupPostgres(realPool)
    isDbReady = true
    isUsingLocalDb = false
    lastDbError = null
    console.log('✅ [DB] Kết nối PostgreSQL thành công — bảng invitations & guest_responses sẵn sàng!')
  } catch (err) {
    lastDbError = err instanceof Error ? err.message : String(err)
    console.error('❌ [DB] Không thể kết nối PostgreSQL:', lastDbError)
    console.warn(
      '⚠️ [DB] Tự động kích hoạt Local JSON DB để server tiếp tục hoạt động và tránh lỗi 502 Bad Gateway!',
    )
    isUsingLocalDb = true
    isDbReady = true
  }
}

export function getDbStatus() {
  return {
    ready: isDbReady,
    mode: isUsingLocalDb ? ('local' as const) : ('postgres' as const),
    configured: Boolean(connectionString),
    error: lastDbError,
  }
}

/**
 * Interface thống nhất cho pool.query
 * Cho phép các route chạy mượt mà trên cả PostgreSQL và Local JSON DB
 */
export const pool = {
  query: async <T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> => {
    // Nếu dùng PostgreSQL thực sự
    if (!isUsingLocalDb && realPool) {
      try {
        const res = await realPool.query(sql, params)
        return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length }
      } catch (pgError) {
        console.error('PostgreSQL query error, falling back to local store if applicable:', pgError)
        throw pgError
      }
    }

    // Xử lý bằng Local Database
    const cleanSql = sql.replace(/\s+/g, ' ').trim()
    const db = readLocalDb()

    // 1. SELECT * FROM invitations ORDER BY created_at DESC
    if (/^SELECT \* FROM invitations ORDER BY created_at DESC/i.test(cleanSql)) {
      const rows = [...db.invitations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      return { rows: rows as T[], rowCount: rows.length }
    }

    // 2. SELECT * FROM invitations WHERE id = $1
    if (/^SELECT \* FROM invitations WHERE id = \$1/i.test(cleanSql)) {
      const id = params[0]
      const found = db.invitations.find((item) => item.id === id)
      return { rows: (found ? [found] : []) as T[], rowCount: found ? 1 : 0 }
    }

    // 3. SELECT id FROM invitations WHERE id = $1
    if (/^SELECT id FROM invitations WHERE id = \$1/i.test(cleanSql)) {
      const id = params[0]
      const found = db.invitations.find((item) => item.id === id)
      return { rows: (found ? [{ id: found.id }] : []) as T[], rowCount: found ? 1 : 0 }
    }

    // 4. SELECT id, invitation_id AS "invitationId", ... FROM guest_responses WHERE id = $1 AND invitation_id = $2
    if (/FROM guest_responses WHERE id = \$1 AND invitation_id = \$2/i.test(cleanSql)) {
      const [responseId, invitationId] = params
      const found = db.guest_responses.find(
        (r) => r.id === responseId && r.invitation_id === invitationId,
      )
      if (!found) return { rows: [], rowCount: 0 }
      const mapped: GuestResponsePayload = {
        id: found.id,
        invitationId: found.invitation_id,
        guestName: found.guest_name,
        attendanceStatus: found.attendance_status,
        wish: found.wish,
        createdAt: found.created_at,
      }
      return { rows: [mapped] as T[], rowCount: 1 }
    }

    // 5. INSERT INTO invitations
    if (/^INSERT INTO invitations/i.test(cleanSql)) {
      const newRow: InvitationRow = {
        id: params[0],
        graduate_name: params[1] ?? '',
        recipient_name: params[2] ?? '',
        date: params[3] ?? '',
        time: params[4] ?? '',
        time_end: params[5] ?? '',
        location_text: params[6] ?? '',
        location_address: params[7] ?? '',
        location_map: params[8] ?? '',
        contact_info: params[9] ?? '',
        facebook_info: params[10] ?? '',
        message: params[11] ?? '',
        school_code: params[12] ?? '',
        class_code: params[13] ?? '',
        cohort_years: params[14] ?? '',
        major: params[15] ?? '',
        music_url: params[16] ?? '',
        background_img: params[17] ?? '',
        main_img: params[18] ?? '',
        created_at: params[19] ?? new Date().toISOString(),
      }
      db.invitations.unshift(newRow)
      writeLocalDb(db)
      return { rows: [newRow] as T[], rowCount: 1 }
    }

    // 6. DELETE FROM invitations WHERE id = $1
    if (/^DELETE FROM invitations WHERE id = \$1/i.test(cleanSql)) {
      const id = params[0]
      const beforeLen = db.invitations.length
      db.invitations = db.invitations.filter((item) => item.id !== id)
      db.guest_responses = db.guest_responses.filter((r) => r.invitation_id !== id)
      writeLocalDb(db)
      const deleted = beforeLen - db.invitations.length
      return { rows: [], rowCount: deleted }
    }

    // 7. INSERT INTO guest_responses
    if (/^INSERT INTO guest_responses/i.test(cleanSql)) {
      const [id, invitationId, guestName, attendanceStatus, wish] = params
      const createdAt = new Date().toISOString()
      db.guest_responses.push({
        id,
        invitation_id: invitationId,
        guest_name: guestName,
        attendance_status: attendanceStatus,
        wish,
        created_at: createdAt,
      })
      writeLocalDb(db)
      const resPayload: GuestResponsePayload = {
        id,
        invitationId,
        guestName,
        attendanceStatus,
        wish,
        createdAt,
      }
      return { rows: [resPayload] as T[], rowCount: 1 }
    }

    // 8. UPDATE guest_responses
    if (/^UPDATE guest_responses/i.test(cleanSql)) {
      const [guestName, attendanceStatus, wish, responseId, invitationId] = params
      const target = db.guest_responses.find(
        (r) => r.id === responseId && r.invitation_id === invitationId,
      )
      if (!target) return { rows: [], rowCount: 0 }
      target.guest_name = guestName
      target.attendance_status = attendanceStatus
      target.wish = wish
      writeLocalDb(db)
      const resPayload: GuestResponsePayload = {
        id: target.id,
        invitationId: target.invitation_id,
        guestName: target.guest_name,
        attendanceStatus: target.attendance_status,
        wish: target.wish,
        createdAt: target.created_at,
      }
      return { rows: [resPayload] as T[], rowCount: 1 }
    }

    console.warn('Query chưa được map trong Local DB:', cleanSql)
    return { rows: [], rowCount: 0 }
  },
}
