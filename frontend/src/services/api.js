import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token from localStorage to every request if present
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('isu-auth') || 'null');
  if (auth?.access) {
    config.headers['Authorization'] = `Bearer ${auth.access}`;
  }
  return config;
});

export const getPrograms = (params) => api.get('programs/', { params });
export const getProgram = (slug) => api.get(`programs/${slug}/`);
export const createProgram = (data) => api.post('programs/', data);
export const updateProgram = (id, data) => api.patch(`programs/${id}/`, data);
export const deleteProgram = (id) => api.delete(`programs/${id}/`);
export const uploadProgramImage = (id, formData) => api.post(`programs/${id}/image/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getLocations = () => api.get('locations/');
export const createLocation = (data) => api.post('locations/', data);
export const updateLocation = (id, data) => api.patch(`locations/${id}/`, data);
export const deleteLocation = (id) => api.delete(`locations/${id}/`);
export const uploadLocationImage = (id, formData) => api.post(`locations/${id}/image/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const login = (username, password) => api.post('auth/login/', { username, password });
export const logout = (refreshToken) => api.post('auth/logout/', { refresh: refreshToken });

export default api;
