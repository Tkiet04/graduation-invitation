import { Router } from 'express'
import { nanoid } from 'nanoid'
import { db, rowToRecord, type InvitationRow } from '../db.js'
import { deleteInvitationFiles, saveImageField } from '../imageStore.js'

const router = Router()

router.get('/', (_req, res) => {
  const rows = db
    .prepare('SELECT * FROM invitations ORDER BY created_at DESC')
    .all() as InvitationRow[]

  res.json(rows.map(rowToRecord))
})

router.get('/:id', (req, res) => {
  const row = db
    .prepare('SELECT * FROM invitations WHERE id = ?')
    .get(req.params.id) as InvitationRow | undefined

  if (!row) {
    res.status(404).json({ error: 'Không tìm thấy thư mời' })
    return
  }

  res.json(rowToRecord(row))
})

router.post('/', (req, res) => {
  try {
    const body = req.body as Omit<
      ReturnType<typeof rowToRecord>,
      'id' | 'createdAt'
    >
    const id = nanoid(10)
    const createdAt = new Date().toISOString()

    const backgroundImg = saveImageField(id, 'background', body.backgroundImg ?? '')
    const mainImg = saveImageField(id, 'main', body.mainImg ?? '')

    db.prepare(`
      INSERT INTO invitations (
        id, graduate_name, recipient_name, date, time,
        location_text, location_address, location_map, contact_info,
        background_img, main_img, created_at
      ) VALUES (
        @id, @graduateName, @recipientName, @date, @time,
        @locationText, @locationAddress, @locationMap, @contactInfo,
        @backgroundImg, @mainImg, @createdAt
      )
    `).run({
      id,
      graduateName: body.graduateName?.trim() ?? '',
      recipientName: body.recipientName?.trim() ?? '',
      date: body.date ?? '',
      time: body.time ?? '',
      locationText: body.locationText?.trim() ?? '',
      locationAddress: body.locationAddress?.trim() ?? '',
      locationMap: body.locationMap?.trim() ?? '',
      contactInfo: body.contactInfo?.trim() ?? '',
      backgroundImg,
      mainImg,
      createdAt,
    })

    const record = db
      .prepare('SELECT * FROM invitations WHERE id = ?')
      .get(id) as InvitationRow

    res.status(201).json(rowToRecord(record))
  } catch (err) {
    console.error('Create invitation failed:', err)
    res.status(500).json({ error: 'Không tạo được thư mời' })
  }
})

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM invitations WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'Không tìm thấy thư mời' })
    return
  }
  deleteInvitationFiles(req.params.id)
  res.status(204).end()
})

export default router
