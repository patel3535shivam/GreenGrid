import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getFilters: () => axiosInstance.get('/analytics/filters/'),
  getDashboard: (params) => axiosInstance.get('/analytics/dashboard/', { params }),
  getSummary: (params) => axiosInstance.get('/analytics/summary/', { params }),
  getConsumption: (params) => axiosInstance.get('/analytics/consumption/', { params }),
  getFacilities: (params) => axiosInstance.get('/analytics/facilities/', { params }),
  getPeakDemand: (params) => axiosInstance.get('/analytics/peak-demand/', { params }),
  getPowerFactor: (params) => axiosInstance.get('/analytics/power-factor/', { params }),
  getCost: (params) => axiosInstance.get('/analytics/cost/', { params }),
  getRenewable: (params) => axiosInstance.get('/analytics/renewable/', { params }),
  getEfficiency: (params) => axiosInstance.get('/analytics/efficiency/', { params }),
};