const Banner = require('../models/Banner');

// GET /banners — public, chỉ lấy banner active, sắp xếp theo order
const getBanners = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
    return res.json(banners);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// POST /banners — admin
const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return res.status(201).json(banner);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// PUT /banners/:id — admin
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    return res.json(banner);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// DELETE /banners/:id — admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    return res.json({ message: 'Đã xóa' });
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };
