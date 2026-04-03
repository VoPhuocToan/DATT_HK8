import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconCheck, IconPackage, IconMail, IconTruck } from '../components/Icons';

const PaymentSuccessPage = () => {
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

  return (
    <div className="payment-result-page">
      <div className="payment-result-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>

        <div className="result-content">
          <h1 className="success-title"><IconCheck size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Thanh toán thành công!</h1>
          <p className="success-message">
            Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý.
          </p>
          
          {orderId && (
            <div className="order-info">
              <p>
                <strong>Mã đơn hàng:</strong> #{orderId.slice(-8).toUpperCase()}
              </p>
              <p>
                <strong>Trạng thái:</strong> 
                <span className="status-badge success">Chờ xác nhận</span>
              </p>
            </div>
          )}

          <div className="success-details">
            <div className="detail-item">
              <span className="icon"><IconPackage size={20} /></span>
              <div>
                <h4>Đơn hàng đã được tạo</h4>
                <p>Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon"><IconMail size={20} /></span>
              <div>
                <h4>Email xác nhận</h4>
                <p>Thông tin đơn hàng đã được gửi đến email của bạn</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon"><IconTruck size={20} /></span>
              <div>
                <h4>Theo dõi đơn hàng</h4>
                <p>Bạn có thể theo dõi tình trạng đơn hàng trong trang đơn hàng</p>
              </div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button 
            onClick={handleGoToHome}
            className="btn btn-secondary"
          >
            Về trang chủ
          </button>
          
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
              className="countdown-progress" 
              style={{ width: `${(10 - countdown) * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;