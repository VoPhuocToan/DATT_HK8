# Tính năng Tìm kiếm Sản phẩm

## Tổng quan
Đã triển khai thành công tính năng tìm kiếm sản phẩm với gợi ý thông minh cho website Đặng Anh Mobile.

## Các tính năng chính

### 1. Thanh tìm kiếm ở Header
- **Vị trí**: Thanh tìm kiếm chính ở header của website
- **Tính năng**: 
  - Gợi ý sản phẩm real-time khi người dùng gõ (debounce 300ms)
  - Hiển thị tối đa 5 sản phẩm gợi ý
  - Hiển thị hình ảnh, tên và giá sản phẩm
  - Click vào gợi ý để xem chi tiết sản phẩm
  - Nút "Xem tất cả kết quả" để chuyển đến trang danh sách

### 2. Trang danh sách sản phẩm
- **URL**: `/products?keyword=từ_khóa`
- **Tính năng**:
  - Hiển thị kết quả tìm kiếm theo từ khóa
  - Thanh tìm kiếm riêng trong trang
  - Bộ lọc theo hãng, giá, tình trạng
  - Sắp xếp theo nhiều tiêu chí
  - Hiển thị từ khóa tìm kiếm trong active filters

## Cách sử dụng

### Tìm kiếm từ Header
1. Nhập từ khóa vào thanh tìm kiếm ở header
2. Xem gợi ý sản phẩm xuất hiện
3. Click vào sản phẩm gợi ý hoặc nhấn Enter để xem tất cả

### Tìm kiếm trong trang Products
1. Truy cập `/products`
2. Sử dụng thanh tìm kiếm trong trang
3. Kết hợp với các bộ lọc khác

## Cấu trúc kỹ thuật

### Frontend Components
- `SearchBox.jsx`: Component tìm kiếm với gợi ý
- `ProductsPage.jsx`: Trang danh sách sản phẩm (đã cập nhật)
- `Header.jsx`: Header chính (đã cập nhật)

### Backend API
- **Endpoint**: `GET /api/products?keyword=...`
- **Tham số**: 
  - `keyword`: Từ khóa tìm kiếm
  - `limit`: Số lượng kết quả (mặc định 12)
  - Các tham số lọc khác: `category`, `brand`, `minPrice`, `maxPrice`

### CSS Classes
- `.search-box`: Container chính
- `.search-suggestions`: Dropdown gợi ý
- `.search-suggestion-item`: Item gợi ý
- `.plp-search-form`: Form tìm kiếm trong trang

## Routing đã cập nhật
- `/products`: Tất cả sản phẩm (có thể tìm kiếm)
- `/dien-thoai`: Điện thoại (thay vì `/products`)
- `/laptops`: Laptop
- `/accessories`: Phụ kiện
- `/smartwatch`: Smartwatch
- `/tablet`: Tablet

## Tính năng nâng cao
- **Debounce**: Tránh gọi API quá nhiều khi người dùng gõ
- **Loading state**: Hiển thị trạng thái đang tải
- **Error handling**: Xử lý lỗi khi gọi API
- **Responsive**: Tương thích mobile
- **Placeholder image**: Hiển thị ảnh mặc định khi sản phẩm không có ảnh

## Cách test
1. Khởi động backend: `cd backend && npm start`
2. Khởi động frontend: `cd frontend && npm run dev`
3. Truy cập http://localhost:5174
4. Thử tìm kiếm từ khóa như "iPhone", "Samsung", "Laptop"