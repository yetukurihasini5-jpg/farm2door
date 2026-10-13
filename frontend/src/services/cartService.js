import api from './api';

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addToCart: async (productId, quantity) => {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data;
  },

  updateQuantity: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart');
    return res;
  },
};
