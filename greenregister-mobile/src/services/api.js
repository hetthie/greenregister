import axios from 'axios';

const API_URL = 'https://greenregister-backend.onrender.com/api';
const API_URL2 = 'https://pokeapi.co/api/v2/evolution-chain/1/';

const api = axios.create({
  baseURL: API_URL,
});

const apiP = axios.create({
  baseURL: API_URL2,
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

export { apiP };