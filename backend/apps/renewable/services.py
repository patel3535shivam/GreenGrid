from collections import defaultdict
from datetime import timedelta

from django.db.models import Max, Sum
from django.utils import timezone

from apps.energy.models import DailyEnergyAggregate, EnergyReading
from apps.facilities.models import SmartMeter

from .models import BESSAsset, SolarAsset


# Demo grid emissions factor: 0.82 kg CO2 per kWh of renewable generation.
DEMO_GRID_EMISSION_FACTOR_KG_CO2_PER_KWH = 0.82
SOLAR_HOURLY_YIELD_SHARES = (
    0.005, 0.02, 0.05, 0.09, 0.13, 0.16,
    0.16, 0.14, 0.11, 0.08, 0.04, 0.015,
)


def _campus_energy_today(today):
    totals = DailyEnergyAggregate.objects.filter(date=today).aggregate(
        consumption=Sum('total_kwh'),
        demand=Max('peak_kw'),
    )
    consumption = totals['consumption'] or 0.0
    demand = totals['demand'] or 0.0
    if consumption == 0 or demand == 0:
        readings = EnergyReading.objects.filter(timestamp__date=today)
        reading_totals = readings.aggregate(
            consumption=Sum('kwh_consumed'),
            demand=Max('kw_demand'),
        )
        consumption = consumption or reading_totals['consumption'] or 0.0
        demand = demand or reading_totals['demand'] or 0.0
    return float(consumption), float(demand)


def _solar_assets():
    return list(SolarAsset.objects.filter(status='ONLINE').order_by('id'))


def _bess_assets():
    return list(BESSAsset.objects.order_by('id'))


def _bess_values(assets):
    capacity = sum(max(asset.capacity_kwh, 0.0) for asset in assets)
    charge = sum(
        min(max(asset.current_charge_kwh, 0.0), max(asset.capacity_kwh, 0.0))
        for asset in assets
    )
    soc = min(max(charge / capacity * 100.0, 0.0), 100.0) if capacity else 0.0
    discharge_kw = sum(
        max(asset.discharging_rate_kw, 0.0)
        for asset in assets
        if asset.status == 'DISCHARGING'
    )
    return capacity, charge, soc, discharge_kw


def renewable_summary():
    today = timezone.now().date()
    solar_assets = _solar_assets()
    bess_assets = _bess_assets()
    solar_kwh = sum(max(asset.daily_yield_kwh, 0.0) for asset in solar_assets)
    solar_kw = sum(max(asset.current_generation_kw, 0.0) for asset in solar_assets)
    solar_capacity_kw = sum(max(asset.capacity_kw, 0.0) for asset in solar_assets)
    campus_kwh, campus_demand_kw = _campus_energy_today(today)
    bess_capacity, bess_charge, bess_soc, bess_discharge_kw = _bess_values(bess_assets)

    total_energy_kwh = campus_kwh + solar_kwh
    renewable_share = solar_kwh / total_energy_kwh * 100.0 if total_energy_kwh else 0.0
    grid_export_kwh = max(solar_kwh - campus_kwh, 0.0)
    grid_import_kw = max(campus_demand_kw - solar_kw - bess_discharge_kw, 0.0)
    carbon_offset_kg = solar_kwh * DEMO_GRID_EMISSION_FACTOR_KG_CO2_PER_KWH
    clean_supply_pct = (
        min((solar_kw + bess_discharge_kw) / campus_demand_kw * 100.0, 100.0)
        if campus_demand_kw else 0.0
    )

    return {
        'total_solar_generated_kwh': round(solar_kwh, 1),
        'solar_trend': "Today's recorded asset yield",
        'renewable_share_pct': round(renewable_share, 1),
        'share_trend': 'of campus energy consumption',
        'bess_storage_capacity_kwh': round(bess_capacity, 1),
        'bess_current_charge_kwh': round(bess_charge, 1),
        'bess_soc_pct': round(bess_soc, 1),
        'grid_export_kwh': round(grid_export_kwh, 1),
        'grid_import_kw': round(grid_import_kw, 1),
        'grid_import_share_pct': round(
            grid_import_kw / campus_demand_kw * 100.0, 1
        ) if campus_demand_kw else 0.0,
        'campus_total_load_kw': round(campus_demand_kw, 1),
        'solar_current_generation_kw': round(solar_kw, 1),
        'solar_capacity_kw': round(solar_capacity_kw, 1),
        'bess_discharge_kw': round(bess_discharge_kw, 1),
        'clean_supply_pct': round(clean_supply_pct, 1),
        'carbon_offset_kg': round(carbon_offset_kg, 1),
        'co2_saved_tons': round(carbon_offset_kg / 1000.0, 3),
        'campus_consumption_kwh': round(campus_kwh, 1),
        'emission_factor_kg_co2_per_kwh': DEMO_GRID_EMISSION_FACTOR_KG_CO2_PER_KWH,
    }


def solar_generation_profile():
    assets = _solar_assets()
    daily_yield = sum(max(asset.daily_yield_kwh, 0.0) for asset in assets)
    capacity = sum(max(asset.capacity_kw, 0.0) for asset in assets)
    points = []
    for index, yield_share in enumerate(SOLAR_HOURLY_YIELD_SHARES):
        hour = index + 6
        solar_kw = daily_yield * yield_share
        irradiance = min(solar_kw / capacity * 1000.0, 1100.0) if capacity else 0.0
        points.append({
            'time': f'{hour:02d}:00',
            'solar_kw': round(solar_kw, 1),
            'irradiance': round(irradiance, 1),
        })
    return points


def grid_interaction_history():
    now = timezone.now()
    readings = EnergyReading.objects.filter(
        timestamp__gte=now - timedelta(hours=24),
        meter__status='ACTIVE',
    ).order_by('timestamp')
    demand_by_hour = defaultdict(float)
    for reading in readings:
        local_hour = timezone.localtime(reading.timestamp).replace(minute=0, second=0, microsecond=0)
        key = local_hour.strftime('%H:00')
        demand_by_hour[key] = max(demand_by_hour[key], reading.kw_demand)

    if not demand_by_hour:
        today = timezone.localdate()
        reading = EnergyReading.objects.filter(timestamp__date=today).order_by('-timestamp').first()
        if reading:
            demand_by_hour[timezone.localtime(reading.timestamp).strftime('%H:00')] = reading.kw_demand

    solar_profile = {
        point['time']: point['solar_kw']
        for point in solar_generation_profile()
    }
    solar_assets = _solar_assets()
    solar_capacity = sum(max(asset.capacity_kw, 0.0) for asset in solar_assets)
    solar_daily_yield = sum(max(asset.daily_yield_kwh, 0.0) for asset in solar_assets)
    bess_assets = _bess_assets()
    _, _, _, bess_discharge_limit = _bess_values(bess_assets)

    data = []
    for hour_label in sorted(demand_by_hour):
        demand_kw = max(demand_by_hour[hour_label], 0.0)
        hour = int(hour_label[:2])
        if 6 <= hour < 18:
            solar_kw = solar_profile.get(hour_label, 0.0)
            if not solar_kw and solar_capacity:
                solar_kw = min(solar_capacity, solar_daily_yield / 12.0)
        else:
            solar_kw = 0.0

        solar_self_use = min(solar_kw, demand_kw)
        bess_discharge = min(
            bess_discharge_limit,
            max(demand_kw - solar_self_use, 0.0),
        )
        grid_import = max(demand_kw - solar_self_use - bess_discharge, 0.0)
        data.append({
            'hour': hour_label,
            'grid_import': round(grid_import, 1),
            'solar_gen': round(solar_self_use, 1),
            'bess_discharge': round(bess_discharge, 1),
        })
    return data