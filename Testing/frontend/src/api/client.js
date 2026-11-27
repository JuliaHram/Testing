import axios from 'axios';
import { store } from '../app/store';
import { setCredentials, clearCredentials } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { refreshToken, teacher } = store.getState().auth;

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        store.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            teacher,
          })
        );

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        store.dispatch(clearCredentials());
      }
    }

    return Promise.reject(error);
  }
);

export default api;