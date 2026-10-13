import api from './api';

export const notificationService = {
  getNotifications: async (page = 0, size = 15) => {
    const res = await api.get('/notifications', { params: { page, size } });
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res;
  },

  markAllAsRead: async () => {
    const res = await api.put('/notifications/mark-all-read');
    return res;
  },
};

export const reviewService = {
  submitReview: async (productId, reviewData) => {
    const res = await api.post(`/reviews/product/${productId}`, reviewData);
    return res.data;
  },

  getProductReviews: async (productId, page = 0, size = 10) => {
    const res = await api.get(`/reviews/product/${productId}`, { params: { page, size } });
    return res.data;
  },
};

export const addressService = {
  getAddresses: async () => {
    const res = await api.get('/addresses');
    return res.data;
  },

  createAddress: async (data) => {
    const res = await api.post('/addresses', data);
    return res.data;
  },

  updateAddress: async (id, data) => {
    const res = await api.put(`/addresses/${id}`, data);
    return res.data;
  },

  deleteAddress: async (id) => {
    const res = await api.delete(`/addresses/${id}`);
    return res;
  },

  setDefault: async (id) => {
    const res = await api.put(`/addresses/${id}/default`);
    return res.data;
  },
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data; // returns relative path e.g. /api/uploads/...
  },
};
