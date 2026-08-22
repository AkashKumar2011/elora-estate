import api from './client';

export const listMyLeads = (params) => api.get('/leads', { params });
export const getClientLead = (clientId) => api.get(`/leads/client/${clientId}`);
export const setNextAction = (clientId, payload) => api.patch(`/leads/client/${clientId}/next-action`, payload);
export const setOutcome = (clientId, outcome) => api.patch(`/leads/client/${clientId}/outcome`, { outcome });
export const recordDeal = (clientId, payload) => api.patch(`/leads/client/${clientId}/deal`, payload);
export const reassignLead = (clientId, assignedBroker) => api.post(`/leads/client/${clientId}/reassign`, { assignedBroker });
