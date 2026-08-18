import apiClient from './client';

export const getHabits = async (params = {}) => {
  const response = await apiClient.get('/habits/', { params });
  return response.data;
};

export const getHabit = async (id) => {
  const response = await apiClient.get(`/habits/${id}/`);
  return response.data;
};

export const createHabit = async (habitData) => {
  const response = await apiClient.post('/habits/', habitData);
  return response.data;
};

export const updateHabit = async (id, habitData) => {
  const response = await apiClient.patch(`/habits/${id}/`, habitData);
  return response.data;
};

export const deleteHabit = async (id) => {
  const response = await apiClient.delete(`/habits/${id}/`);
  return response.data;
};

export const toggleHabitActive = async (id) => {
  const response = await apiClient.post(`/habits/${id}/toggle-active/`);
  return response.data;
};

export const getHabitStats = async (id) => {
  const response = await apiClient.get(`/habits/${id}/stats/`);
  return response.data;
};
