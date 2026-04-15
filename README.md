# Đặng Anh Mobile Shop

Dự án website thương mại điện tử bán điện thoại, laptop và phụ kiện công nghệ. Gồm 3 phần: **Frontend** (khách hàng), **Admin Panel** (quản trị), và **Backend** (API server).

---

## Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| Frontend | React 19, React Router, Axios, Vite |
| Admin | React 19, Axios, Vite |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Thanh toán | PayOS (QR chuyển khoản) |
| Auth | JWT, bcryptjs |
| Upload ảnh | Multer |

---

## Cấu trúc dự án

```
DATT_HK8/
├── frontend/       # Giao diện khách hàng (port 5173)
├── admin/          # Giao diện quản trị (port 5175)
└── backend/        # API server (port 5000)
```

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- MongoDB đang chạy tại `localhost:27017`

### 1. Backend

```bash
cd backend
npm install
```

Tạo file `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/danganhshop
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
FRONTEND_URL=http://localhost:5173
```

Khởi động server:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Khởi động:

```bash
npm run dev
```

### 3. Admin Panel

```bash
cd admin
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

Khởi động:

```bash
npm run dev
```

---

## Seed dữ liệu mẫu

Chạy từ thư mục `backend/`:

```bash
# Tạo tài khoản admin
node src/scripts/createAdmin.js

# Tạo toàn bộ dữ liệu mẫu (sản phẩm, đơn hàng, người dùng...)
node src/scripts/runSeed.js

# Tạo dữ liệu mẫu riêng lẻ
node src/scripts/seedProducts.js
node src/scripts/seedArticles.js
node src/scripts/seedReviews.js
node src/scripts/seedSupport.js
```

---

## Tính năng

### Khách hàng
- Xem sản phẩm theo danh mục, tìm kiếm, lọc
- Xem chi tiết sản phẩm, đánh giá
- Giỏ hàng, đặt hàng (COD hoặc chuyển khoản QR qua PayOS)
- Theo dõi trạng thái đơn hàng, xem chi tiết đơn
- Hủy đơn hàng (không thể hủy nếu đã thanh toán chuyển khoản)
- Flash Sale theo thời gian thực
- Đọc bài viết / blog
- Gửi yêu cầu hỗ trợ qua trang Liên hệ
- Wishlist, hồ sơ cá nhân

### Admin Panel
- Dashboard thống kê tổng quan (doanh thu, đơn hàng, tồn kho)
- Quản lý sản phẩm, danh mục, banner quảng cáo
- Quản lý đơn hàng, cập nhật trạng thái
- Quản lý Flash Sale
- Quản lý bài viết
- Quản lý đánh giá
- Quản lý khách hàng
- Quản lý giá sale sản phẩm
- Thống kê doanh thu, sản phẩm bán chạy
- Hỗ trợ khách hàng (xem & phản hồi yêu cầu liên hệ)

---

## Tài khoản mặc định

Sau khi chạy `createAdmin.js`:

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@danganhshop.com | admin123 |

---

## API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:slug` | Chi tiết sản phẩm |
| GET | `/api/categories` | Danh mục |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/my` | Đơn hàng của tôi |
| PUT | `/api/orders/:id/cancel` | Hủy đơn hàng |
| POST | `/api/payment/create` | Tạo link thanh toán PayOS |
| GET | `/api/flash-sale/active` | Flash Sale đang chạy |
| POST | `/api/support` | Gửi yêu cầu hỗ trợ |
| GET | `/api/admin/stats` | Thống kê dashboard (admin) |
