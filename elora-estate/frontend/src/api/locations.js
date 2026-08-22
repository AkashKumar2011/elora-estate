// import api from './client';

// export const listActiveLocations = () => api.get('/locations');
// export const listAllLocations = () => api.get('/locations/all');
// export const createLocation = (name) => api.post('/locations', { name });
// export const setLocationActive = (id, isActive) => api.patch(`/locations/${id}`, { isActive });

// export const listAllLocations = () => api.get('/locations/all');
// export const createLocation = (name) => api.post('/locations', { name });
// export const setLocationActive = (id, isActive) => api.patch(`/locations/${id}`, { isActive });



import api from './client';

export const listActiveLocations = () => api.get('/locations');

export const listAllLocations = () => api.get('/locations/all');

export const createLocation = (name) =>
  api.post('/locations', { name });

export const setLocationActive = (id, isActive) =>
  api.patch(`/locations/${id}`, { isActive });