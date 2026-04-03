/**
 * Resolve image URL.
 * Tất cả ảnh (kể cả ảnh upload) đều nằm trong frontend/public
 * nên chỉ cần dùng path trực tiếp /filename.
 * - URL đầy đủ (http/https): dùng trực tiếp
 * - Path bắt đầu bằng /: dùng trực tiếp
 * - Tên file không có /: thêm /
 */
export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return img.startsWith('/') ? img : `/${img}`;
};
