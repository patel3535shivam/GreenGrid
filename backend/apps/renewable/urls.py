from django.urls import path
from .views import (
    RenewableSummaryView, SolarProfileView, GridNetMeteringView, 
    SolarFleetListView, BESSFleetListView
)

urlpatterns = [
    path('summary/', RenewableSummaryView.as_view(), name='renewable_summary'),
    path('solar-profile/', SolarProfileView.as_view(), name='solar_profile'),
    path('net-metering/', GridNetMeteringView.as_view(), name='net_metering'),
    path('solar-fleet/', SolarFleetListView.as_view(), name='solar_fleet'),
    path('bess-fleet/', BESSFleetListView.as_view(), name='bess_fleet'),
]
