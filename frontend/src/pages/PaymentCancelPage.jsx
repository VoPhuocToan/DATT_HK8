import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconX, IconCreditCard, IconMessageSquare, IconRefreshCw } from '../components/Icons';

const PaymentCancelPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Đếm ngược 10 giây
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    if (orderId) {
      navigate(`/payment/qr/${orderId}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="error-animation">
          <div className="error-circle">
            <div className="error-cross">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div className="result-content">
          <h1 className="error-title"><IconX size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Thanh toán thất bại</h1>
          <p className="error-message">
            Thanh toán không thành công. Đơn hàng đã bị hủy.
          </p>
          
          {orderId && (
            <div className="order-info">
              <p>
                <strong>Mã đơn hàng:</strong> #{orderId.slice(-8).toUpperCase()}
              </p>
              <p>
                <strong>Trạng thái:</strong> 
                <span className="status-badge error">Đã hủy</span>
              </p>
            </div>
          )}

          <div className="error-details">
            <div className="detail-item">
              <span className="icon"><IconCreditCard size={20} /></span>
              <div>
                <h4>Thanh toán bị hủy</h4>
                <p>Giao dịch không được hoàn thành</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon"><IconRefreshCw size={20} /></span>
              <div>
                <h4>Thử lại</h4>
                <p>Bạn có thể thử thanh toán lại hoặc chọn phương thức khác</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon"><IconMessageSquare size={20} /></span>
              <div>
                <h4>Hỗ trợ</h4>
                <p>Liên hệ với chúng tôi nếu bạn gặp vấn đề</p>
              </div>
            </div>
          </div>

          <div className="error-reasons">
            <h4>Có thể do các nguyên nhân sau:</h4>
            <ul>
              <li>Hủy thanh toán trong quá trình quét QR</li>
              <li>Hết thời gian thanh toán</li>
              <li>Lỗi kết nối mạng</li>
              <li>Tài khoản không đủ số dư</li>
            </ul>
          </div>
        </div>

        <div className="result-actions">
          <button 
            onClick={handleGoToHome}
            className="btn btn-secondary"
          >
            Về trang chủ
          </button>
          
          {orderId && (
            <button 
              onClick={handleRetryPayment}
              className="btn btn-warning"
            >
              Thử lại thanh toán
            </button>
          )}
          
          <button 
            onClick={handleGoToOrders}
            className="btn btn-primary"
          >
            Xem đơn hàng
          </button>
        </div>

        <div className="auto-redirect">
          <p>
            Tự động chuyển đến trang đơn hàng sau <strong>{countdown}</strong> giây
          </p>
          <div className="countdown-bar">
            <div 
              className="countdown-progress error" 
              style={{ width: `${(10 - countdown) * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;