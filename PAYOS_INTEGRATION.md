# Tích hợp PayOS - Hướng dẫn sử dụng

## Tổng quan
Hệ thống đã được tích hợp PayOS để hỗ trợ thanh toán chuyển khoản qua QR code. Khi khách hàng chọn phương thức "Chuyển khoản ngân hàng", hệ thống sẽ tạo mã QR PayOS để thanh toán.

## Luồng thanh toán

### 1. Đặt hàng với PayOS
- Khách hàng chọn sản phẩm và đi đến trang checkout
- Chọn phương thức thanh toán "Chuyển khoản ngân hàng"
- Nhấn "Xác nhận đặt hàng" → Chuyển đến trang QR thanh toán

### 2. Trang QR thanh toán (`/payment/qr/:orderId`)
- Hiển thị mã QR PayOS để quét
- Thông tin đơn hàng và số tiền
- Hướng dẫn thanh toán
- Tự động kiểm tra trạng thái thanh toán mỗi 3 giây
- Nút "Hủy thanh toán" và "Mở trang thanh toán"

### 3. Kết quả thanh toán

#### Thanh toán thành công (`/payment/success`)
- Đơn hàng chuyển sang trạng thái "Chờ xác nhận"
- Trạng thái thanh toán: "Đã thanh toán"
- Tự động chuyển về trang đơn hàng sau 10 giây

#### Thanh toán thất bại (`/payment/cancel`)
- Đơn hàng chuyển sang trạng thái "Đã hủy"
- Trạng thái thanh toán: "Thất bại"
- Có thể thử lại thanh toán
- Tự động chuyển về trang đơn hàng sau 10 giây

## Trạng thái đơn hàng

### Trạng thái thanh toán (paymentStatus)
- `pending`: Chưa thanh toán
- `paid`: Đã thanh toán thành công
- `failed`: Thanh toán thất bại

### Trạng thái đơn hàng (orderStatus)
- `pending`: Chờ xác nhận (mặc định cho COD)
- `confirmed`: Đã xác nhận (tự động khi PayOS thành công)
- `shipping`: Đang giao hàng
- `delivered`: Đã giao hàng
- `cancelled`: Đã hủy

## Tính năng đặc biệt

### 1. Thanh toán lại
- Đơn hàng PayOS chưa thanh toán có nút "Thanh toán lại" trong trang đơn hàng
- Tạo mã QR mới cho cùng một đơn hàng

### 2. Webhook PayOS
- Endpoint: `POST /api/payment/webhook`
- Tự động cập nhật trạng thái khi PayOS callback
- Xác thực chữ ký webhook để bảo mật

### 3. Kiểm tra trạng thái
- API: `GET /api/payment/status/:orderId`
- Kiểm tra trạng thái từ PayOS và cập nhật database

## API Endpoints

### Backend
```
POST /api/payment/create        # Tạo link thanh toán PayOS
POST /api/payment/webhook       # Webhook từ PayOS
GET  /api/payment/status/:id    # Kiểm tra trạng thái thanh toán
```

### Frontend Routes
```
/payment/qr/:orderId           # Trang QR thanh toán
/payment/success               # Trang thanh toán thành công
/payment/cancel                # Trang thanh toán thất bại
```

## Cấu hình PayOS

### Backend (.env)
```env
PORT=5000
PAYOS_CLIENT_ID=4ac84d97-0d62-45d4-a88a-b62d397811c9
PAYOS_API_KEY=f269ffc3-afed-4d12-a425-737a166ab37a
PAYOS_CHECKSUM_KEY=7c058269ea07c2123fe456cda9f76442e540ee2305055a81e7f45efe787cdb14
FRONTEND_URL=http://localhost:5173
```

## Giao diện Admin

### Quản lý đơn hàng
- Hiển thị phương thức thanh toán (COD/PayOS)
- Trạng thái thanh toán với màu sắc phân biệt
- Mã thanh toán PayOS (nếu có)
- Chi tiết đầy đủ trong modal

## Bảo mật

### 1. Xác thực webhook
- Sử dụng `payOS.verifyPaymentWebhookData()` để xác thực
- Chỉ xử lý webhook hợp lệ

### 2. Kiểm tra quyền
- Chỉ chủ đơn hàng mới có thể tạo/kiểm tra thanh toán
- Admin có quyền xem tất cả đơn hàng

### 3. Validation
- Kiểm tra trạng thái đơn hàng trước khi tạo thanh toán
- Không cho phép thanh toán đơn hàng đã thanh toán

## Lưu ý kỹ thuật

### 1. OrderCode
- Sử dụng 8 ký tự cuối của ObjectId làm orderCode
- Chuyển đổi hex sang số nguyên để tương thích PayOS

### 2. Polling
- Kiểm tra trạng thái mỗi 3 giây khi ở trang QR
- Tự động chuyển hướng khi có kết quả

### 3. Error Handling
- Xử lý lỗi mạng, timeout
- Fallback UI khi không tạo được QR
- Retry mechanism cho API calls

## Testing

### 1. Test thanh toán thành công
1. Đặt hàng với PayOS
2. Quét QR và thanh toán
3. Kiểm tra trạng thái đơn hàng

### 2. Test thanh toán thất bại
1. Đặt hàng với PayOS
2. Hủy thanh toán hoặc để timeout
3. Kiểm tra đơn hàng bị hủy

### 3. Test webhook
- Sử dụng ngrok để expose localhost
- Cấu hình webhook URL trong PayOS dashboard
- Test callback từ PayOS

## Troubleshooting

### 1. Không tạo được QR
- Kiểm tra API key PayOS
- Kiểm tra network connection
- Xem log backend

### 2. Webhook không hoạt động
- Kiểm tra URL webhook
- Verify signature
- Kiểm tra firewall/proxy

### 3. Trạng thái không cập nhật
- Kiểm tra polling mechanism
- Test API status endpoint
- Xem database records