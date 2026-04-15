require('dotenv').config();
const mongoose = require('mongoose');
const SupportTicket = require('../models/SupportTicket');

const TICKETS = [
  {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    phone: '0901234567',
    subject: 'Hỗ trợ đơn hàng',
    message: 'Tôi đặt hàng 3 ngày trước nhưng vẫn chưa nhận được hàng. Mã đơn hàng của tôi là DH1234567890. Nhờ admin kiểm tra và cập nhật tình trạng giúp tôi.',
    status: 'pending',
  },
  {
    name: 'Trần Thị Bích',
    email: 'tranthibich@gmail.com',
    phone: '0912345678',
    subject: 'Bảo hành & đổi trả',
    message: 'Sản phẩm iPhone 15 tôi mua bị lỗi màn hình sau 2 tuần sử dụng. Tôi muốn được đổi máy mới hoặc bảo hành. Vui lòng hướng dẫn quy trình.',
    status: 'processing',
    adminReply: 'Chào bạn, chúng tôi đã tiếp nhận yêu cầu. Vui lòng mang sản phẩm đến cửa hàng kèm hóa đơn để được hỗ trợ đổi trả trong vòng 7 ngày.',
  },
  {
    name: 'Lê Minh Châu',
    email: 'leminhchau@gmail.com',
    phone: '0923456789',
    subject: 'Câu hỏi chung',
    message: 'Shop có bán Samsung Galaxy S25 Ultra màu xanh không? Nếu có thì giá bao nhiêu và còn hàng không ạ? Tôi muốn mua làm quà tặng.',
    status: 'resolved',
    adminReply: 'Dạ shop hiện có Samsung Galaxy S25 Ultra màu Titanium Blue, giá 31.990.000đ, còn hàng. Bạn có thể đặt hàng trực tiếp trên website hoặc liên hệ hotline để được tư vấn thêm.',
  },
  {
    name: 'Phạm Quốc Dũng',
    email: 'phamquocdung@gmail.com',
    phone: '0934567890',
    subject: 'Hỗ trợ đơn hàng',
    message: 'Tôi đã thanh toán chuyển khoản nhưng đơn hàng vẫn hiển thị "Chưa thanh toán". Tôi đã chuyển khoản lúc 10 giờ sáng hôm nay, nhờ admin kiểm tra lại.',
    status: 'pending',
  },
  {
    name: 'Hoàng Thị Lan',
    email: 'hoangthilan@gmail.com',
    phone: '0945678901',
    subject: 'Góp ý sản phẩm',
    message: 'Tôi muốn góp ý là shop nên bổ sung thêm phụ kiện cho dòng MacBook như túi đựng, hub USB-C và bàn phím ngoài. Nhiều khách hàng như tôi rất cần những sản phẩm này.',
    status: 'closed',
    adminReply: 'Cảm ơn bạn đã góp ý! Chúng tôi sẽ xem xét bổ sung các phụ kiện MacBook trong thời gian tới. Rất trân trọng ý kiến của bạn.',
  },
  {
    name: 'Võ Thanh Hùng',
    email: 'vothanhhung@gmail.com',
    phone: '0956789012',
    subject: 'Bảo hành & đổi trả',
    message: 'Tai nghe AirPods Pro tôi mua tháng trước bị mất kết nối liên tục. Tôi đã thử reset nhưng vẫn không được. Sản phẩm còn trong thời gian bảo hành, nhờ hỗ trợ.',
    status: 'processing',
  },
  {
    name: 'Đỗ Thị Mai',
    email: 'dothimai@gmail.com',
    phone: '0967890123',
    subject: 'Hợp tác kinh doanh',
    message: 'Tôi là chủ một cửa hàng điện thoại nhỏ tại Cần Thơ, muốn hỏi về chính sách đại lý hoặc mua sỉ của shop. Vui lòng liên hệ lại để trao đổi thêm.',
    status: 'pending',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await SupportTicket.deleteMany({});
  await SupportTicket.insertMany(TICKETS);
  console.log(`Đã tạo ${TICKETS.length} mẫu liên hệ hỗ trợ.`);
  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
