import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL });

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error messages so components can rely on error.message.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    const message = data?.error?.message || 'Something went wrong. Please try again.';
    const details = data?.error?.details;
    return Promise.reject({ message, details, status: error.response?.status });
  }
);

// ---- Endpoint helpers (keep components clean) ----
export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((r) => r.data.data),
};

export const ridesApi = {
  list: () => api.get('/rides').then((r) => r.data.data),
  search: (params) => api.get('/rides/search', { params }).then((r) => r.data.data),
  detail: (id) => api.get(`/rides/${id}`).then((r) => r.data.data),
  mine: () => api.get('/rides/mine').then((r) => r.data.data),
  history: () => api.get('/rides/history').then((r) => r.data.data),
  create: (payload) => api.post('/rides', payload).then((r) => r.data.data),
  cancel: (id) => api.post(`/rides/${id}/cancel`).then((r) => r.data.data),
  complete: (id) => api.post(`/rides/${id}/complete`).then((r) => r.data.data),
};

export const requestsApi = {
  create: (payload) => api.post('/requests', payload).then((r) => r.data.data),
  incoming: () => api.get('/requests/incoming').then((r) => r.data.data),
  outgoing: () => api.get('/requests/outgoing').then((r) => r.data.data),
  decide: (id, decision) => api.patch(`/requests/${id}`, { decision }).then((r) => r.data.data),
};

export const messagesApi = {
  conversation: (rideId, otherUserId) =>
    api.get(`/messages/${rideId}/${otherUserId}`).then((r) => r.data.data),
  send: (payload) => api.post('/messages', payload).then((r) => r.data.data),
};

export const notificationsApi = {
  list: () => api.get('/notifications').then((r) => r.data.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data.data),
};
