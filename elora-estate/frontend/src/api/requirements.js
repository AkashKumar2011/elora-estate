import api from './client';

export const createRequirement = (payload) => api.post('/requirements', payload);
export const updateRequirement = (id, payload) => api.patch(`/requirements/${id}`, payload);
export const getClientRequirements = (clientId) => api.get(`/requirements/client/${clientId}`);
export const getMyRequirementMatches = () => api.get('/requirements/me/matches');
