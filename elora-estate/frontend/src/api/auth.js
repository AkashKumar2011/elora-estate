import api from './client';

export const requestClientOtp = (payload) => api.post('/auth/client/otp/request', payload);
export const verifyClientOtp = (payload) => api.post('/auth/client/otp/verify', payload);
export const registerInternalUser = (payload) => api.post('/auth/internal/register', payload);
export const internalLogin = (payload) => api.post('/auth/internal/login', payload);
export const refreshSession = () => api.post('/auth/refresh');
export const logout = () => api.post('/auth/logout');
export const fetchMe = () => api.get('/auth/me');
