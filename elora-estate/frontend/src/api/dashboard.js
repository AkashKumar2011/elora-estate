import api from './client';

export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getBrokerDashboard = () => api.get('/dashboard/broker');
export const getClientDashboard = () => api.get('/dashboard/client');
export const getOwnerDashboard = () => api.get('/dashboard/owner');
export const getClientActivityList = () => api.get('/dashboard/client-activity');
