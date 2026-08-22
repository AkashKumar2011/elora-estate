import api from './client';

export const createNote = (payload) => api.post('/notes', payload);
export const listClientNotes = (clientId) => api.get(`/notes/client/${clientId}`);
export const listPropertyNotes = (propertyId) => api.get(`/notes/property/${propertyId}`);
