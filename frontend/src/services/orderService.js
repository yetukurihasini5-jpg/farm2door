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

export const orderService = {
  checkout: async (checkoutData) => {
    const res = await api.post('/orders/checkout', checkoutData);
    return res.data;
  },

  getMyOrders: async (page = 0, size = 10) => {
    const res = await api.get('/orders/my-orders', { params: { page, size } });
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  trackOrder: async (orderNumber) => {
    const res = await api.get(`/orders/track/${orderNumber}`);
    return res.data;
  },

  cancelOrder: async (id, reason) => {
    const res = await api.put(`/orders/${id}/cancel`, { reason });
    return res.data;
  },

  updateStatus: async (id, status, notes) => {
    const res = await api.put(`/orders/${id}/status`, { status, notes });
    return res.data;
  },
};
