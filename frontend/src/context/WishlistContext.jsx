import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const WishlistContext = createContext(null);
const KEY = 'wishlist';

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = (product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) return prev.filter((p) => p._id !== product._id);
      return [...prev, {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images,
        brand: product.brand,
        category: product.category,
      }];
    });
  };

  const isLiked = (id) => items.some((p) => p._id === id);
  const clear = () => setItems([]);

  const value = useMemo(() => ({ items, toggle, isLiked, clear }), [items]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
