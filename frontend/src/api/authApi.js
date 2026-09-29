import axiosInstance from './axiosInstance';

export const authApi = {
  login: (email, password) => axiosInstance.post('/auth/login/', { email, password }),
  logout: (refresh) => axiosInstance.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => axiosInstance.post('/auth/refresh/', { refresh }),
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.put('/auth/profile/', data),
  changePassword: (data) => axiosInstance.post('/auth/change-password/', data),
  listUsers: () => axiosInstance.get('/auth/users/'),
  updateUser: (id, data) => axiosInstance.put(`/auth/users/${id}/`, data),
};
