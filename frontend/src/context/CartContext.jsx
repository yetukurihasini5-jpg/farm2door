import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isConsumer, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (isAuthenticated && isConsumer) {
      try {
        setLoading(true);
        const data = await cartService.getCart();
        setCart(data);
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCart(null);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isConsumer]);

  const addToCart = async (productId, quantity = 1) => {
    const updated = await cartService.addToCart(productId, quantity);
    setCart(updated);
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    const updated = await cartService.updateQuantity(itemId, quantity);
    setCart(updated);
    return updated;
  };

  const removeItem = async (itemId) => {
    const updated = await cartService.removeItem(itemId);
    setCart(updated);
    return updated;
  };

  const clearCart = async () => {
    await cartService.clearCart();
    setCart((prev) => prev ? { ...prev, items: [], totalItemCount: 0, subtotal: 0, total: 0 } : null);
  };

  const value = {
    cart,
    loading,
    itemCount: cart?.totalItemCount || 0,
    items: cart?.items || [],
    subtotal: cart?.subtotal || 0,
    deliveryFee: cart?.estimatedDeliveryFee || 0,
    total: cart?.total || 0,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
