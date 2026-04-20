import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const providerApi = {
  getAll: () => api.get('/providers'),
  getById: (id: number) => api.get(`/providers/${id}`),
  create: (data: any) => api.post('/providers', data),
  update: (id: number, data: any) => api.put(`/providers/${id}`, data),
  delete: (id: number) => api.delete(`/providers/${id}`),
};

export const apiKeyApi = {
  getByProvider: (providerId: number) => api.get(`/providers/${providerId}/keys`),
  create: (providerId: number, data: any) => api.post(`/providers/${providerId}/keys`, data),
  update: (providerId: number, keyId: number, data: any) => api.put(`/providers/${providerId}/keys/${keyId}`, data),
  delete: (providerId: number, keyId: number) => api.delete(`/providers/${providerId}/keys/${keyId}`),
};

export const backendApi = {
  getByProvider: (providerId: number) => api.get(`/providers/${providerId}/backends`),
  create: (providerId: number, data: any) => api.post(`/providers/${providerId}/backends`, data),
  update: (providerId: number, backendId: number, data: any) => api.put(`/providers/${providerId}/backends/${backendId}`, data),
  delete: (providerId: number, backendId: number) => api.delete(`/providers/${providerId}/backends/${backendId}`),
};

export default api;
