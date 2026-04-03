const FlashSaleSession = require('../models/FlashSaleSession');
const Product = require('../models/Product');

// Lấy tất cả sessions (admin)
const getSessions = async (req, res) => {
  try {
    const sessions = await FlashSaleSession.find()
      .populate('items.product', 'name images price salePrice slug stock')
      .sort({ startTime: -1 });
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Lấy session đang active (frontend - theo thời gian thực)
const getActiveSessions = async (req, res) => {
  try {
    const now = new Date();
    const sessions = await FlashSaleSession.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('items.product', 'name images price salePrice slug stock');
    return res.json(sessions);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Tạo session mới
const createSession = async (req, res) => {
  try {
    const { name, startTime, endTime, items, isActive } = req.body;
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu' });
    }
    const session = await FlashSaleSession.create({ name, startTime, endTime, isActive: isActive !== false, items: items || [] });
    await session.populate('items.product', 'name images price salePrice slug stock');
    return res.status(201).json(session);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Cập nhật session
const updateSession = async (req, res) => {
  try {
    const session = await FlashSaleSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Không tìm thấy session' });
    const { name, startTime, endTime, items, isActive } = req.body;
    if (name !== undefined) session.name = name;
    if (startTime !== undefined) session.startTime = startTime;
    if (endTime !== undefined) session.endTime = endTime;
    if (items !== undefined) session.items = items;
    if (isActive !== undefined) session.isActive = isActive;
    await session.save();
    await session.populate('items.product', 'name images price salePrice slug stock');
    return res.json(session);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Xóa session
const deleteSession = async (req, res) => {
  try {
    const session = await FlashSaleSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Không tìm thấy session' });
    await session.deleteOne();
    return res.json({ message: 'Đã xóa' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { getSessions, getActiveSessions, createSession, updateSession, deleteSession };
