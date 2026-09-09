import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDbStatus, initDb, UPLOADS_DIR } from './db.js'
import invitationsRouter from './routes/invitations.js'

// Đảm bảo nạp .env từ thư mục gốc của project
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3001
const app = express()

// Render chạy từ project root — dùng cwd để tìm dist chắc chắn hơn __dirname
const distPath = path.resolve(process.cwd(), 'dist')
const indexHtml = path.join(distPath, 'index.html')
const hasFrontend = fs.existsSync(indexHtml)

app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use('/uploads', express.static(UPLOADS_DIR))
app.use('/api/invitations', invitationsRouter)

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    frontend: hasFrontend,
    database: getDbStatus(),
  })
})

if (hasFrontend) {
  app.use(express.static(distPath))

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next()
      return
    }
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next()
      return
    }
    res.sendFile(indexHtml, (err) => {
      if (err) next(err)
    })
  })
} else {
  console.warn(`Frontend not found at ${indexHtml}`)
  app.get('/', (_req, res) => {
    res
      .status(500)
      .type('text/plain')
      .send('Frontend chưa build. Kiểm tra buildCommand: npm install && npm run build')
  })
}

// Bật HTTP server ngay lập tức để Cloud (Render/Railway) và Vite Proxy kết nối được ngay,
// không bị lỗi 502 Bad Gateway do chờ kết nối database.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📂 cwd: ${process.cwd()}`)
  console.log(`📦 dist: ${distPath} (exists: ${hasFrontend})`)

  // Khởi tạo DB trong background
  initDb().catch((err) => {
    console.error('Lỗi khi khởi động database:', err)
  })
})
