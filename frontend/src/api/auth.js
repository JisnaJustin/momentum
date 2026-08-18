import apiClient from './client';

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/token/', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register/', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me/');
  return response.data;
};

export const refreshAuthToken = async (refresh) => {
  const response = await apiClient.post('/token/refresh/', { refresh });
  return response.data;
};
