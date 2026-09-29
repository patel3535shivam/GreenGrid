from django.urls import path

from .views import (
    AnalyticsDashboardView,
    AnalyticsFiltersView,
    AnalyticsSummaryView,
    ConsumptionTrendView,
    CostAnalysisView,
    EfficiencyView,
    FacilityComparisonView,
    PeakDemandView,
    PowerFactorView,
    RenewableContributionView,
)


urlpatterns = [
    path('filters/', AnalyticsFiltersView.as_view(), name='analytics_filters'),
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics_summary'),
    path('consumption/', ConsumptionTrendView.as_view(), name='analytics_consumption'),
    path('facilities/', FacilityComparisonView.as_view(), name='analytics_facilities'),
    path('peak-demand/', PeakDemandView.as_view(), name='analytics_peak_demand'),
    path('power-factor/', PowerFactorView.as_view(), name='analytics_power_factor'),
    path('cost/', CostAnalysisView.as_view(), name='analytics_cost'),
    path('renewable/', RenewableContributionView.as_view(), name='analytics_renewable'),
    path('efficiency/', EfficiencyView.as_view(), name='analytics_efficiency'),
]