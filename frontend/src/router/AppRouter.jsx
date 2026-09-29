import React, { lazy, Suspense, useContext, useLayoutEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { cancelRouteRequests } from '../api/axiosInstance';
import pageLoaders from './pageLoaders';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/Login/LoginPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

const DashboardPage = lazy(pageLoaders['/dashboard']);
const FacilitiesPage = lazy(pageLoaders['/facilities']);
const EnergyMonitoringPage = lazy(pageLoaders['/energy-monitoring']);
const BillingPage = lazy(pageLoaders['/billing']);
const RenewablePage = lazy(pageLoaders['/renewable-energy']);
const AnalyticsPage = lazy(pageLoaders['/analytics']);
const ForecastPage = lazy(pageLoaders['/forecast']);
const AlertsPage = lazy(pageLoaders['/alerts']);
const ReportsPage = lazy(pageLoaders['/reports']);
const SettingsPage = lazy(pageLoaders['/settings']);

const PrivateRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

const RouteRequestLifecycle = () => {
  const location = useLocation();
  const previousPath = useRef(location.pathname);

  useLayoutEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      cancelRouteRequests();
    }
  }, [location.pathname]);

  return null;
};

const renderPage = (Page) => (
  <Suspense fallback={(
    <div className="flex h-96 items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 font-medium">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
        Opening page...
      </div>
    </div>
  )}>
    <Page />
  </Suspense>
);

const AppRouter = () => (
  <>
    <RouteRequestLifecycle />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={renderPage(DashboardPage)} />
          <Route path="/facilities" element={renderPage(FacilitiesPage)} />
          <Route path="/energy-monitoring" element={renderPage(EnergyMonitoringPage)} />
          <Route path="/billing" element={renderPage(BillingPage)} />
          <Route path="/renewable-energy" element={renderPage(RenewablePage)} />
          <Route path="/analytics" element={renderPage(AnalyticsPage)} />
          <Route path="/forecast" element={renderPage(ForecastPage)} />
          <Route path="/alerts" element={renderPage(AlertsPage)} />
          <Route path="/reports" element={renderPage(ReportsPage)} />
          <Route path="/settings" element={renderPage(SettingsPage)} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  </>
);

export default AppRouter;