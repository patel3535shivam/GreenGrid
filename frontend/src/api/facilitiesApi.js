import axiosInstance from './axiosInstance';

export const facilitiesApi = {
  getSummary: () => axiosInstance.get('/facilities/summary/'),
  list: (params) => axiosInstance.get('/facilities/', { params }),
  getById: (id) => axiosInstance.get(`/facilities/${id}/`),
  create: (data) => axiosInstance.post('/facilities/', data),
  update: (id, data) => axiosInstance.put(`/facilities/${id}/`, data),
  delete: (id) => axiosInstance.delete(`/facilities/${id}/`),
  getMeters: (facilityId) => axiosInstance.get(`/facilities/${facilityId}/meters/`),
  listMeters: () => axiosInstance.get('/meters/'),
};
