# Thư mời lễ tốt nghiệp

Fullstack app — form tạo thư mời, lưu server, QR link ngắn cho từng người nhận.

## Kiến trúc

```
Frontend (React + Vite)     Backend (Express + PostgreSQL)
        │                            │
        │  POST /api/invitations     │ → PostgreSQL (metadata + ảnh)
        │  GET  /api/invitations/:id │
        └────────────────────────────┘
```

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express |
| Database | PostgreSQL (`DATABASE_URL`) |
| Ảnh | Lưu trong DB (data URL) — không phụ thuộc disk |

## Chạy dev

Cần PostgreSQL (Neon free hoặc local) và biến `DATABASE_URL`:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Vite proxy `/api` và `/uploads` sang backend.

Chi tiết deploy: xem [DEPLOY.md](./DEPLOY.md).

## Production

```bash
npm run build
npm start
```

Một server phục vụ API + static React (`dist/`). Bắt buộc có `DATABASE_URL`.

## Luồng QR

1. Tạo thư mời → `POST /api/invitations` → lưu Postgres
2. Nhận link ngắn: `https://your-domain.com/i/{id}`
3. QR encode link ngắn này
4. Người nhận quét → `GET /api/invitations/{id}` → hiển thị thư mời

## API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/invitations` | Danh sách thư mời |
| GET | `/api/invitations/:id` | Chi tiết (public) |
| POST | `/api/invitations` | Tạo mới |
| DELETE | `/api/invitations/:id` | Xóa |
