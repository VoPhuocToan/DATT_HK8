const SupportTicket = require('../models/SupportTicket');

// POST /api/support — khách hàng gửi yêu cầu
const createTicket = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    const ticket = await SupportTicket.create({ name, email, phone, subject, message });
    return res.status(201).json(ticket);
  } catch (err) {
    console.error('createTicket error:', err);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// GET /api/support — admin lấy danh sách
const getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

// PUT /api/support/:id — admin cập nhật trạng thái / phản hồi
const updateTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy yêu cầu.' });
    if (status) ticket.status = status;
    if (adminReply !== undefined) ticket.adminReply = adminReply;
    await ticket.save();
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi server.' });
  }
};

module.exports = { createTicket, getTickets, updateTicket };
