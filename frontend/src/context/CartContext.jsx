import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data } = await api.get('/cart');
    setItems(data);
  };

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setItems(data);
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setItems(data);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setItems(data);
  };

  useEffect(() => {
    fetchCart();
  }, [user?._id]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => {
    const price = item.product?.salePrice > 0 ? item.product.salePrice : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const value = useMemo(
    () => ({ items, cartCount, cartTotal, fetchCart, addItem, updateItem, removeItem }),
    [items, cartCount, cartTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
