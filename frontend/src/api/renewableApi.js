import axiosInstance from './axiosInstance';

export const renewableApi = {
  getSummary: () => axiosInstance.get('/renewable/summary/'),
  getSolarProfile: () => axiosInstance.get('/renewable/solar-profile/'),
  getNetMetering: () => axiosInstance.get('/renewable/net-metering/'),
  getSolarFleet: () => axiosInstance.get('/renewable/solar-fleet/'),
  getBessFleet: () => axiosInstance.get('/renewable/bess-fleet/'),
};
