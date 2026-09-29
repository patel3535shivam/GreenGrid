import axiosInstance from './axiosInstance';

export const forecastApi = {
  getFilters: () => axiosInstance.get('/forecast/filters/'),
  getSummary: (params) => axiosInstance.get('/forecast/summary/', { params }),
  getConsumption: (params) => axiosInstance.get('/forecast/consumption/', { params }),
  getPeakDemand: (params) => axiosInstance.get('/forecast/peak-demand/', { params }),
  getConfidence: (params) => axiosInstance.get('/forecast/confidence/', { params }),
  getFacilities: (params) => axiosInstance.get('/forecast/facilities/', { params }),
};
