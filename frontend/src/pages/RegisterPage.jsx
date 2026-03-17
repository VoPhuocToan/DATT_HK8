import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

// SVG icons
const IconRegister = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C9.61 21 3 14.39 3 6a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
  </svg>
);
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5 0-9.27-3.11-11-7.5a10.05 10.05 0 012.38-3.56M6.53 6.53A9.97 9.97 0 0112 4c5 0 9.27 3.11 11 7.5a10.05 10.05 0 01-4.12 5.03M1 1l22 22M9.88 9.88A3 3 0 0014.12 14.12"/>
    <path d="M1 1l22 22" strokeWidth="2" stroke="currentColor" fill="none"/>
  </svg>
);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', name: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      await register({ email: form.email, name: form.name, phone: form.phone, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1><IconRegister /> Đăng ký</h1>
          <p>Tạo tài khoản GOOJODOQ của bạn</p>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label><span className="field-icon"><IconEmail /></span> Email <span className="required">*</span></label>
            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label><span className="field-icon"><IconUser /></span> Họ và tên</label>
            <input
              name="name"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label><span className="field-icon"><IconPhone /></span> Số điện thoại</label>
            <input
              name="phone"
              placeholder="0912345678"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label><span className="field-icon"><IconLock /></span> Mật khẩu <span className="required">*</span></label>
            <div className="input-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            <span className="field-hint">Tối thiểu 6 ký tự</span>
          </div>

          <div className="auth-field">
            <label><span className="field-icon"><IconLock /></span> Xác nhận mật khẩu <span className="required">*</span></label>
            <div className="input-password">
              <input
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <button className="auth-btn" type="submit"><IconRegister /> Đăng ký</button>

          <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
