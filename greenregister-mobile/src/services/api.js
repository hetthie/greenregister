import axios from 'axios';

const API_URL = 'https://greenregister-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

let token = null;

export const setToken = (newToken) => {
  token = newToken;
};

export const getToken = () => token;

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;