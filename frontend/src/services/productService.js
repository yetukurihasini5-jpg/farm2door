import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  getFeaturedProducts: async () => {
    const res = await api.get('/products/featured');
    return res.data;
  },
};

export const categoryService = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  getCategoryById: async (id) => {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },

  getCategoryBySlug: async (slug) => {
    const res = await api.get(`/categories/slug/${slug}`);
    return res.data;
  },
};
