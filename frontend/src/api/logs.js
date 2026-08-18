import apiClient from './client';

export const getHabitLogs = async (params = {}) => {
  const response = await apiClient.get('/habit-logs/', { params });
  return response.data;
};

export const saveHabitLog = async ({ habit, date, is_done, value }) => {
  const response = await apiClient.post('/habit-logs/', {
    habit,
    date,
    is_done,
    value,
  });
  return response.data;
};

export const deleteHabitLog = async (id) => {
  const response = await apiClient.delete(`/habit-logs/${id}/`);
  return response.data;
};

export const getDashboardToday = async (date = null) => {
  const params = date ? { date } : {};
  const response = await apiClient.get('/dashboard/today/', { params });
  return response.data;
};

export const getWeeklyTracker = async (startDate = null) => {
  const params = startDate ? { start_date: startDate } : {};
  const response = await apiClient.get('/tracker/weekly/', { params });
  return response.data;
};
