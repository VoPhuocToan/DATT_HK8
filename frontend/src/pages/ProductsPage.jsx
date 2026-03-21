import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: 0 },
  { label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
  { label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
  { label: '10 – 20 triệu', min: 10_000_000, max: 20_000_000 },
  { label: '20 – 30 triệu', min: 20_000_000, max: 30_000_000 },
  { label: 'Trên 30 triệu', min: 30_000_000, max: 0 },
];

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá tăng dần', value: 'price_asc' },
  { label: 'Giá giảm dần', value: 'price_desc' },
  { label: 'Phổ biến nhất', value: 'popular' },
];

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Còn hàng', value: 'instock' },
  { label: 'Hết hàng', value: 'outstock' },
];

const ProductsPage = ({ categorySlug, pageTitle }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState('');

  const [keyword, setKeyword] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const buildParams = (overrides = {}) => {
    const opts = { keyword, brand: selectedBrand, priceIdx, status, sort, page, limit: 100, ...overrides };
    const params = new URLSearchParams();
    params.set('limit', opts.limit);
    params.set('page', opts.page);
    params.set('sort', opts.sort);
    if (opts.keyword) params.set('keyword', opts.keyword);
    if (opts.brand) params.set('brand', opts.brand);
    if (categoryId) params.set('category', categoryId);
    const pr = PRICE_RANGES[opts.priceIdx];
    if (pr.min > 0) params.set('minPrice', pr.min);
    if (pr.max > 0) params.set('maxPrice', pr.max);
    return params.toString();
  };

  // Bỏ dung lượng bộ nhớ khỏi tên để group sản phẩm cùng dòng
  const getBaseName = (name) =>
    name.replace(/\b(64|128|256|512|1T|1TB)\s*GB\b/gi, '').replace(/\s{2,}/g, ' ').trim();

  // Dedup: mỗi dòng sản phẩm chỉ giữ 1 đại diện (giá thấp nhất)
  const dedupByModel = (items) => {
    const map = new Map();
    items.forEach((p) => {
      const key = `${p.brand || ''}__${getBaseName(p.name)}`;
      const cur = map.get(key);
      const price = p.salePrice > 0 ? p.salePrice : p.price;
      const curPrice = cur ? (cur.salePrice > 0 ? cur.salePrice : cur.price) : Infinity;
      if (!cur || price < curPrice) map.set(key, p);
    });
    return [...map.values()];
  };

  const fetchProducts = async (overrides = {}) => {
    setLoading(true);
    // Lấy nhiều hơn để dedup không làm mất trang
    const params = buildParams({ ...overrides, limit: 100 });
    const { data } = await api.get(`/products?${params}`);
    let items = data.items || [];

    // Client-side status filter
    const st = overrides.status ?? status;
    if (st === 'instock') items = items.filter((p) => p.stock > 0);
    if (st === 'outstock') items = items.filter((p) => p.stock === 0);

    // Dedup theo dòng sản phẩm
    items = dedupByModel(items);

    setProducts(items);
    setTotalPages(1); // pagination không còn cần thiết sau dedup
    setLoading(false);
  };

  // Load brands từ tất cả sản phẩm theo category
  const fetchBrands = async (catId = '') => {
    const params = catId ? `?limit=200&category=${catId}` : '?limit=200';
    const { data } = await api.get(`/products${params}`);
    const all = data.items || [];
    const unique = [...new Set(all.map((p) => p.brand).filter(Boolean))].sort();
    setBrands(unique);
  };

  useEffect(() => {
    const init = async () => {
      let catId = '';
      if (categorySlug) {
        try {
          const { data } = await api.get(`/categories`);
          const found = data.find((c) => c.slug === categorySlug);
          if (found) { catId = found._id; setCategoryId(found._id); }
        } catch (_) {}
      }
      await fetchBrands(catId);
      // fetchProducts dùng categoryId state nhưng state chưa update kịp
      // nên truyền thẳng qua buildParams override
      setLoading(true);
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('page', '1');
      params.set('sort', 'newest');
      if (catId) params.set('category', catId);
      const { data } = await api.get(`/products?${params}`);
      let items = data.items || [];
      items = dedupByModel(items);
      setProducts(items);
      setLoading(false);
    };
    init();
  }, [categorySlug]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts({ page: 1 });
  };

  const handleBrand = (brand) => {
    setSelectedBrand(brand);
    setPage(1);
    fetchProducts({ brand, page: 1 });
  };

  const handlePrice = (idx) => {
    setPriceIdx(idx);
    setPage(1);
    fetchProducts({ priceIdx: idx, page: 1 });
  };

  const handleStatus = (val) => {
    setStatus(val);
    setPage(1);
    fetchProducts({ status: val, page: 1 });
  };

  const handleSort = (val) => {
    setSort(val);
    setPage(1);
    fetchProducts({ sort: val, page: 1 });
  };

  const handlePage = (p) => {
    setPage(p);
    fetchProducts({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedBrand('');
    setPriceIdx(0);
    setStatus('all');
    setSort('newest');
    setPage(1);
    fetchProducts({ keyword: '', brand: '', priceIdx: 0, status: 'all', sort: 'newest', page: 1 });
  };

  const hasFilter = selectedBrand || priceIdx > 0 || status !== 'all';

  return (
    <div className="plp-wrap">
      {/* ── Header ── */}
      <div className="plp-header">
        <h1 className="plp-title">{pageTitle || 'Sản phẩm'}</h1>
        <div className="plp-sort-row">
          <span className="plp-sort-label">Sắp xếp:</span>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`plp-sort-btn ${sort === o.value ? 'active' : ''}`}
              onClick={() => handleSort(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="plp-layout">
        {/* ── Sidebar filter ── */}
        <aside className="plp-sidebar">
          {hasFilter && (
            <button className="plp-reset-btn" onClick={handleReset}>✕ Xóa bộ lọc</button>
          )}

          {/* Brand */}
          <div className="plp-filter-group">
            <div className="plp-filter-title">Hãng sản xuất</div>
            <div className="plp-brand-list">
              <button
                className={`plp-brand-btn ${selectedBrand === '' ? 'active' : ''}`}
                onClick={() => handleBrand('')}
              >
                Tất cả
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  className={`plp-brand-btn ${selectedBrand === b ? 'active' : ''}`}
                  onClick={() => handleBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="plp-filter-group">
            <div className="plp-filter-title">Mức giá</div>
            <div className="plp-radio-list">
              {PRICE_RANGES.map((pr, i) => (
                <label key={i} className={`plp-radio-item ${priceIdx === i ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="price"
                    checked={priceIdx === i}
                    onChange={() => handlePrice(i)}
                  />
                  {pr.label}
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="plp-filter-group">
            <div className="plp-filter-title">Tình trạng</div>
            <div className="plp-radio-list">
              {STATUS_OPTIONS.map((o) => (
                <label key={o.value} className={`plp-radio-item ${status === o.value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    checked={status === o.value}
                    onChange={() => handleStatus(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div className="plp-content">
          {/* Active filters */}
          {hasFilter && (
            <div className="plp-active-filters">
              {selectedBrand && (
                <span className="plp-filter-tag">
                  Hãng: {selectedBrand}
                  <button onClick={() => handleBrand('')}>✕</button>
                </span>
              )}
              {priceIdx > 0 && (
                <span className="plp-filter-tag">
                  Giá: {PRICE_RANGES[priceIdx].label}
                  <button onClick={() => handlePrice(0)}>✕</button>
                </span>
              )}
              {status !== 'all' && (
                <span className="plp-filter-tag">
                  {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                  <button onClick={() => handleStatus('all')}>✕</button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="plp-loading">Đang tải sản phẩm...</div>
          ) : products.length === 0 ? (
            <div className="plp-empty">
              <div style={{ fontSize: 48 }}>🔍</div>
              <p>Không tìm thấy sản phẩm phù hợp.</p>
              <button className="btn" onClick={handleReset}>Xóa bộ lọc</button>
            </div>
          ) : (
            <>
              <div className="grid products-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="plp-pagination">
                  <button disabled={page <= 1} onClick={() => handlePage(page - 1)} className="plp-page-btn">←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`plp-page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => handlePage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button disabled={page >= totalPages} onClick={() => handlePage(page + 1)} className="plp-page-btn">→</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
