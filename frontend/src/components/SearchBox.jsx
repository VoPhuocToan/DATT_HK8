import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 2) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Đóng suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (keyword) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/products?keyword=${encodeURIComponent(keyword)}&limit=5`);
      setSuggestions(response.data.items || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.slug}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="search-box" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-form">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Bạn muốn mua gì hôm nay?"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {isLoading && <span className="search-loading">⏳</span>}
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          <div className="search-suggestions-header">
            <span>Gợi ý sản phẩm</span>
          </div>
          <div className="search-suggestions-list">
            {suggestions.map((product) => (
              <div
                key={product._id}
                className="search-suggestion-item"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="suggestion-image">
                  <img 
                    src={product.images?.[0] || '/placeholder.svg'} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="suggestion-info">
                  <div className="suggestion-name">{product.name}</div>
                  <div className="suggestion-price">{formatPrice(product.price)}</div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="suggestion-original-price">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {searchTerm.trim() && (
            <div className="search-suggestions-footer">
              <button 
                className="search-view-all"
                onClick={handleSearch}
              >
                Xem tất cả kết quả cho "{searchTerm}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;