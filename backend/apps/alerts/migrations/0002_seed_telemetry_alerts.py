from django.db import migrations
from django.utils import timezone


def seed_telemetry_alerts(apps, schema_editor):
    Alert = apps.get_model('alerts', 'Alert')
    EnergyReading = apps.get_model('energy', 'EnergyReading')
    SmartMeter = apps.get_model('facilities', 'SmartMeter')

    peak_reading = EnergyReading.objects.select_related(
        'meter', 'meter__facility'
    ).order_by('-kw_demand', '-timestamp').first()
    sub_reading = EnergyReading.objects.filter(
        meter__meter_type='SUB'
    ).select_related('meter', 'meter__facility').order_by(
        '-kw_demand', '-timestamp'
    ).first()
    low_sub_reading = EnergyReading.objects.filter(
        meter__meter_type='SUB'
    ).select_related('meter', 'meter__facility').order_by(
        'kw_demand', '-timestamp'
    ).first()
    low_pf_reading = EnergyReading.objects.select_related(
        'meter', 'meter__facility'
    ).order_by('power_factor', '-timestamp').first()
    high_thd_reading = EnergyReading.objects.select_related(
        'meter', 'meter__facility'
    ).order_by('-thd_voltage', '-timestamp').first()

    fallback_meter = SmartMeter.objects.select_related('facility').order_by('id').first()

    def location(reading):
        if reading:
            return reading.meter.facility_id, reading.meter.meter_id
        if fallback_meter:
            return fallback_meter.facility_id, fallback_meter.meter_id
        return None, 'Campus Main Incomer'

    def create_alert(alert_id, title, description, severity, category, reading,
                     observed, limit, resolved=False):
        facility_id, meter_id = location(reading)
        now = timezone.now()
        defaults = {
            'title': title,
            'description': description,
            'severity': severity,
            'category': category,
            'facility_id': facility_id,
            'meter_id': meter_id,
            'observed_val': observed,
            'limit_val': limit,
            'is_acknowledged': resolved,
            'is_resolved': resolved,
            'acknowledged_at': now if resolved else None,
            'resolved_at': now if resolved else None,
        }
        Alert.objects.get_or_create(alert_id=alert_id, defaults=defaults)

    peak_kw = peak_reading.kw_demand if peak_reading else 0.0
    create_alert(
        'ALT-1001',
        'Peak Demand Threshold Breached',
        'Telemetry-based peak demand exceeded the deterministic demo limit.',
        'CRITICAL', 'PEAK_DEMAND', peak_reading,
        f'{peak_kw:.1f} kW', f'{peak_kw * 0.9:.1f} kW',
    )

    sub_kw = sub_reading.kw_demand if sub_reading else 0.0
    create_alert(
        'ALT-1002',
        'Sub-meter Demand Anomaly',
        'The recorded sub-meter demand is above its telemetry-derived incident threshold.',
        'CRITICAL', 'SUB_METER', sub_reading,
        f'{sub_kw:.1f} kW', f'{sub_kw * 0.85:.1f} kW',
    )

    low_pf = low_pf_reading.power_factor if low_pf_reading else 0.0
    create_alert(
        'ALT-1003',
        'Low Power Factor',
        'Recorded meter power factor is below the 0.95 operating threshold.',
        'WARNING', 'POWER_QUALITY', low_pf_reading,
        f'{low_pf:.3f} PF', '0.950 PF',
    )

    low_sub_kw = low_sub_reading.kw_demand if low_sub_reading else 0.0
    create_alert(
        'ALT-1004',
        'Sub-meter Low Load Anomaly',
        'Sub-meter demand is unusually low relative to its deterministic telemetry baseline.',
        'WARNING', 'SUB_METER', low_sub_reading,
        f'{low_sub_kw:.1f} kW', f'{max(low_sub_kw * 1.5, 0.1):.1f} kW expected',
    )

    thd = high_thd_reading.thd_voltage if high_thd_reading else 0.0
    create_alert(
        'ALT-1005',
        'Voltage Distortion Warning',
        'Measured voltage total harmonic distortion exceeded its telemetry-derived limit.',
        'WARNING', 'POWER_QUALITY', high_thd_reading,
        f'{thd:.2f}% THD', f'{thd * 0.9:.2f}% THD',
    )

    create_alert(
        'ALT-1006',
        'Power Quality Incident Resolved',
        'A prior power quality event was acknowledged and resolved from meter telemetry.',
        'INFO', 'POWER_QUALITY', low_pf_reading,
        f'{low_pf:.3f} PF', '0.950 PF', resolved=True,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0001_initial'),
        ('energy', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_telemetry_alerts, migrations.RunPython.noop),
    ]