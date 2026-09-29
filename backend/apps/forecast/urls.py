from django.urls import path

from .views import (
    FacilityForecastView,
    ForecastConfidenceView,
    ForecastConsumptionView,
    ForecastFiltersView,
    ForecastPeakDemandView,
    ForecastSummaryView,
)


urlpatterns = [
    path('filters/', ForecastFiltersView.as_view(), name='forecast_filters'),
    path('summary/', ForecastSummaryView.as_view(), name='forecast_summary'),
    path('consumption/', ForecastConsumptionView.as_view(), name='forecast_consumption'),
    path('peak-demand/', ForecastPeakDemandView.as_view(), name='forecast_peak_demand'),
    path('confidence/', ForecastConfidenceView.as_view(), name='forecast_confidence'),
    path('facilities/', FacilityForecastView.as_view(), name='facility_forecasts'),
]