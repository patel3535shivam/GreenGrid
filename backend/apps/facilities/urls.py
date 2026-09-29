from django.urls import path
from .views import (
    FacilityListCreateView, FacilityDetailView, 
    SmartMeterListCreateView, SmartMeterDetailView,
    OrganizationView, FacilitySummaryView
)

urlpatterns = [
    path('facilities/summary/', FacilitySummaryView.as_view(), name='facility_summary'),
    path('facilities/', FacilityListCreateView.as_view(), name='facility_list'),
    path('facilities/<int:pk>/', FacilityDetailView.as_view(), name='facility_detail'),
    path('facilities/<int:pk>/meters/', SmartMeterListCreateView.as_view(), name='facility_meters'),
    path('meters/', SmartMeterListCreateView.as_view(), name='meter_list'),
    path('meters/<int:pk>/', SmartMeterDetailView.as_view(), name='meter_detail'),
    path('organization/', OrganizationView.as_view(), name='organization'),
]
