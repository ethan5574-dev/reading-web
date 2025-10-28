import { AxiosInstance } from './config';

export const login = async (email: string, password: string) => {
  const response = await AxiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, username: string) => {
  const response = await AxiosInstance.post('/auth/register', { email, password, username });
  return response.data;
};

export const getProfile = async () => {
  const response = await AxiosInstance.get('/auth/profile');
  return response.data;
};