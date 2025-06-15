import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/user/userSlice';
import { toast } from 'react-toastify';

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

// Response interceptor - token expire durumunu yakala
api.interceptors.response.use(
  (response) => {
    // Token expire kontrolü
    if (response?.data?.code === "5") {
      toast.warning("Your session has expired. Please login again.");
      store.dispatch(logout());
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    return response;
  },
  (error) => {
    // Error durumunda da kontrol et
    if (error?.response?.data?.code === "5") {
      toast.warning("Your session has expired. Please login again.");
      store.dispatch(logout());
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export { api }