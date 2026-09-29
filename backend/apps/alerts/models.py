from django.db import models
from apps.facilities.models import Facility

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('WARNING', 'Warning'),
        ('INFO', 'Info'),
    ]
    CATEGORY_CHOICES = [
        ('PEAK_DEMAND', 'Peak Demand Risk'),
        ('SUB_METER', 'Sub-meter Anomaly'),
        ('RENEWABLE', 'Renewable / BESS'),
        ('POWER_QUALITY', 'Power Quality / THD'),
    ]

    alert_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='WARNING')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='PEAK_DEMAND')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    meter_id = models.CharField(max_length=100, blank=True, null=True)
    observed_val = models.CharField(max_length=100, blank=True, null=True)
    limit_val = models.CharField(max_length=100, blank=True, null=True)
    is_acknowledged = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.alert_id} - {self.title}"
