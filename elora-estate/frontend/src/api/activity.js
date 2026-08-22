import api from './client';

export const getClientTimeline = (clientId, params) => api.get(`/activity/client/${clientId}`, { params });
