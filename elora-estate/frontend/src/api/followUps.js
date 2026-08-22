import api from './client';

export const getFollowUpBuckets = (params) => api.get('/follow-ups/dashboard', { params });
export const createFollowUp = (payload) => api.post('/follow-ups', payload);
export const completeFollowUp = (id) => api.post(`/follow-ups/${id}/complete`);
export const snoozeFollowUp = (id, dueAt) => api.post(`/follow-ups/${id}/snooze`, { dueAt });
