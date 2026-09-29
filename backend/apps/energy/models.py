from django.db import models
from django.utils import timezone
from apps.facilities.models import SmartMeter

class EnergyReading(models.Model):
    meter = models.ForeignKey(SmartMeter, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(db_index=True)
    kwh_consumed = models.FloatField(default=0.0)
    kw_demand = models.FloatField(default=0.0)
    kvar_reactive = models.FloatField(default=0.0)
    power_factor = models.FloatField(default=1.0)
    voltage_avg = models.FloatField(default=230.0)
    current_avg = models.FloatField(default=0.0)
    frequency = models.FloatField(default=50.0)
    thd_voltage = models.FloatField(default=2.0)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['meter', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.meter.meter_id} @ {self.timestamp}: {self.kw_demand}kW"

class DailyEnergyAggregate(models.Model):
    meter = models.ForeignKey(SmartMeter, on_delete=models.CASCADE, related_name='daily_aggregates')
    date = models.DateField(db_index=True)
    total_kwh = models.FloatField(default=0.0)
    peak_kw = models.FloatField(default=0.0)
    avg_kw = models.FloatField(default=0.0)
    min_kw = models.FloatField(default=0.0)
    avg_power_factor = models.FloatField(default=1.0)
    off_peak_kwh = models.FloatField(default=0.0)
    on_peak_kwh = models.FloatField(default=0.0)

    class Meta:
        ordering = ['-date']
        unique_together = ('meter', 'date')

    def __str__(self):
        return f"{self.meter.meter_id} on {self.date}: {self.total_kwh}kWh"
