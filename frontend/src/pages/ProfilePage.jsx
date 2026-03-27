import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', createdAt: '',
  });
  const [address, setAddress] = useState({
    fullName: '', phone: '', city: '', district: '', ward: '', detail: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [addressMsg, setAddressMsg] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/auth/profile').then(({ data }) => {
      setProfile({ name: data.name || '', email: data.email || '', phone: data.phone || '', createdAt: data.createdAt || '' });
      setAddress({
        fullName: data.address?.fullName || data.name || '',
        phone: data.address?.phone || data.phone || '',
        city: data.address?.city || '',
        district: data.address?.district || '',
        ward: data.address?.ward || '',
        detail: data.address?.detail || '',
      });
    }).catch(() => {});
  }, []);

  const addressFilled = address.fullName && address.phone && address.city && address.district && address.detail;
  const profileComplete = profile.name && profile.phone && addressFilled;

  const handleSaveProfile = async () => {
    setSavingProfile(true); setProfileMsg('');
    try {
      await api.put('/auth/profile', { name: profile.name, phone: profile.phone });
      await refreshProfile();
      setProfileMsg('✅ Lưu thông tin thành công!');
    } catch { setProfileMsg('❌ Lưu thất bại, thử lại.'); }
    finally { setSavingProfile(false); }
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true); setAddressMsg('');
    try {
      await api.put('/auth/profile', { address });
      await refreshProfile();
      setAddressMsg('✅ Lưu địa chỉ thành công!');
    } catch { setAddressMsg('❌ Lưu thất bại, thử lại.'); }
    finally { setSavingAddress(false); }
  };

  const initial = profile.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="prof-page">
      {/* ── Avatar header ── */}
      <div className="prof-header">
        <div className="prof-avatar">{initial}</div>
        <div className="prof-header-info">
          <div className="prof-name">{profile.name}</div>
          <div className="prof-email">{profile.email}</div>
          <span className={`prof-status-badge ${profileComplete ? 'complete' : 'incomplete'}`}>
            {profileComplete ? '✅ Thông tin đã đầy đủ' : '⚠️ Chưa điền đầy đủ thông tin'}
          </span>
        </div>
      </div>

      <div className="prof-divider" />

      {/* ── Thông tin tài khoản ── */}
      <section className="prof-section">
        <h2 className="prof-section-title">👤 Thông tin tài khoản</h2>
        <div className="prof-form-grid">
          <div className="prof-field">
            <label>Họ và tên *</label>
            <input value={profile.name} onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A" />
          </div>
          <div className="prof-field">
            <label>Email</label>
            <input value={profile.email} disabled className="prof-input-disabled" />
          </div>
          <div className="prof-field">
            <label>Số điện thoại</label>
            <input value={profile.phone} onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))} placeholder="0912 345 678" />
          </div>
          <div className="prof-field">
            <label>Ngày tạo tài khoản</label>
            <input value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : ''} disabled className="prof-input-disabled" />
          </div>
        </div>
        {profileMsg && <div className={`prof-msg ${profileMsg.includes('✅') ? 'success' : 'error'}`}>{profileMsg}</div>}
        <button className="prof-save-btn prof-save-blue" onClick={handleSaveProfile} disabled={savingProfile}>
          💾 {savingProfile ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}
        </button>
      </section>

      <div className="prof-divider" />

      {/* ── Địa chỉ nhận hàng ── */}
      <section className="prof-section">
        <h2 className="prof-section-title">📍 Địa chỉ nhận hàng</h2>
        {!addressFilled && (
          <div className="prof-address-notice">
            ℹ️ Bạn chưa có địa chỉ nhận hàng. Hãy điền để không cần nhập lại khi thanh toán.
          </div>
        )}
        <div className="prof-form-grid">
          <div className="prof-field">
            <label>Tên người nhận *</label>
            <input value={address.fullName} onChange={(e) => setAddress((f) => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A" />
          </div>
          <div className="prof-field">
            <label>Số điện thoại người nhận *</label>
            <input value={address.phone} onChange={(e) => setAddress((f) => ({ ...f, phone: e.target.value }))} placeholder="0912 345 678" />
          </div>
          <div className="prof-field">
            <label>Thành phố *</label>
            <input value={address.city} onChange={(e) => setAddress((f) => ({ ...f, city: e.target.value }))} placeholder="TP. Hồ Chí Minh" />
          </div>
          <div className="prof-field">
            <label>Quận/Huyện *</label>
            <input value={address.district} onChange={(e) => setAddress((f) => ({ ...f, district: e.target.value }))} placeholder="Quận 1" />
          </div>
          <div className="prof-field">
            <label>Địa chỉ chi tiết *</label>
            <input value={address.detail} onChange={(e) => setAddress((f) => ({ ...f, detail: e.target.value }))} placeholder="123 Nguyễn Huệ" />
          </div>
          <div className="prof-field">
            <label>Phường/Xã (mã bưu điện)</label>
            <input value={address.ward} onChange={(e) => setAddress((f) => ({ ...f, ward: e.target.value }))} placeholder="Phường Bến Nghé" />
          </div>
        </div>
        {addressMsg && <div className={`prof-msg ${addressMsg.includes('✅') ? 'success' : 'error'}`}>{addressMsg}</div>}
        <button className="prof-save-btn prof-save-green" onClick={handleSaveAddress} disabled={savingAddress}>
          💾 {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ nhận hàng'}
        </button>
      </section>
    </div>
  );
};

export default ProfilePage;
