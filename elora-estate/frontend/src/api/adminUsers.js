import api from './client';

export const listInternalUsers = (params) => api.get('/admin/users', { params });
export const approveUser = (userId) => api.post(`/admin/users/${userId}/approve`);
export const rejectUser = (userId, reason) => api.post(`/admin/users/${userId}/reject`, { reason });
export const deactivateUser = (userId) => api.post(`/admin/users/${userId}/deactivate`);
export const reactivateUser = (userId) => api.post(`/admin/users/${userId}/reactivate`);
export const changeUserRole = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role });
export const updateUserPermissions = (userId, permissions) => api.patch(`/admin/users/${userId}/permissions`, permissions);
