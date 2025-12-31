import api, { setToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    setToken(response.data.token);
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    setToken(response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  setToken(null);
};

export const getCurrentUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const loadToken = async () => {
  const storedToken = await AsyncStorage.getItem('token');
  if (storedToken) {
    setToken(storedToken);
  }
  return storedToken;
};