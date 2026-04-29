// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ==================== Auth APIs ====================

export const authAPI = {
  signup: async (email, password, userType, phoneNumber) => {
    const response = await api.post('/users/signup', {
      email,
      password,
      userType,
      phoneNumber,
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/users/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// ==================== Product APIs ====================

export const productAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data.products;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  },

  getSellerProducts: async () => {
    const response = await api.get('/products/seller/products');
    return response.data.products;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  updateStock: async (variantId, stockQuantity) => {
    const response = await api.patch(`/products/${variantId}/stock`, {
      stockQuantity,
    });
    return response.data;
  },
};

// ==================== Cart APIs ====================

export const cartAPI = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  getCount: async () => {
    try {
      const response = await api.get('/cart');
      const cart = response.data.cart || [];
      return cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },

  add: async (productId, quantity) => {
    const response = await api.post('/cart', {
      productId,
      quantity,
    });
    return response.data;
  },

  update: async (itemId, quantity) => {
    const response = await api.patch(`/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  remove: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  clear: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

// ==================== Order APIs ====================

export const orderAPI = {
  create: async (shippingAddress) => {
    const response = await api.post('/orders', {
      shippingAddress,
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data.orders;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  },

  getSellerOrders: async () => {
    const response = await api.get('/orders/seller/orders');
    return response.data.orders;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};

// ==================== Seller APIs ====================

export const sellerAPI = {
  createProfile: async (profileData) => {
    // Flatten bankDetails to match backend schema
    const payload = {
      bio: profileData.bio,
      locationVillage: profileData.locationVillage,
      sellerType: profileData.sellerType,
      taxId: profileData.taxId,
      bankAccountNumber: profileData.bankDetails?.accountNumber || profileData.accountNumber,
      ifscCode: profileData.bankDetails?.ifscCode || profileData.ifscCode,
    };
    
    const response = await api.post('/sellers', payload);
    return response.data;
  },

  getProfile: async (sellerId) => {
    // If no sellerId provided, get current user's seller profile
    const endpoint = sellerId ? `/sellers/${sellerId}` : '/sellers/profile';
    const response = await api.get(endpoint);
    return response.data.seller;
  },
};

// ==================== Payout APIs ====================

export const payoutAPI = {
  getSellerPayouts: async () => {
    const response = await api.get('/payouts/seller');
    return response.data.payouts;
  },

  getById: async (id) => {
    const response = await api.get(`/payouts/${id}`);
    return response.data.payout;
  },
};

export default api;
