# Deploy lên internet (miễn phí)

Domain miễn phí: **`https://ten-app.onrender.com`**

## Bước 1 — Đẩy code lên GitHub

1. Tạo repo mới trên GitHub (Public): `graduation-invitation`
2. Trong thư mục project:

```bash
git init
git add .
git commit -m "Initial commit — graduation invitation app"
git branch -M main
git remote add origin https://github.com/TEN-GITHUB-CUA-BAN/graduation-invitation.git
git push -u origin main
```

## Bước 2 — Deploy trên Render (free)

1. Vào [https://render.com](https://render.com) → đăng ký (GitHub login)
2. **New +** → **Web Service**
3. Connect repo `graduation-invitation`
4. Render tự đọc `render.yaml`, hoặc cấu hình tay:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Bấm **Create Web Service** → chờ 5–10 phút

Sau khi xong, bạn có URL dạng:

```
https://graduation-invitation-xxxx.onrender.com
```

## Bước 3 — Dùng QR trên internet

- Tạo thư mời trên URL Render (không phải localhost)
- QR sẽ là: `https://graduation-invitation-xxxx.onrender.com/i/{id}`
- Gửi QR cho người nhận → quét **bất kỳ lúc nào** (khi server Render đang chạy)

## Lưu ý gói Free Render

| | |
|---|---|
| Domain | `.onrender.com` miễn phí |
| Sleep | Sau ~15 phút không ai truy cập, server ngủ → lần mở đầu chậm ~30–50s |
| Dữ liệu | SQLite + ảnh trên disk — **có thể mất khi redeploy** (gói free không có persistent disk) |

Muốn dữ liệu lâu dài hơn: nâng cấp Render disk hoặc chuyển DB sang Turso/PostgreSQL + ảnh lên Cloudinary.

## Kiểm tra server đang chạy

Mở: `https://TEN-APP.onrender.com/api/health`

Phải thấy: `{"ok":true}`
