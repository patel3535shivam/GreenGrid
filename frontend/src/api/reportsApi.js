import axiosInstance from './axiosInstance';

export const reportsApi = {
  getSummary: () => axiosInstance.get('/reports/summary/'),
  getConfigurations: () => axiosInstance.get('/reports/configurations/'),
  getPreview: (params) => axiosInstance.get('/reports/preview/', { params }),
  getTelemetry: (params) => axiosInstance.get('/reports/telemetry/', { params }),
  getBilling: (params) => axiosInstance.get('/reports/billing/', { params }),
  getFacilities: (params) => axiosInstance.get('/reports/facilities/', { params }),
  getHistory: () => axiosInstance.get('/reports/history/'),
  generateReport: (data) => axiosInstance.post('/reports/generate/', data, { responseType: 'blob' }),
  exportCSV: (reportType = 'energy', facilityId = 'ALL', format = 'CSV') => {
    return axiosInstance.get('/reports/export/csv/', {
      params: { report_type: reportType, facility_id: facilityId, file_format: format },
      responseType: 'blob',
    });
  },
};
