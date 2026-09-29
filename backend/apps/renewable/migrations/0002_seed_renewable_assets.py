from django.db import migrations


def seed_assets(apps, schema_editor):
    Facility = apps.get_model('facilities', 'Facility')
    SolarAsset = apps.get_model('renewable', 'SolarAsset')
    BESSAsset = apps.get_model('renewable', 'BESSAsset')
    facility = Facility.objects.order_by('id').first()

    solar_assets = [
        ('SLR-HQ-01', 'Main Admin Solar Array', 350.0, 280.5, 1420.0),
        ('SLR-DC-02', 'Data Center Solar Roof', 250.0, 210.0, 980.0),
        ('SLR-WRK-03', 'Factory Workshop String', 400.0, 320.0, 1650.0),
    ]
    for asset_id, name, capacity_kw, current_kw, daily_yield in solar_assets:
        SolarAsset.objects.get_or_create(
            asset_id=asset_id,
            defaults={
                'name': name,
                'facility_id': facility.id if facility else None,
                'capacity_kw': capacity_kw,
                'current_generation_kw': current_kw,
                'daily_yield_kwh': daily_yield,
                'efficiency_pct': 98.4,
                'status': 'ONLINE',
            },
        )

    BESSAsset.objects.get_or_create(
        asset_id='BESS-MG-01',
        defaults={
            'name': 'Campus BESS Megapack',
            'capacity_kwh': 1000.0,
            'current_charge_kwh': 820.0,
            'state_of_charge_pct': 82.0,
            'discharging_rate_kw': 200.0,
            'temperature_c': 28.4,
            'health_pct': 99.1,
            'status': 'DISCHARGING',
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('renewable', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_assets, migrations.RunPython.noop),
    ]