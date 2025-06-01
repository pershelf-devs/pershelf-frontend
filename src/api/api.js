import axios from 'axios';
import { store } from '../redux/store';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const access_token = store.getState()?.user?.access_token
    if (access_token) {
      config.headers.Authorization = `${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

export { api }