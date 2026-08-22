import api from './client';

export const listMyCart = () => api.get('/cart');
export const addToCart = (propertyId) => api.post('/cart', { propertyId });
export const removeFromCart = (propertyId) => api.delete(`/cart/${propertyId}`);
