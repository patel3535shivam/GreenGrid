import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let routeAbortController = new AbortController();
const inFlightGetRequests = new Map();

export const cancelRouteRequests = () => {
  routeAbortController.abort();
  routeAbortController = new AbortController();
};

export const isRequestCanceled = (error) =>
  axios.isCancel(error) || error?.code === 'ERR_CANCELED';

const axiosGet = axiosInstance.get.bind(axiosInstance);
axiosInstance.get = (url, config = {}) => {
  if (config.signal) return axiosGet(url, config);

  const params = Object.entries(config.params || {})
    .filter(([, value]) => value !== null && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  const token = localStorage.getItem('gg_access_token') || '';
  const key = `${url}?${params}|${token}`;
  const existingRequest = inFlightGetRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = axiosGet(url, {
    ...config,
    signal: routeAbortController.signal,
  });
  inFlightGetRequests.set(key, request);
  const clearRequest = () => {
    if (inFlightGetRequests.get(key) === request) inFlightGetRequests.delete(key);
  };
  request.then(clearRequest, clearRequest);
  return request;
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.signal) config.signal = routeAbortController.signal;
    const token = localStorage.getItem('gg_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('gg_refresh_token');
        if (refreshToken) {
          const res = await axios.post('/api/v1/auth/refresh/', { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('gg_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('gg_access_token');
        localStorage.removeItem('gg_refresh_token');
        localStorage.removeItem('gg_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
