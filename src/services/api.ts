import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления Telegram user data
api.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    config.headers['X-Telegram-User'] = JSON.stringify(
      window.Telegram.WebApp.initDataUnsafe.user
    );
  }
  return config;
});

export const userAPI = {
  register: (data: any) => api.post('/users/register', data),
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: any) =>
    api.put(`/users/${userId}`, data),
  checkNickname: (nickname: string) =>
    api.get(`/users/check-nickname/${nickname}`),
};

export const listingsAPI = {
  getAll: (params?: any) => api.get('/listings', { params }),
  getById: (id: string) => api.get(`/listings/${id}`),
  getByUser: (userId: string) => api.get(`/listings/user/${userId}`),
  create: (data: FormData) =>
    api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/listings/${id}/status`, { status }),
};

export const chatsAPI = {
  getByUser: (userId: string) => api.get(`/chats/user/${userId}`),
  getById: (chatId: string) => api.get(`/chats/${chatId}`),
  create: (data: any) => api.post('/chats', data),
  sendMessage: (chatId: string, message: any) =>
    api.post(`/chats/${chatId}/messages`, message),
  shareContacts: (chatId: string, userId: string) =>
    api.post(`/chats/${chatId}/share-contacts`, { userId }),
};

export const reportsAPI = {
  create: (data: any) => api.post('/reports', data),
  getAll: () => api.get('/reports'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/reports/${id}/status`, { status }),
};

export default api;
