import api from './api';

export const farmerService = {
  getProfile: async () => {
    const res = await api.get('/farmer/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/farmer/profile', data);
    return res.data;
  },

  getDashboardStats: async () => {
    const res = await api.get('/farmer/dashboard');
    return res.data;
  },

  getMyProducts: async (page = 0, size = 10) => {
    const res = await api.get('/farmer/products', { params: { page, size } });
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/farmer/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/farmer/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/farmer/products/${id}`);
    return res;
  },

  toggleProductStatus: async (id) => {
    const res = await api.put(`/farmer/products/${id}/toggle-status`);
    return res.data;
  },

  getLowStock: async () => {
    const res = await api.get('/farmer/inventory/low-stock');
    return res.data;
  },

  getOrders: async (status, page = 0, size = 10) => {
    const params = { page, size };
    if (status) params.status = status;
    const res = await api.get('/farmer/orders', { params });
    return res.data;
  },

  updateOrderStatus: async (id, status, notes) => {
    const res = await api.put(`/farmer/orders/${id}/status`, { status, notes });
    return res.data;
  },
};
