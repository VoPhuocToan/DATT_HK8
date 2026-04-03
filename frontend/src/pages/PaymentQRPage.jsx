import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IconCreditCard, IconX, IconPhone, IconSmartphone } from '../components/Icons';

const PaymentQRPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const checkingRef = useRef(false);

  const hasCreated = useRef(false);

  useEffect(() => {
    let interval;

    const init = async () => {
      if (hasCreated.current) return;
      hasCreated.current = true;
      const success = await createPaymentLink();
      if (success) {
        interval = setInterval(checkPaymentStatus, 3000);
      }
    };

    init();
    return () => clearInterval(interval);
  }, [orderId]);

  const createPaymentLink = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Creating payment link for order:', orderId);
      const { data } = await api.post('/payment/create', { orderId });
      
      console.log('Payment link created successfully:', data);
      setPaymentData(data);
      return true;
    } catch (err) {
      console.error('Payment link creation error:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi tạo mã QR thanh toán';
      const errorDetails = err.response?.data?.details;
      
      setError(errorDetails ? `${errorMessage}: ${JSON.stringify(errorDetails)}` : errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checkingRef.current) return;
    
    try {
      checkingRef.current = true;
      setChecking(true);
      const { data } = await api.get(`/payment/status/${orderId}`);
      
      if (data.paymentStatus === 'paid') {
        navigate(`/payment/success?orderId=${orderId}`);
      } else if (data.paymentStatus === 'failed') {
        navigate(`/payment/cancel?orderId=${orderId}`);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  };

  const handleCancel = () => {
    navigate(`/payment/cancel?orderId=${orderId}`);
  };

  if (loading) {
    return (
      <div className="payment-qr-page">
        <div className="payment-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tạo mã QR thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-qr-page">
        <div className="payment-container">
          <div className="error-message">
            <h2><IconX size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />Lỗi tạo thanh toán</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/orders')} className="btn btn-primary">
              Quay lại đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-qr-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1><IconCreditCard size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Thanh toán QR Code</h1>
          <p>Quét mã QR bên dưới để thanh toán đơn hàng</p>
        </div>

        <div className="qr-section">
          <div className="qr-code">
            <img src={paymentData.qrCode} alt="QR Code thanh toán" />
          </div>
          
          <div className="payment-info">
            <h3>Thông tin thanh toán</h3>
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <strong>#{paymentData.orderCode}</strong>
            </div>
            <div className="info-row">
              <span>Số tiền:</span>
              <strong>{new Intl.NumberFormat('vi-VN').format(paymentData.amount || 0)} đ</strong>
            </div>
          </div>
        </div>

        <div className="payment-instructions">
          <h4><IconSmartphone size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Hướng dẫn thanh toán:</h4>
          <ol>
            <li>Mở ứng dụng ngân hàng trên điện thoại</li>
            <li>Chọn chức năng quét mã QR</li>
            <li>Quét mã QR ở trên</li>
            <li>Xác nhận thông tin và thanh toán</li>
          </ol>
        </div>

        <div className="payment-actions">
          <button 
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Hủy thanh toán
          </button>
          
          <a 
            href={paymentData.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Mở trang thanh toán
          </a>
        </div>

        <div className="payment-status">
          {checking && (
            <div className="status-checking">
              <div className="spinner-small"></div>
              <span>Đang kiểm tra trạng thái thanh toán...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentQRPage;