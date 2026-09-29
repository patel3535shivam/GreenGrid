const pageLoaders = {
  '/dashboard': () => import('../pages/Dashboard/DashboardPage'),
  '/facilities': () => import('../pages/Facilities/FacilitiesPage'),
  '/energy-monitoring': () => import('../pages/EnergyMonitoring/EnergyMonitoringPage'),
  '/billing': () => import('../pages/Billing/BillingPage'),
  '/renewable-energy': () => import('../pages/RenewableEnergy/RenewablePage'),
  '/analytics': () => import('../pages/Analytics/AnalyticsPage'),
  '/forecast': () => import('../pages/Forecast/ForecastPage'),
  '/alerts': () => import('../pages/Alerts/AlertsPage'),
  '/reports': () => import('../pages/Reports/ReportsPage'),
  '/settings': () => import('../pages/Settings/SettingsPage'),
};

export const prefetchPage = (path) => {
  const loadPage = pageLoaders[path];
  if (loadPage) loadPage().catch(() => {});
};

export default pageLoaders;