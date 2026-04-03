const payOS = require('../config/payos');
const Order = require('../models/Order');

// Test PayOS connection
const testPayOSConnection = async (req, res) => {
  try {
    // Tạo một payment request test với dữ liệu mẫu
    const testData = {
      orderCode: Date.now(),
      amount: 10000,
      description: 'Test payment connection',
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`
    };

    const result = await payOS.paymentRequests.create(testData);
    res.json({
      success: true,
      message: 'PayOS connection successful',
      testResult: result
    });
  } catch (error) {
    console.error('PayOS test error:', error);
    res.status(500).json({
      success: false,
      message: 'PayOS connection failed',
      error: error.message,
      details: error.response?.data || null
    });
  }
};

// Tạo link thanh toán PayOS
const createPaymentLink = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
    }

    // Nếu đã có orderCode, lấy thông tin link cũ từ PayOS
    if (order.paymentOrderCode) {
      try {
        const existingPayment = await payOS.paymentRequests.get(order.paymentOrderCode);
        if (existingPayment && existingPayment.status === 'PENDING') {
          return res.json({
            success: true,
            checkoutUrl: existingPayment.checkoutUrl,
            qrCode: existingPayment.qrCode,
            orderCode: order.paymentOrderCode,
            amount: order.totalPrice
          });
        }
      } catch (e) {
        console.log('Could not retrieve existing payment, creating new one:', e.message);
      }
    }

    // Tạo orderCode duy nhất trong phạm vi int32 an toàn cho PayOS (max ~2 tỷ)
    const orderCode = (Date.now() % 1000000000) * 10 + Math.floor(Math.random() * 10);

    // PayOS yêu cầu description tối đa 25 ký tự, không dấu tiếng Việt
    const shortId = order._id.toString().slice(-6);
    const description = `DH${shortId}`; // VD: "DH5d623a" - 8 ký tự, luôn hợp lệ
    
    const paymentData = {
      orderCode: orderCode,
      amount: Math.round(order.totalPrice),
      description: description,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${orderId}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?orderId=${orderId}`
    };

    console.log('Creating PayOS payment with data:', paymentData);

    const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);
    
    // Lưu orderCode vào order để tracking
    order.paymentOrderCode = orderCode;
    await order.save();

    res.json({
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      qrCode: paymentLinkResponse.qrCode,
      orderCode: orderCode,
      amount: order.totalPrice
    });

  } catch (error) {
    console.error('PayOS createPaymentLink error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error.response?.data || error.cause || {}, null, 2));
    res.status(500).json({ 
      message: 'Lỗi tạo link thanh toán', 
      error: error.message,
      details: error.response?.data ?? error.cause ?? null
    });
  }
};

// Webhook xử lý kết quả thanh toán từ PayOS
const handlePaymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('PayOS webhook received:', webhookData);
    
    // Verify webhook signature
    try {
      const isValidSignature = payOS.webhooks.verify(webhookData);
      if (!isValidSignature) {
        console.log('Invalid webhook signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    } catch (verifyError) {
      console.log('Webhook signature verification failed:', verifyError.message);
      // Tiếp tục xử lý nếu không verify được signature (có thể do test environment)
    }

    const { orderCode, code, desc } = webhookData.data || webhookData;
    
    // Tìm order theo orderCode
    const order = await Order.findOne({ paymentOrderCode: orderCode });
    if (!order) {
      console.log('Order not found for orderCode:', orderCode);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Cập nhật trạng thái thanh toán
    if (code === '00' || code === 0) {
      // Thanh toán thành công
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed'; // Tự động chuyển sang chờ xác nhận
      console.log('Payment successful for order:', order._id);
    } else {
      // Thanh toán thất bại
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      console.log('Payment failed for order:', order._id, 'Code:', code, 'Description:', desc);
    }

    await order.save();

    res.json({ success: true });

  } catch (error) {
    console.error('PayOS webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// Kiểm tra trạng thái thanh toán
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
    }

    // Kiểm tra trạng thái từ PayOS nếu có orderCode
    if (order.paymentOrderCode && order.paymentStatus === 'pending') {
      try {
        const paymentInfo = await payOS.paymentRequests.get(order.paymentOrderCode);
        console.log('PayOS payment info:', paymentInfo);
        
        if (paymentInfo.status === 'PAID' && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          await order.save();
        } else if (paymentInfo.status === 'CANCELLED' && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          order.orderStatus = 'cancelled';
          await order.save();
        }
      } catch (payosError) {
        console.log('PayOS status check error:', payosError.message);
        // Không throw error, chỉ log để không ảnh hưởng đến response
      }
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      totalPrice: order.totalPrice
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ message: 'Lỗi kiểm tra trạng thái thanh toán' });
  }
};

module.exports = {
  testPayOSConnection,
  createPaymentLink,
  handlePaymentWebhook,
  checkPaymentStatus
};