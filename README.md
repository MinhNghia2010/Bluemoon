# Apartment Fee Management App

Ứng dụng Next.js 14 quản lý thu phí chung cư, hộ gia đình, bãi đỗ xe, tiện ích và thanh toán. Sử dụng Prisma với PostgreSQL (Supabase).

## Yêu cầu hệ thống
- Node.js 18+ và npm
- Git (để clone project)

## Hướng dẫn cài đặt nhanh

### 1. Clone và cài đặt dependencies
```bash
git clone <your-repo-url>
cd "Apartment Fee Management App"
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` trong thư mục gốc project với nội dung:
```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> **Lưu ý:** Thay thế `[project-ref]`, `[password]`, và `[region]` bằng thông tin từ Supabase Dashboard của bạn.

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Chạy ứng dụng
```bash
npm run dev
# Truy cập http://localhost:3000
```

> **Lưu ý:** Database đã được cấu hình sẵn trên Supabase với dữ liệu mẫu. Không cần chạy migration hoặc seed.

## Thông tin đăng nhập mặc định
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Quan trọng:** Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!

## Các lệnh thường dùng
| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy ứng dụng ở chế độ development |
| `npm run build` | Build ứng dụng cho production |
| `npm run start` | Chạy server production (sau khi build) |
| `npm run lint` | Kiểm tra lỗi code |
| `npm run db:studio` | Mở Prisma Studio (xem database) |

## Lưu ý
- Database sử dụng PostgreSQL trên Supabase.
- Prisma schema được cấu hình trong `prisma/schema.prisma`.
- UI sử dụng Tailwind CSS 4/PostCSS và Radix UI components.

## Tài liệu
Xem chi tiết tại [docs/system-architecture.md](docs/system-architecture.md)