import axiosInstance from './axiosInstance';

export const alertsApi = {
  list: (params) => axiosInstance.get('/alerts/', { params }),
  getSummary: () => axiosInstance.get('/alerts/summary/'),
  acknowledge: (id) => axiosInstance.post(`/alerts/${id}/acknowledge/`),
  resolve: (id) => axiosInstance.post(`/alerts/${id}/resolve/`),
};
