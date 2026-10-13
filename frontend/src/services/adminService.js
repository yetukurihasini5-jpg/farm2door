import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getUsers: async (role, page = 0, size = 15) => {
    const params = { page, size };
    if (role) params.role = role;
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserActivation: async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle-activation`);
    return res.data;
  },

  toggleFarmerVerification: async (profileId) => {
    const res = await api.put(`/admin/farmers/${profileId}/toggle-verification`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await api.put(`/admin/categories/${id}`, categoryData);
    return res.data;
  },

  updateProductStatus: async (id, status) => {
    const res = await api.put(`/admin/products/${id}/status`, { status });
    return res.data;
  },

  getAllOrders: async (page = 0, size = 15) => {
    const res = await api.get('/admin/orders', { params: { page, size } });
    return res.data;
  },

  getSalesReport: async (params = {}) => {
    const res = await api.get('/admin/reports/sales', { params });
    return res.data;
  },

  exportOrdersCsv: async (params = {}) => {
    const response = await api.get('/admin/reports/export-csv', {
      params,
      responseType: 'blob',
    });
    return response; // raw blob
  },
};
