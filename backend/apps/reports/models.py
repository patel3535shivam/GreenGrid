from django.db import models

from apps.facilities.models import Facility


class GeneratedReport(models.Model):
    REPORT_TYPES = [
        ('energy', 'Energy Consumption & Telemetry Stream'),
        ('billing', 'Utility Billing & Cost Allocation Audit'),
    ]

    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    facility = models.ForeignKey(
        Facility,
        on_delete=models.SET_NULL,
        related_name='generated_reports',
        null=True,
        blank=True,
    )
    file_name = models.CharField(max_length=255)
    row_count = models.PositiveIntegerField(default=0)
    file_size_bytes = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.file_name} ({self.row_count} rows)'