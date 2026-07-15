import { Router } from 'express'
import { nanoid } from 'nanoid'
import { pool, rowToRecord, type InvitationRow } from '../db.js'
import { deleteInvitationFiles, saveImageField } from '../imageStore.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query<InvitationRow>(
      'SELECT * FROM invitations ORDER BY created_at DESC',
    )
    res.json(rows.map(rowToRecord))
  } catch (err) {
    console.error('List invitations failed:', err)
    res.status(500).json({ error: 'Không tải được danh sách thư mời' })
  }
})

router.get('/:id', async (req, res) => {
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
    res.json(rowToRecord(row))
  } catch (err) {
    console.error('Get invitation failed:', err)
    res.status(500).json({ error: 'Không tải được thư mời' })
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
        id, graduate_name, recipient_name, date, time,
        location_text, location_address, location_map, contact_info,
        background_img, main_img, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12
      )
      `,
      [
        id,
        body.graduateName?.trim() ?? '',
        body.recipientName?.trim() ?? '',
        body.date ?? '',
        body.time ?? '',
        body.locationText?.trim() ?? '',
        body.locationAddress?.trim() ?? '',
        body.locationMap?.trim() ?? '',
        body.contactInfo?.trim() ?? '',
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
