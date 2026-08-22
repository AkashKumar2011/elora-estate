import api from './client';

export const getClientLineup = (clientId) => api.get(`/lineups/${clientId}`);
export const addPropertyToLineup = (clientId, propertyId) => api.post(`/lineups/${clientId}/items`, { propertyId });
export const updateLineupItemStatus = (clientId, itemId, status) =>
  api.patch(`/lineups/${clientId}/items/${itemId}`, { status });
export const removePropertyFromLineup = (clientId, itemId) => api.delete(`/lineups/${clientId}/items/${itemId}`);
