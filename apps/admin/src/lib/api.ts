import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: async (username: string, password: string) => {
    const response = await api.post('/admin/auth/login', { username, password });
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Licenses
  getLicenses: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/admin/licenses', { params });
    return response.data;
  },

  createLicense: async (data: {
    type: 'ONE_TIME' | 'SUBSCRIPTION';
    maxActivations?: number;
    expiresAt?: string;
    note?: string;
  }) => {
    const response = await api.post('/admin/licenses', data);
    return response.data;
  },

  updateLicense: async (id: string, data: Partial<typeof data>) => {
    const response = await api.patch(`/admin/licenses/${id}`, data);
    return response.data;
  },

  deleteLicense: async (id: string) => {
    const response = await api.delete(`/admin/licenses/${id}`);
    return response.data;
  },

  regenerateKey: async (id: string) => {
    const response = await api.post(`/admin/licenses/${id}/regenerate`);
    return response.data;
  },

  // Activations
  getActivations: async (params?: { page?: number; limit?: number; licenseId?: string }) => {
    const response = await api.get('/admin/activations', { params });
    return response.data;
  },

  deleteActivation: async (id: string) => {
    const response = await api.delete(`/admin/activations/${id}`);
    return response.data;
  },

  // Audit Log
  getAuditLog: async (params?: { page?: number; limit?: number; action?: string }) => {
    const response = await api.get('/admin/audit-log', { params });
    return response.data;
  },
};
