import api from './client';

export const listPublicProperties = (params) => api.get('/properties', { params });
export const getPublicProperty = (id) => api.get(`/properties/${id}`);

export const listInternalProperties = (params) => api.get('/properties/internal/list', { params });
export const getInternalProperty = (id) => api.get(`/properties/${id}/internal`);
export const getPropertyMatches = (id) => api.get(`/properties/${id}/matches`);
export const createProperty = (payload) => api.post('/properties', payload);
export const updateProperty = (id, payload) => api.patch(`/properties/${id}`, payload);
export const publishProperty = (id) => api.post(`/properties/${id}/publish`);
export const hideProperty = (id) => api.post(`/properties/${id}/hide`);
export const archiveProperty = (id) => api.post(`/properties/${id}/archive`);
