import axios from 'axios';

// Base API URL configurable via environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Centralized Axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send HttpOnly cookies (for refresh token)
  headers: {
    'Content-Type': 'application/json'
  }
});

// In-memory access token storage
let currentAccessToken = null;

// Auth callback for when session expires completely
let onSessionExpiredCallback = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};

export const setSessionExpiredCallback = (callback) => {
  onSessionExpiredCallback = callback;
};

// Queue handling for multiple concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Access Token
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth login/register/refresh endpoints or if already retried
    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token')
    ) {
      return Promise.reject(error);
    }

    // Check if error status is 401 (Unauthorized / Token expired)
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // If already refreshing, queue this request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh-token endpoint (reads HttpOnly cookie automatically)
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('No access token returned in refresh response');
        }

        // Store new access token in memory
        setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Resolve queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, invalid, or revoked
        processQueue(refreshError, null);
        setAccessToken(null);

        if (onSessionExpiredCallback) {
          onSessionExpiredCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Centralized Auth API Service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Centralized Product API Service
export const productService = {
  getAll: async ({ page = 1, limit = 10, category = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

export default api;
