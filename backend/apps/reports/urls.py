from django.urls import path

from .views import (
    BillingReportView,
    ExportReportCsvView,
    FacilityReportView,
    GenerateReportView,
    GeneratedReportHistoryView,
    ReportConfigurationsView,
    ReportPreviewView,
    ReportSummaryView,
    TelemetryReportView,
)


urlpatterns = [
    path('summary/', ReportSummaryView.as_view(), name='report_summary'),
    path('configurations/', ReportConfigurationsView.as_view(), name='report_configurations'),
    path('preview/', ReportPreviewView.as_view(), name='report_preview'),
    path('telemetry/', TelemetryReportView.as_view(), name='telemetry_report'),
    path('billing/', BillingReportView.as_view(), name='billing_report'),
    path('facilities/', FacilityReportView.as_view(), name='facility_report'),
    path('generate/', GenerateReportView.as_view(), name='generate_report'),
    path('export/csv/', ExportReportCsvView.as_view(), name='export_report_csv'),
    path('history/', GeneratedReportHistoryView.as_view(), name='generated_report_history'),
]