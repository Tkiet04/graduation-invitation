import { Router } from 'express'
import { nanoid } from 'nanoid'
import { pool, rowToRecord, type InvitationRow } from '../db.js'
import { deleteInvitationFiles, saveImageField } from '../imageStore.js'

const router = Router()

// router.get('/', async (_req, res) => {
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
//   try {
//     const { rows } = await pool.query<InvitationRow>(
//       'SELECT * FROM invitations ORDER BY created_at DESC',
//     )
//     const { rows: responseRows } = await pool.query<{
//       id: string
//       invitationId: string
//       guestName: string
//       attendanceStatus: 'attending' | 'declined'
//       wish: string
//       createdAt: string
//     }>(
//       `
//       SELECT id, invitation_id AS "invitationId", guest_name AS "guestName",
//         attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
//       FROM guest_responses
//       ORDER BY created_at DESC
//       `,
//     )
//     const responseMap = new Map<string, typeof responseRows[0]>()
//     for (const resp of responseRows) {
//       if (!responseMap.has(resp.invitationId)) {
//         responseMap.set(resp.invitationId, resp)
//       }
//     }
//     const results = rows.map((row) => ({
//       ...rowToRecord(row),
//       latestResponse: responseMap.get(row.id) ?? null,
//     }))
//     res.json(results)
//   } catch (err) {
//     console.error('List invitations failed:', err)
//     res.status(500).json({ error: 'Không tải được danh sách thư mời' })
//   }
// })
router.get('/', async (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  try {
    // Tối ưu: Loại bỏ music_url, background_img, main_img nặng ra khỏi danh sách
    const { rows } = await pool.query<InvitationRow>(
      `
      SELECT 
        id, graduate_name, recipient_name, date, time, time_end,
        location_text, location_address, location_map, contact_info,
        facebook_info, message, school_code, class_code, cohort_years,
        major, created_at,
        '' AS music_url, '' AS background_img, '' AS main_img
      FROM invitations 
      ORDER BY created_at DESC
      `,
    )
    const { rows: responseRows } = await pool.query<{
      id: string
      invitationId: string
      guestName: string
      attendanceStatus: 'attending' | 'declined'
      wish: string
      createdAt: string
    }>(
      `
      SELECT id, invitation_id AS "invitationId", guest_name AS "guestName",
        attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
      FROM guest_responses
      ORDER BY created_at DESC
      `,
    )
    const responseMap = new Map<string, typeof responseRows[0]>()
    for (const resp of responseRows) {
      if (!responseMap.has(resp.invitationId)) {
        responseMap.set(resp.invitationId, resp)
      }
    }
    const results = rows.map((row) => ({
      ...rowToRecord(row),
      latestResponse: responseMap.get(row.id) ?? null,
    }))
    res.json(results)
  } catch (err) {
    console.error('List invitations failed:', err)
    res.status(500).json({ error: 'Không tải được danh sách thư mời' })
  }
})
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  try {
    const { rows } = await pool.query<InvitationRow>(
      'SELECT * FROM invitations WHERE id = $1',
      [req.params.id],
    )
    const row = rows[0]
    if (!row) {
      res.status(404).json({ error: 'Không tìm thấy thư mời' })
      return
    }
    const invitation = rowToRecord(row)
    const { rows: responseRows } = await pool.query(
      `
      SELECT id, invitation_id AS "invitationId", guest_name AS "guestName",
        attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
      FROM guest_responses
      WHERE invitation_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id],
    )
    res.json({
      ...invitation,
      latestResponse: responseRows[0] ?? null,
      responses: responseRows,
    })
  } catch (err) {
    console.error('Get invitation failed:', err)
    res.status(500).json({ error: 'Không tải được thư mời' })
  }
})

router.get('/:id/responses', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, invitation_id AS "invitationId", guest_name AS "guestName",
        attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
      FROM guest_responses
      WHERE invitation_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id],
    )
    res.json(rows)
  } catch (err) {
    console.error('List guest responses failed:', err)
    res.status(500).json({ error: 'Không tải được danh sách phản hồi' })
  }
})

router.get('/:id/responses/:responseId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, invitation_id AS "invitationId", guest_name AS "guestName",
        attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
      FROM guest_responses
      WHERE id = $1 AND invitation_id = $2
      `,
      [req.params.responseId, req.params.id],
    )
    if (!rows[0]) {
      res.status(404).json({ error: 'Không tìm thấy phản hồi' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Get guest response failed:', err)
    res.status(500).json({ error: 'Không tải được phản hồi' })
  }
})

router.post('/:id/responses', async (req, res) => {
  try {
    const { rows: invitations } = await pool.query<InvitationRow>(
      'SELECT id FROM invitations WHERE id = $1',
      [req.params.id],
    )
    if (!invitations[0]) {
      res.status(404).json({ error: 'Không tìm thấy thư mời' })
      return
    }

    const body = req.body as {
      attendanceStatus?: string
      guestName?: string
      wish?: string
    }
    const attendanceStatus = body.attendanceStatus
    if (attendanceStatus !== 'attending' && attendanceStatus !== 'declined') {
      res.status(400).json({ error: 'Vui lòng chọn trạng thái tham dự' })
      return
    }

    const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : ''
    if (!guestName) {
      res.status(400).json({ error: 'Vui lòng nhập tên khách mời' })
      return
    }
    if (guestName.length > 120) {
      res.status(400).json({ error: 'Tên khách mời không được vượt quá 120 ký tự' })
      return
    }

    const wish = typeof body.wish === 'string' ? body.wish.trim() : ''
    if (wish.length > 500) {
      res.status(400).json({ error: 'Lời chúc không được vượt quá 500 ký tự' })
      return
    }

    const id = nanoid(12)
    const { rows } = await pool.query(
      `
      INSERT INTO guest_responses (id, invitation_id, guest_name, attendance_status, wish)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, invitation_id AS "invitationId",
        guest_name AS "guestName", attendance_status AS "attendanceStatus",
        wish, created_at AS "createdAt"
      `,
      [id, req.params.id, guestName, attendanceStatus, wish],
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create guest response failed:', err)
    res.status(500).json({ error: 'Không lưu được xác nhận tham dự' })
  }
})

router.put('/:id/responses/:responseId', async (req, res) => {
  try {
    const body = req.body as {
      attendanceStatus?: string
      guestName?: string
      wish?: string
    }
    const attendanceStatus = body.attendanceStatus
    const guestName = typeof body.guestName === 'string' ? body.guestName.trim() : ''
    const wish = typeof body.wish === 'string' ? body.wish.trim() : ''

    if (attendanceStatus !== 'attending' && attendanceStatus !== 'declined') {
      res.status(400).json({ error: 'Vui lòng chọn trạng thái tham dự' })
      return
    }
    if (!guestName) {
      res.status(400).json({ error: 'Vui lòng nhập tên khách mời' })
      return
    }
    if (guestName.length > 120 || wish.length > 500) {
      res.status(400).json({ error: 'Dữ liệu phản hồi vượt quá giới hạn cho phép' })
      return
    }

    const { rows } = await pool.query(
      `
      UPDATE guest_responses
      SET guest_name = $1, attendance_status = $2, wish = $3
      WHERE id = $4 AND invitation_id = $5
      RETURNING id, invitation_id AS "invitationId", guest_name AS "guestName",
        attendance_status AS "attendanceStatus", wish, created_at AS "createdAt"
      `,
      [guestName, attendanceStatus, wish, req.params.responseId, req.params.id],
    )
    if (!rows[0]) {
      res.status(404).json({ error: 'Không tìm thấy phản hồi' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Update guest response failed:', err)
    res.status(500).json({ error: 'Không cập nhật được phản hồi' })
  }
})

router.post('/', async (req, res) => {
  try {
    const body = req.body as Omit<
      ReturnType<typeof rowToRecord>,
      'id' | 'createdAt'
    >
    const id = nanoid(10)
    const createdAt = new Date().toISOString()

    const backgroundImg = saveImageField(body.backgroundImg ?? '')
    const mainImg = saveImageField(body.mainImg ?? '')

    await pool.query(
      `
      INSERT INTO invitations (
        id, graduate_name, recipient_name, date, time, time_end,
        location_text, location_address, location_map, contact_info, facebook_info,
        message, school_code, class_code, cohort_years, major, music_url,
        background_img, main_img, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $19, $20
      )
      `,
      [
        id,
        body.graduateName?.trim() ?? '',
        body.recipientName?.trim() ?? '',
        body.date ?? '',
        body.time ?? '',
        body.timeEnd?.trim() ?? '',
        body.locationText?.trim() ?? '',
        body.locationAddress?.trim() ?? '',
        body.locationMap?.trim() ?? '',
        body.contactInfo?.trim() ?? '',
        body.facebookInfo?.trim() ?? '',
        body.message?.trim() ?? '',
        body.schoolCode?.trim() ?? '',
        body.classCode?.trim() ?? '',
        body.cohortYears?.trim() ?? '',
        body.major?.trim() ?? '',
        body.musicUrl?.trim() ?? '',
        backgroundImg,
        mainImg,
        createdAt,
      ],
    )

    const { rows } = await pool.query<InvitationRow>(
      'SELECT * FROM invitations WHERE id = $1',
      [id],
    )

    res.status(201).json(rowToRecord(rows[0]))
  } catch (err) {
    console.error('Create invitation failed:', err)
    res.status(500).json({ error: 'Không tạo được thư mời' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM invitations WHERE id = $1',
      [req.params.id],
    )
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Không tìm thấy thư mời' })
      return
    }
    deleteInvitationFiles(req.params.id)
    res.status(204).end()
  } catch (err) {
    console.error('Delete invitation failed:', err)
    res.status(500).json({ error: 'Không xóa được thư mời' })
  }
})

export default router
