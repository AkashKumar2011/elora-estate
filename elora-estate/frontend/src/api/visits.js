import api from './client';

export const scheduleVisit = (payload) => api.post('/visits', payload);
export const rescheduleVisit = (id, scheduledAt) => api.post(`/visits/${id}/reschedule`, { scheduledAt });
export const cancelVisit = (id, reason) => api.post(`/visits/${id}/cancel`, { reason });
export const recordVisitOutcome = (id, payload) => api.post(`/visits/${id}/outcome`, payload);
export const listMyVisits = () => api.get('/visits/mine');
export const listAllVisits = (params) => api.get('/visits', { params });
