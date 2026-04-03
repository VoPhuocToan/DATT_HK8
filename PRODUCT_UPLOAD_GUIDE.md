# Hướng dẫn Upload Hình ảnh Sản phẩm

## Tính năng mới đã được cập nhật:

### 1. Loại bỏ các trường không cần thiết
- ✅ Đã xóa bỏ toàn bộ phần "Thông số kỹ thuật" (screen, chipset, ram, storage, battery, rearCamera, frontCamera, os)
- ✅ Form thêm sản phẩm giờ chỉ còn các trường cần thiết: tên, slug, thương hiệu, danh mục, giá, tồn kho, mô tả

### 2. Upload hình ảnh từ máy tính
- ✅ Thay thế input URL bằng input file upload
- ✅ Cho phép chọn nhiều ảnh cùng lúc (tối đa 10 ảnh)
- ✅ Hỗ trợ các định dạng: JPG, PNG, WEBP, GIF
- ✅ Giới hạn kích thước file: 5MB/ảnh

### 3. Quản lý ảnh chính
- ✅ Cho phép chọn ảnh chính từ danh sách ảnh đã upload
- ✅ Ảnh chính sẽ hiển thị đầu tiên trong danh sách sản phẩm
- ✅ Nút "Chọn làm ảnh chính" để đánh dấu ảnh chính
- ✅ Nút "Xóa" để xóa từng ảnh riêng lẻ

### 4. Giao diện preview ảnh
- ✅ Hiển thị grid preview các ảnh đã upload
- ✅ Mỗi ảnh có controls riêng (chọn làm ảnh chính, xóa)
- ✅ Ảnh chính được highlight với nút màu khác

## Cách sử dụng:

1. **Thêm sản phẩm mới:**
   - Nhấn nút "+ Thêm sản phẩm"
   - Điền các thông tin cơ bản
   - Trong phần "Hình ảnh sản phẩm", nhấn "Choose Files" để chọn ảnh từ máy tính
   - Chọn nhiều ảnh cùng lúc bằng Ctrl+Click hoặc Shift+Click
   - Sau khi upload, chọn ảnh chính bằng nút "Chọn làm ảnh chính"

2. **Chỉnh sửa sản phẩm:**
   - Nhấn nút "Sửa" trên sản phẩm cần chỉnh sửa
   - Có thể thêm ảnh mới hoặc xóa ảnh cũ
   - Thay đổi ảnh chính nếu cần

3. **Quản lý ảnh:**
   - Ảnh được lưu trữ trong thư mục `backend/uploads/images/`
   - Ảnh chính sẽ hiển thị trong bảng danh sách sản phẩm
   - Có thể xóa từng ảnh riêng lẻ mà không ảnh hưởng đến ảnh khác

## Cấu trúc dữ liệu mới:

```javascript
{
  name: "Tên sản phẩm",
  slug: "ten-san-pham", 
  brand: "Thương hiệu",
  category: "ID danh mục",
  price: 1000000,
  salePrice: 900000,
  stock: 50,
  shortDescription: "Mô tả ngắn",
  description: "Mô tả chi tiết",
  images: ["/image1.jpg", "/image2.jpg", "/image3.jpg"],
  mainImageIndex: 0 // Index của ảnh chính trong mảng images
}
```

## API Endpoints mới:

- `POST /api/upload/images` - Upload nhiều ảnh (chỉ admin)
  - Body: FormData với field "images" (array of files)
  - Response: `{ filenames: ["/filename1.jpg", "/filename2.jpg"] }`

## Truy cập:

- Admin Panel: http://localhost:5176
- Backend API: http://localhost:5000
- Ảnh được serve tại: http://localhost:5000/images/[filename]