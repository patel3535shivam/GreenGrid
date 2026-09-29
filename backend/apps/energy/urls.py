from django.urls import path
from .views import (
    DashboardKPIView, FacilityBreakdownView, LiveTelemetryDirectoryView, 
    ConsumptionChartView, HistoricalReadingsView, DailyConsumptionView, 
    MonthlyConsumptionView, ExportCSVView
)

urlpatterns = [
    path('dashboard-kpis/', DashboardKPIView.as_view(), name='dashboard_kpis'),
    path('facility-breakdown/', FacilityBreakdownView.as_view(), name='facility_breakdown'),
    path('telemetry-directory/', LiveTelemetryDirectoryView.as_view(), name='telemetry_directory'),
    path('consumption-chart/', ConsumptionChartView.as_view(), name='consumption_chart'),
    path('readings/', HistoricalReadingsView.as_view(), name='historical_readings'),
    path('daily-consumption/', DailyConsumptionView.as_view(), name='daily_consumption'),
    path('monthly-consumption/', MonthlyConsumptionView.as_view(), name='monthly_consumption'),
    path('export/csv/', ExportCSVView.as_view(), name='export_csv'),
]
