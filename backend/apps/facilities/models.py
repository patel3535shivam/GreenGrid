from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    tenant_id = models.CharField(max_length=100, unique=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class Facility(models.Model):
    TYPE_CHOICES = [
        ('MAIN_ADMIN', 'Main Admin'),
        ('LAB', 'Lab'),
        ('FACTORY', 'Factory'),
        ('HOSTEL', 'Hostel'),
        ('CANTEEN', 'Canteen'),
        ('OTHER', 'Other'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Maintenance'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='facilities')
    name = models.CharField(max_length=255)
    facility_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='OTHER')
    area_sqft = models.FloatField(default=0.0)
    floors = models.IntegerField(default=1)
    lat = models.FloatField(blank=True, null=True)
    lon = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def active_meter_count(self):
        return self.meters.filter(status='ACTIVE').count()

class SmartMeter(models.Model):
    TYPE_CHOICES = [
        ('MAIN', 'Main'),
        ('SUB', 'Sub'),
        ('SOLAR', 'Solar'),
        ('BATTERY', 'Battery'),
        ('EV', 'EV'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('FAULT', 'Fault'),
    ]
    CONNECTION_CHOICES = [
        ('1-PHASE', '1-Phase'),
        ('3-PHASE', '3-Phase'),
    ]

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='meters')
    meter_id = models.CharField(max_length=100, unique=True)
    meter_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='MAIN')
    make = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    rated_capacity_kw = models.FloatField(default=0.0)
    installed_date = models.DateField(blank=True, null=True)
    last_calibrated = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    connection_type = models.CharField(max_length=20, choices=CONNECTION_CHOICES, default='3-PHASE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.meter_id} ({self.meter_type})"
