from django.urls import path
from .views import (
    BillingSummaryView, TariffConfigView, FacilityBillingBreakdownView, 
    BillHistoryView, BillingTrendsView, GenerateBillView, BillingCsvExportView
)

urlpatterns = [
    path('summary/', BillingSummaryView.as_view(), name='billing_summary'),
    path('tariff/', TariffConfigView.as_view(), name='tariff_config'),
    path('facility-breakdown/', FacilityBillingBreakdownView.as_view(), name='facility_billing_breakdown'),
    path('history/', BillHistoryView.as_view(), name='bill_history'),
    path('trends/', BillingTrendsView.as_view(), name='billing_trends'),
    path('generate/', GenerateBillView.as_view(), name='generate_bill'),
    path('export.csv', BillingCsvExportView.as_view(), name='billing_csv_export'),
]
