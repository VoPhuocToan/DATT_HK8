# 🚀 Hướng dẫn khởi động nhanh

## Tổng quan
Dự án bao gồm 3 phần chính:
- **Backend API** (Node.js + Express) - Cổng 5000
- **Frontend** (React + Vite) - Cổng 5173  
- **Admin Panel** (React + Vite) - Cổng 5175

## ⚡ Khởi động nhanh

### 1. Khởi động Backend (Bắt buộc đầu tiên)
```bash
cd backend
npm run dev
```
✅ Backend sẽ chạy tại: http://localhost:5000

### 2. Khởi động Frontend
```bash
cd frontend  
npm run dev
```
✅ Website sẽ chạy tại: http://localhost:5173

### 3. Khởi động Admin Panel
```bash
cd admin
npm run dev  
```
✅ Admin panel sẽ chạy tại: http://localhost:5175

## 🔧 Scripts có sẵn

### Backend Scripts
- `npm run dev` - Khởi động development server với nodemon
- `npm start` - Khởi động production server

### Frontend Scripts  
- `npm run dev` - Khởi động development server
- `npm run build` - Build production
- `npm run preview` - Preview production build

### Admin Scripts
- `npm run dev` - Khởi động development server  
- `npm run build` - Build production
- `npm run preview` - Preview production build

## ❌ Lỗi thường gặp

### Backend không khởi động được
**Lỗi**: `npm error Missing script: "build"`
**Giải pháp**: Backend không cần build, sử dụng `npm run dev` thay vì `npm run build`

**Lỗi**: `PayOS is not a constructor`  
**Giải pháp**: Đã được sửa trong `backend/src/config/payos.js`

**Lỗi**: `MongoDB connection failed`
**Giải pháp**: Đảm bảo MongoDB đang chạy tại `mongodb://localhost:27017`

### Frontend/Admin không kết nối được API
**Lỗi**: `Network Error` hoặc `CORS Error`
**Giải pháp**: 
1. Đảm bảo backend đã khởi động ở cổng 5000
2. Kiểm tra CORS configuration trong `backend/src/app.js`

## 🌐 URLs quan trọng

| Service | URL | Mô tả |
|---------|-----|-------|
| Backend API | http://localhost:5000/api | REST API endpoints |
| Backend Images | http://localhost:5000/images/ | Static image files |
| Health Check | http://localhost:5000/api/health | Kiểm tra backend |
| Frontend | http://localhost:5173 | Website chính |
| Admin Panel | http://localhost:5175 | Quản trị viên |

## 📦 Tính năng PayOS

### Thanh toán QR Code
1. Chọn sản phẩm → Giỏ hàng → Checkout
2. Chọn "Chuyển khoản ngân hàng" 
3. Quét mã QR PayOS để thanh toán
4. Tự động cập nhật trạng thái đơn hàng

### API Endpoints PayOS
- `POST /api/payment/create` - Tạo QR thanh toán
- `GET /api/payment/status/:orderId` - Kiểm tra trạng thái  
- `POST /api/payment/webhook` - Webhook từ PayOS

## 🔐 Thông tin đăng nhập

### Admin Panel
- Email: admin@example.com
- Password: admin123

### Test User
- Email: user@example.com  
- Password: user123

## 📝 Ghi chú

- **Thứ tự khởi động**: Backend → Frontend → Admin
- **Database**: MongoDB cần chạy trước khi start backend
- **PayOS**: Đã cấu hình sẵn với API keys trong `.env`
- **CORS**: Đã cấu hình cho phép kết nối từ frontend và admin