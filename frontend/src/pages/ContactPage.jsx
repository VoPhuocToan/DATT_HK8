import { useState } from 'react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'Câu hỏi chung', message: '', agree: false });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', phone: '', subject: 'Câu hỏi chung', message: '', agree: false });
  };

  return (
    <div className="ct-page">
      {/* ── Hero banner ── */}
      <div className="ct-hero">
        <h1>Liên hệ với chúng tôi</h1>
        <p className="ct-hero-sub">Cảm ơn bạn đã chọn Đặng Anh Shop!</p>
        <p className="ct-hero-desc">
          Chúng tôi luôn lắng nghe mọi ý kiến – từ người dùng, đối tác và nhà sáng tạo.<br />
          Vui lòng chọn mục phù hợp theo nhu cầu của bạn, đội ngũ chúng tôi sẽ liên hệ lại trong vòng 24 giờ.
        </p>
      </div>

      {/* ── Contact form ── */}
      <div className="ct-form-wrap">
        <div className="ct-form-card">
          <h2 className="ct-form-title">Gửi tin nhắn cho chúng tôi</h2>
          <p className="ct-form-sub">Điền thông tin liên lạc và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể!</p>

          {sent && <div className="ct-success-msg">✅ Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi sớm nhất.</div>}

          <form className="ct-form" onSubmit={handleSubmit}>
            <div className="ct-form-row">
              <div className="ct-field">
                <label>Họ và tên *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nhập họ và tên" required />
              </div>
              <div className="ct-field">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Nhập địa chỉ email" required />
              </div>
            </div>
            <div className="ct-form-row">
              <div className="ct-field">
                <label>Số điện thoại *</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Nhập số điện thoại" required />
              </div>
              <div className="ct-field">
                <label>Chủ đề</label>
                <select value={form.subject} onChange={(e) => set('subject', e.target.value)}>
                  <option>Câu hỏi chung</option>
                  <option>Hỗ trợ đơn hàng</option>
                  <option>Bảo hành & đổi trả</option>
                  <option>Hợp tác kinh doanh</option>
                  <option>Góp ý sản phẩm</option>
                </select>
              </div>
            </div>
            <div className="ct-field">
              <label>Tin nhắn *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Nhập nội dung tin nhắn của bạn..."
                required
              />
            </div>
            <label className="ct-agree-label">
              <input type="checkbox" checked={form.agree} onChange={(e) => set('agree', e.target.checked)} required />
              Tôi đồng ý với{' '}
              <a href="#" className="ct-link">Chính sách quyền riêng tư</a>{' '}
              của Đặng Anh Shop
            </label>
            <button type="submit" className="ct-submit-btn">
              ✉️ Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="ct-map-section">
        <h2 className="ct-section-title">Vị trí của chúng tôi</h2>
        <div className="ct-map-wrap">
          <iframe
            title="Đặng Anh Shop Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8!2d106.6138!3d10.7553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752c9b7b3b3b3b%3A0x0!2zMTE3IE5ndXnhu4VuIFRo4buLIFTDuiwgQsOsbmggVMOibiwgVFAuIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1710000000000&q=117+Nguy%E1%BB%85n+Th%E1%BB%8B+T%C3%BA%2C+B%C3%ACnh+T%C3%A2n%2C+H%E1%BB%93+Ch%C3%AD+Minh"
            width="100%"
            height="380"
            style={{ border: 0, borderRadius: 12 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="ct-info-cards">
        <div className="ct-info-card">
          <div className="ct-info-icon" style={{ background: '#7c3aed' }}>📍</div>
          <h3>Địa chỉ</h3>
          <p>117 Nguyễn Thị Tú, Bình Tân</p>
          <p>TP. Hồ Chí Minh, Việt Nam</p>
        </div>
        <div className="ct-info-card">
          <div className="ct-info-icon" style={{ background: '#7c3aed' }}>📞</div>
          <h3>Điện thoại</h3>
          <p>Hotline: 1800-xxxx</p>
          <p>Tel: (0294) 1234 5678</p>
        </div>
        <div className="ct-info-card">
          <div className="ct-info-icon" style={{ background: '#7c3aed' }}>✉️</div>
          <h3>Email</h3>
          <p>Support: support@danganhshop.com</p>
          <p>Sales: sales@danganhshop.com</p>
        </div>
      </div>

      {/* ── Working hours ── */}
      <div className="ct-hours-section">
        <h2 className="ct-section-title">Giờ làm việc</h2>
        <div className="ct-hours-card">
          <table className="ct-hours-table">
            <tbody>
              <tr>
                <td>Thứ Hai – Thứ Sáu</td>
                <td className="ct-hours-time">8:00 AM – 17:00 PM</td>
              </tr>
              <tr>
                <td>Thứ Bảy</td>
                <td className="ct-hours-time">9:00 AM – 12:00 PM</td>
              </tr>
              <tr>
                <td>Chủ Nhật</td>
                <td className="ct-hours-closed">Nghỉ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
