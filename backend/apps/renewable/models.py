from django.db import models
from apps.facilities.models import Facility

class SolarAsset(models.Model):
    asset_id = models.CharField(max_length=50, unique=True) # e.g. SLR-HQ-01
    name = models.CharField(max_length=150)
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='solar_assets', null=True, blank=True)
    capacity_kw = models.FloatField(default=350.0)
    current_generation_kw = models.FloatField(default=280.5)
    daily_yield_kwh = models.FloatField(default=1420.0)
    efficiency_pct = models.FloatField(default=98.4)
    status = models.CharField(max_length=20, default='ONLINE')

    def __str__(self):
        return f"{self.asset_id} - {self.name} ({self.capacity_kw}kW)"

class BESSAsset(models.Model):
    asset_id = models.CharField(max_length=50, unique=True) # e.g. BESS-MG-01
    name = models.CharField(max_length=150)
    capacity_kwh = models.FloatField(default=1000.0)
    current_charge_kwh = models.FloatField(default=820.0)
    state_of_charge_pct = models.FloatField(default=82.0)
    discharging_rate_kw = models.FloatField(default=200.0)
    temperature_c = models.FloatField(default=28.4)
    health_pct = models.FloatField(default=99.1)
    status = models.CharField(max_length=20, default='DISCHARGING')

    def __str__(self):
        return f"{self.asset_id} - {self.name} ({self.state_of_charge_pct}%)"
