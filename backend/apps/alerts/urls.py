from django.urls import path
from .views import (
    AlertListView, AlertDetailView, AlertSummaryView,
    AcknowledgeAlertView, ResolveAlertView,
)

urlpatterns = [
    path('', AlertListView.as_view(), name='alert_list'),
    path('summary/', AlertSummaryView.as_view(), name='alert_summary'),
    path('<int:pk>/', AlertDetailView.as_view(), name='alert_detail'),
    path('<int:pk>/acknowledge/', AcknowledgeAlertView.as_view(), name='acknowledge_alert'),
    path('<int:pk>/resolve/', ResolveAlertView.as_view(), name='resolve_alert'),
]
