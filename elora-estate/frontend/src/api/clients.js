import api from './client';

export const listClients = (params) => api.get('/clients', { params });
export const createClient = (payload) => api.post('/clients', payload);
export const getClientCrmSummary = (clientId) => api.get(`/clients/${clientId}/crm-summary`);
