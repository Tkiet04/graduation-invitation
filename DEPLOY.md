# Deploy + PostgreSQL (dữ liệu không mất khi restart)

Thiệp mời lưu trên **PostgreSQL** (metadata + ảnh dạng data URL). Disk Render free có thể xóa file — DB cloud thì vẫn giữ.

## Bước 1 — Tạo PostgreSQL (Neon, miễn phí)

1. Vào [https://neon.tech](https://neon.tech) → Sign up (GitHub)
2. **Create a project** → chọn region gần (Singapore nếu có)
3. Sau khi tạo, vào **Dashboard** → **Connection details**
4. Copy **Connection string** dạng:

```
postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

Giữ chuỗi này kín — không commit lên GitHub.

> Cách khác: Render Dashboard → **New +** → **PostgreSQL** → copy **Internal Database URL** (dùng khi Web Service cũng trên Render) hoặc **External Database URL**.

## Bước 2 — Đẩy code lên GitHub

```bash
git add .
git commit -m "Migrate invitations storage to PostgreSQL"
git push
```

## Bước 3 — Gắn DATABASE_URL trên Render

1. [https://render.com](https://render.com) → Web Service của bạn
2. **Environment** → **Add Environment Variable**
3. Key: `DATABASE_URL`
4. Value: dán connection string Neon (hoặc Render Postgres)
5. **Save Changes** → Render tự redeploy

Nếu tạo service mới từ Blueprint (`render.yaml`), Render sẽ hỏi điền `DATABASE_URL` (sync: false).

## Bước 4 — Kiểm tra

1. Mở `https://TEN-APP.onrender.com/api/health` → `{"ok":true,...}`
2. Tạo một thư mời mới trên web
3. Mở link `/i/{id}` — phải hiện đúng
4. Đợi server sleep (~15 phút) hoặc **Manual Deploy** rồi mở lại link → **vẫn còn** (không còn 404)

## Chạy local với Postgres

1. Tạo file `.env` ở thư mục gốc (không commit):

```
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

2. Cài thêm `dotenv` nếu muốn load `.env` tự động — hoặc set biến trước khi chạy:

**PowerShell:**

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.../neondb?sslmode=require"
npm run dev
```

**bash:**

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.../neondb?sslmode=require"
npm run dev
```

Server cần `DATABASE_URL` — thiếu thì sẽ thoát với lỗi hướng dẫn.

## Lưu ý gói Free

| | |
|---|---|
| Neon | Free tier ổn định cho app nhỏ; ảnh nằm trong DB |
| Render Web Free | Vẫn sleep ~15 phút → lần mở đầu chậm |
| SQLite cũ | Không còn dùng; data local cũ trong `server/data/` không tự migrate |

## Migrate data SQLite cũ (tuỳ chọn)

Data trên Render free trước đây thường đã mất sau restart. Nếu bạn còn file `server/data/invitations.db` local và muốn chuyển tay sang Postgres, báo để viết script migrate.
