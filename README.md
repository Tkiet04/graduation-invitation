# Thư mời lễ tốt nghiệp

Fullstack app — form tạo thư mời, lưu server, QR link ngắn cho từng người nhận.

## Kiến trúc

```
Frontend (React + Vite)     Backend (Express + SQLite)
        │                            │
        │  POST /api/invitations     │ → SQLite (metadata)
        │  GET  /api/invitations/:id │ → uploads/ (ảnh)
        └────────────────────────────┘
```

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Express, better-sqlite3 |
| Database | SQLite (`server/data/invitations.db`) |
| Ảnh | File system (`server/uploads/{id}/`) |

## Chạy dev (cần cả frontend + backend)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Vite proxy `/api` và `/uploads` sang backend.

## Production

```bash
npm run build
npm start
```

Một server phục vụ API + ảnh + static React (`dist/`).

## Luồng QR

1. Tạo thư mời → `POST /api/invitations` → lưu DB + ảnh
2. Nhận link ngắn: `https://your-domain.com/i/{id}`
3. QR encode link ngắn này
4. Người nhận quét **bất kỳ lúc nào** → `GET /api/invitations/{id}` → hiển thị thư mời

Không còn phụ thuộc localStorage hay hash URL dài.

## API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/invitations` | Danh sách thư mời |
| GET | `/api/invitations/:id` | Chi tiết (public) |
| POST | `/api/invitations` | Tạo mới |
| DELETE | `/api/invitations/:id` | Xóa |

## Deploy gợi ý (senior)

- **VPS / Railway / Render**: chạy `npm start`, mount volume cho `server/data` + `server/uploads`
- **Domain**: trỏ DNS → server, HTTPS bằng Caddy/Nginx
- **Scale**: đổi SQLite → PostgreSQL, ảnh → S3/Cloudinary nếu traffic lớn
