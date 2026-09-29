from django.db import models
from apps.facilities.models import Facility

class TariffConfig(models.Model):
    name = models.CharField(max_length=100, default='Standard Commercial Tier')
    tier1_rate = models.FloatField(default=5.50, help_text='0-100 kWh Base Slab Rate')
    tier2_rate = models.FloatField(default=6.80, help_text='101-500 kWh Intermediate Slab Rate')
    tier3_rate = models.FloatField(default=8.50, help_text='501+ kWh Commercial Standard Rate')
    peak_surcharge_rate = models.FloatField(default=10.50, help_text='13:00-17:00 Peak Hour Tariff Rate')
    fixed_charge_monthly = models.FloatField(default=8500.0)
    tax_percentage = models.FloatField(default=12.0)
    solar_credit_rate = models.FloatField(default=4.50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Active: {self.is_active})"

class UtilityBill(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('DUE', 'Due / Pending'),
        ('OVERDUE', 'Overdue'),
    ]

    billing_period = models.CharField(max_length=50) # e.g. "September 2026"
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='bills', null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    total_kwh = models.FloatField(default=0.0)
    energy_charges = models.FloatField(default=0.0)
    fixed_charges = models.FloatField(default=0.0)
    tax_amount = models.FloatField(default=0.0)
    renewable_credit = models.FloatField(default=0.0)
    net_payable = models.FloatField(default=0.0)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DUE')
    is_generated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        fac = self.facility.name if self.facility else "Campus Wide"
        return f"Bill {self.billing_period} - {fac}: ₹{self.net_payable}"
