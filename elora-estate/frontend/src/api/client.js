import axios from 'axios';

// Backend serves everything under /api; Vite's dev proxy (vite.config.js)
// forwards it to the Express server so the frontend never needs to know
// the backend's actual host/port during development.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly refresh-token cookie
});

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On a 401 (expired access token), try exactly one silent refresh before
// giving up — avoids forcing a full re-login every 15 minutes while still
// not retrying forever if the refresh token itself is invalid.
let refreshPromise = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise || api.post('/auth/refresh');
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshPromise = null;
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
