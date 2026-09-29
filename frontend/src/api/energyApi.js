import axiosInstance from './axiosInstance';

export const energyApi = {
  getDashboardKPIs: () => axiosInstance.get('/energy/dashboard-kpis/'),
  getFacilityBreakdown: () => axiosInstance.get('/energy/facility-breakdown/'),
  getConsumptionChart: () => axiosInstance.get('/energy/consumption-chart/'),
  getLiveTelemetry: () => axiosInstance.get('/energy/telemetry-directory/'),
  getHistoricalReadings: (meterId) => axiosInstance.get('/energy/readings/', { params: { meter_id: meterId } }),
  getDailyConsumption: (days = 30) => axiosInstance.get('/energy/daily-consumption/', { params: { days } }),
  getMonthlyConsumption: () => axiosInstance.get('/energy/monthly-consumption/'),
};
