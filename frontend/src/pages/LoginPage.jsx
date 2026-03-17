import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

// SVG icons
const IconLogin = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17l5-5-5-5v3H3v4h7v3zm9-15H5a2 2 0 00-2 2v4h2V4h14v16H5v-4H3v4a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
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
const IconHome = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1><IconLogin /> Đăng nhập</h1>
          <p>Chào mừng trở lại với GOOJODOQ</p>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label><span className="field-icon"><IconEmail /></span> Email</label>
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
            <label><span className="field-icon"><IconLock /></span> Mật khẩu</label>
            <div className="input-password">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          <label className="auth-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Ghi nhớ đăng nhập
          </label>

          <button className="auth-btn" type="submit"><IconLogin /> Đăng nhập</button>

          <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
          <p className="auth-home"><Link to="/"><IconHome /> Về trang chủ</Link></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
