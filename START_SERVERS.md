# Hướng dẫn khởi động các server

## Cấu hình cổng mới
- **Backend**: Cổng 5000 (cổng ban đầu)
- **Frontend**: Cổng 5173 (mặc định Vite)
- **Admin**: Cổng 5175 (đã đổi từ 5174)

## Khởi động Backend (Cổng 5000)

### Windows:
```bash
# Cách 1: Sử dụng script
start-backend.bat

# Cách 2: Thủ công
cd backend
npm run dev
```

### Linux/Mac:
```bash
# Cách 1: Sử dụng script
chmod +x start-backend.sh
./start-backend.sh

# Cách 2: Thủ công
cd backend
npm run dev
```

## Khởi động Frontend (Cổng 5173)
```bash
cd frontend
npm run dev
```

## Khởi động Admin (Cổng 5175)
```bash
cd admin
npm run dev
```

## Kiểm tra hoạt động

### Backend API (Cổng 5000)
- Health check: http://localhost:5000/api/health
- API base URL: http://localhost:5000/api

### Frontend (Cổng 5173)
- Website: http://localhost:5173

### Admin Panel (Cổng 5175)
- Admin panel: http://localhost:5175

## Thứ tự khởi động khuyến nghị
1. **Backend** (5000) - Khởi động trước
2. **Frontend** (5173) - Khởi động sau backend
3. **Admin** (5175) - Khởi động cuối cùng

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra backend đã chạy ở cổng 5000
- Kiểm tra CORS configuration
- Xem console log để debug

### Lỗi PayOS
- Kiểm tra API keys trong backend/.env
- Kiểm tra network connection
- Xem backend logs

### Lỗi Database
- Kiểm tra MongoDB đã chạy
- Kiểm tra connection string trong .env