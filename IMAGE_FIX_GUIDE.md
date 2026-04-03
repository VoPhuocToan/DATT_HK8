# 🖼️ Hướng dẫn sửa lỗi hình ảnh Admin Panel

## ❌ Vấn đề
Admin Panel không hiển thị được hình ảnh sản phẩm ở các trang:
- Trang Sản phẩm (Products)
- Trang Giảm giá (Discounts) 
- Trang Thống kê (Statistics)

## 🔍 Nguyên nhân
1. **Hình ảnh được lưu trong `frontend/public/`** nhưng admin panel chạy ở cổng khác
2. **Admin panel cố gắng load hình từ frontend URL** thay vì backend
3. **Backend chưa serve static files** cho hình ảnh

## ✅ Giải pháp đã thực hiện

### 1. Thêm Static File Serving vào Backend
**File**: `backend/src/app.js`
```javascript
// Serve static files (hình ảnh sản phẩm từ frontend/public)
const frontendPublic = path.join(__dirname, '../../frontend/public');
app.use('/images', express.static(frontendPublic));
```

### 2. Cập nhật URL hình ảnh trong Admin Panel

#### Trang Products (`admin/src/pages/Products.jsx`)
```javascript
// Trước
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
src={p.images?.[0] ? `${FRONTEND_URL}${p.images[0]}` : 'https://placehold.co/48'}

// Sau  
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
src={p.images?.[0] ? `${BACKEND_URL}/images${p.images[0]}` : 'https://placehold.co/48'}
```

#### Trang Discounts (`admin/src/pages/Discounts.jsx`)
```javascript
// Cập nhật tương tự như Products
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
src={p.images?.[0] ? `${BACKEND_URL}/images${p.images[0]}` : 'https://placehold.co/44'}
```

#### Trang Statistics (`admin/src/pages/Statistics.jsx`)
```javascript
// Cập nhật tương tự
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
src={p.image ? `${BACKEND_URL}/images${p.image}` : 'https://placehold.co/44'}
```

### 3. Rebuild Admin Panel
```bash
cd admin
npm run build
```

## 🌐 Cách hoạt động mới

### URL Structure
- **Backend Static Files**: `http://localhost:5000/images/`
- **Hình ảnh sản phẩm**: `http://localhost:5000/images/apple-macbook-m2-1.webp`
- **Admin Panel**: `http://localhost:5175`

### Flow
1. Hình ảnh được lưu trong `frontend/public/apple-macbook-m2-1.webp`
2. Backend serve static files từ `/images/` endpoint
3. Admin panel request: `http://localhost:5000/images/apple-macbook-m2-1.webp`
4. Backend trả về file từ `frontend/public/apple-macbook-m2-1.webp`

## 🧪 Kiểm tra

### 1. Test Static File Serving
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/images/apple-macbook-m2-1.webp" -Method Head

# Curl (nếu có)
curl -I http://localhost:5000/images/apple-macbook-m2-1.webp
```

### 2. Kiểm tra Admin Panel
1. Mở http://localhost:5175
2. Vào trang Sản phẩm
3. Kiểm tra hình ảnh hiển thị đúng
4. Mở Developer Tools → Network tab
5. Xem requests đến `/images/` endpoint

## 🔧 Troubleshooting

### Hình ảnh vẫn không hiển thị
1. **Kiểm tra backend đã restart**: Backend cần restart để nhận static file serving
2. **Kiểm tra đường dẫn hình**: Đảm bảo file tồn tại trong `frontend/public/`
3. **Kiểm tra CORS**: Backend đã cấu hình CORS cho admin port 5175

### Lỗi 404 Not Found
1. **Kiểm tra file path**: Đường dẫn trong database phải khớp với file thực tế
2. **Kiểm tra static middleware**: Đảm bảo `app.use('/images', express.static(...))` được thêm

### Lỗi CORS
1. **Cập nhật CORS origins**: Thêm admin port vào CORS config
```javascript
origin: ['http://localhost:5175', 'http://localhost:5173', 'http://localhost:3000']
```

## 📝 Lưu ý

### Cấu trúc thư mục
```
project/
├── backend/
│   └── src/app.js (static file serving)
├── frontend/
│   └── public/ (hình ảnh gốc)
└── admin/
    └── src/pages/ (admin pages với URL mới)
```

### Environment Variables
- `VITE_API_URL`: URL của backend API (http://localhost:5000/api)
- Admin tự động tạo `BACKEND_URL` từ `VITE_API_URL`

### Performance
- Static files được serve trực tiếp từ backend
- Có thể thêm caching headers nếu cần
- Có thể sử dụng CDN cho production

## ✅ Kết quả
- ✅ Hình ảnh hiển thị đúng trong trang Products
- ✅ Hình ảnh hiển thị đúng trong trang Discounts  
- ✅ Hình ảnh hiển thị đúng trong trang Statistics
- ✅ Fallback placeholder khi không có hình
- ✅ Error handling với onError callback