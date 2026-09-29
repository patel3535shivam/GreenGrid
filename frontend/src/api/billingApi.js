import axiosInstance from './axiosInstance';

export const billingApi = {
  getSummary: () => axiosInstance.get('/billing/summary/'),
  getTariff: () => axiosInstance.get('/billing/tariff/'),
  updateTariff: (data) => axiosInstance.put('/billing/tariff/', data),
  getFacilityBreakdown: () => axiosInstance.get('/billing/facility-breakdown/'),
  getHistory: () => axiosInstance.get('/billing/history/'),
  getTrends: () => axiosInstance.get('/billing/trends/'),
  generateBill: (data = {}) => axiosInstance.post('/billing/generate/', data),
  exportCsv: () => axiosInstance.get('/billing/export.csv', { responseType: 'blob' }),
};
