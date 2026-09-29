from datetime import datetime, time, timedelta, timezone as datetime_timezone

import numpy as np
import pandas as pd
from django.db.models import Avg, Max, Q, Sum
from django.utils import timezone

from apps.billing.models import UtilityBill
from apps.billing.services import active_tariff, energy_charge
from apps.energy.models import DailyEnergyAggregate, EnergyReading
from apps.facilities.models import Facility, SmartMeter
from apps.renewable.models import SolarAsset


RANGE_LABELS = [
    {'value': 'today', 'label': 'Today'},
    {'value': '7d', 'label': '7 Days'},
    {'value': '30d', 'label': '30 Days'},
    {'value': '90d', 'label': '90 Days'},
    {'value': 'custom', 'label': 'Custom'},
]


def resolve_filters(validated_data):
    today = timezone.now().date()
    selected_range = validated_data.get('range', '7d')
    if selected_range == 'custom':
        start_date = validated_data['start_date']
        end_date = validated_data['end_date']
    else:
        number_of_days = {'today': 1, '7d': 7, '30d': 30, '90d': 90}[selected_range]
        start_date = today - timedelta(days=number_of_days - 1)
        end_date = today
    return {
        'range': selected_range,
        'start_date': start_date,
        'end_date': end_date,
        'facility_id': validated_data.get('facility_id'),
    }


def analytics_filters():
    return {
        'facilities': [
            {'id': facility.id, 'name': facility.name}
            for facility in Facility.objects.order_by('name')
        ],
        'ranges': RANGE_LABELS,
    }


def _aggregate_queryset(filters):
    queryset = DailyEnergyAggregate.objects.filter(
        date__range=(filters['start_date'], filters['end_date'])
    )
    if filters['facility_id']:
        queryset = queryset.filter(meter__facility_id=filters['facility_id'])
    return _primary_meter_queryset(queryset, filters)


def _reading_queryset(filters):
    range_start = datetime.combine(filters['start_date'], time.min, tzinfo=datetime_timezone.utc)
    range_end = datetime.combine(filters['end_date'] + timedelta(days=1), time.min, tzinfo=datetime_timezone.utc)
    queryset = EnergyReading.objects.filter(timestamp__gte=range_start, timestamp__lt=range_end)
    if filters['facility_id']:
        queryset = queryset.filter(meter__facility_id=filters['facility_id'])
    return _primary_meter_queryset(queryset, filters)


def _primary_meter_queryset(queryset, filters):
    primary_facilities = SmartMeter.objects.filter(
        meter_type='MAIN'
    ).values('facility_id')
    if filters['facility_id']:
        has_primary_meter = SmartMeter.objects.filter(
            facility_id=filters['facility_id'],
            meter_type='MAIN',
        ).exists()
        if has_primary_meter:
            return queryset.filter(meter__meter_type='MAIN')
        return queryset
    if primary_facilities.exists():
        return queryset.filter(
            Q(meter__meter_type='MAIN') | ~Q(meter__facility_id__in=primary_facilities)
        )
    return queryset


def _daily_frame(filters):
    rows = list(_aggregate_queryset(filters).values('date').annotate(
        consumption_kwh=Sum('total_kwh'),
        peak_demand_kw=Max('peak_kw'),
        average_power_factor=Avg('avg_power_factor'),
    ).order_by('date'))
    dataframe = pd.DataFrame(rows)

    if dataframe.empty:
        readings = _reading_queryset(filters)
        fallback_rows = list(readings.values('timestamp', 'kwh_consumed', 'kw_demand', 'power_factor'))
        if fallback_rows:
            fallback = pd.DataFrame(fallback_rows)
            fallback['date'] = pd.to_datetime(fallback['timestamp'], utc=True).dt.date
            dataframe = fallback.groupby('date', as_index=False).agg(
                consumption_kwh=('kwh_consumed', 'sum'),
                peak_demand_kw=('kw_demand', 'max'),
                average_power_factor=('power_factor', 'mean'),
            )
        else:
            return pd.DataFrame(columns=[
                'date', 'consumption_kwh', 'peak_demand_kw', 'average_power_factor'
            ])

    dataframe['consumption_kwh'] = dataframe['consumption_kwh'].fillna(0.0).astype(float)
    dataframe['peak_demand_kw'] = dataframe['peak_demand_kw'].fillna(0.0).astype(float)
    dataframe['average_power_factor'] = dataframe['average_power_factor'].fillna(0.96).astype(float)
    return dataframe.sort_values('date').reset_index(drop=True)


def _daily_peak_consumption(filters):
    aggs = list(_aggregate_queryset(filters).values('date', 'on_peak_kwh'))
    if aggs and any(a['on_peak_kwh'] for a in aggs):
        return {a['date']: float(a['on_peak_kwh']) for a in aggs}
    readings = _reading_queryset(filters).filter(
        timestamp__hour__gte=13,
        timestamp__hour__lt=17,
    ).values('timestamp', 'kwh_consumed')
    dataframe = pd.DataFrame(list(readings))
    if dataframe.empty:
        return {}
    dataframe['date'] = pd.to_datetime(dataframe['timestamp']).dt.date
    return dataframe.groupby('date')['kwh_consumed'].sum().to_dict()


def _daily_cost_frame(daily_frame, filters):
    if daily_frame.empty:
        return pd.DataFrame(columns=['date', 'energy_cost', 'estimated_total_cost'])
    peak_usage = _daily_peak_consumption(filters)
    tariff = active_tariff()
    costs = []
    for row in daily_frame.itertuples(index=False):
        amount = energy_charge(
            float(row.consumption_kwh),
            float(peak_usage.get(row.date, 0.0)),
            tariff,
        )
        costs.append(amount)
    output = pd.DataFrame({
        'date': daily_frame['date'],
        'energy_cost': costs,
        'estimated_total_cost': costs,
    })

    return output


def _renewable_observations(filters, daily_frame):
    today = timezone.now().date()
    solar_assets = SolarAsset.objects.filter(status='ONLINE')
    if filters['facility_id']:
        solar_assets = solar_assets.filter(facility_id=filters['facility_id'])
    yield_today = solar_assets.aggregate(total=Sum('daily_yield_kwh'))['total'] or 0.0
    if yield_today and filters['start_date'] <= today <= filters['end_date']:
        solar = pd.DataFrame([{'date': today, 'solar_generation_kwh': float(yield_today)}])
    else:
        solar = pd.DataFrame(columns=['date', 'solar_generation_kwh'])

    if solar.empty:
        return []
    consumption = daily_frame[['date', 'consumption_kwh']]
    solar = solar.merge(consumption, on='date', how='left')
    solar['consumption_kwh'] = solar['consumption_kwh'].fillna(0.0)
    denominator = solar['consumption_kwh'] + solar['solar_generation_kwh']
    solar['renewable_share_pct'] = np.where(
        denominator > 0,
        solar['solar_generation_kwh'] / denominator * 100.0,
        0.0,
    )
    return [{
        'date': row.date,
        'solar_generation_kwh': round(float(row.solar_generation_kwh), 1),
        'consumption_kwh': round(float(row.consumption_kwh), 1),
        'renewable_share_pct': round(float(row.renewable_share_pct), 1),
    } for row in solar.itertuples(index=False)]


def analytics_summary(filters, daily_frame=None, cost_frame=None, renewable_points=None):
    daily = daily_frame if daily_frame is not None else _daily_frame(filters)
    total_consumption = float(daily['consumption_kwh'].sum()) if not daily.empty else 0.0
    peak_demand = float(daily['peak_demand_kw'].max()) if not daily.empty else 0.0
    average_demand = float(daily['peak_demand_kw'].mean() * 0.45) if not daily.empty else 0.0
    average_pf = float(daily['average_power_factor'].mean()) if not daily.empty else 0.96
    
    area = Facility.objects.filter(pk=filters['facility_id']).values_list('area_sqft', flat=True).first() if filters['facility_id'] else Facility.objects.aggregate(total=Sum('area_sqft'))['total']
    energy_intensity = total_consumption / area if area else 0.0
    load_factor = min(average_demand / peak_demand * 100.0, 100.0) if peak_demand else 0.0
    renewable = renewable_points if renewable_points is not None else _renewable_observations(filters, daily)
    renewable_total = sum(point['solar_generation_kwh'] for point in renewable)
    renewable_share = renewable_total / (renewable_total + total_consumption) * 100.0 if total_consumption + renewable_total else 0.0
    cost = cost_frame if cost_frame is not None else _daily_cost_frame(daily, filters)
    total_cost = float(cost['estimated_total_cost'].sum()) if not cost.empty else 0.0
    exact_bill = UtilityBill.objects.filter(
        is_generated=True,
        facility__isnull=True,
        start_date=filters['start_date'],
        end_date=filters['end_date'],
    ).order_by('-created_at').first() if filters['facility_id'] is None else None
    if exact_bill:
        total_cost = float(exact_bill.net_payable)

    return {
        'start_date': filters['start_date'],
        'end_date': filters['end_date'],
        'total_consumption_kwh': round(total_consumption, 1),
        'peak_demand_kw': round(peak_demand, 1),
        'average_power_factor': round(average_pf, 3),
        'estimated_energy_cost': round(total_cost, 2),
        'renewable_generation_kwh': round(renewable_total, 1),
        'renewable_share_pct': round(renewable_share, 1),
        'energy_intensity_kwh_per_sqft': round(energy_intensity, 3),
        'load_factor_pct': round(load_factor, 1),
        'reporting_days': int(daily['date'].nunique()) if not daily.empty else 0,
    }


def consumption_trend(filters, daily_frame=None):
    dataframe = daily_frame if daily_frame is not None else _daily_frame(filters)
    return [{
        'date': row.date,
        'consumption_kwh': round(float(row.consumption_kwh), 1),
        'peak_demand_kw': round(float(row.peak_demand_kw), 1),
        'average_power_factor': round(float(row.average_power_factor), 3) if pd.notna(row.average_power_factor) else 0.0,
    } for row in dataframe.itertuples(index=False)]


def facility_comparison(filters):
    queryset = _aggregate_queryset(filters).values(
        'meter__facility_id', 'meter__facility__name', 'meter__facility__area_sqft'
    ).annotate(
        consumption_kwh=Sum('total_kwh'),
        peak_demand_kw=Max('peak_kw'),
        average_power_factor=Avg('avg_power_factor'),
    )
    dataframe = pd.DataFrame(list(queryset))
    if dataframe.empty:
        return []
    total = float(dataframe['consumption_kwh'].sum())
    dataframe['share_pct'] = np.where(total > 0, dataframe['consumption_kwh'] / total * 100.0, 0.0)
    dataframe['energy_intensity_kwh_per_sqft'] = np.where(
        dataframe['meter__facility__area_sqft'] > 0,
        dataframe['consumption_kwh'] / dataframe['meter__facility__area_sqft'],
        0.0,
    )
    dataframe = dataframe.groupby([
        'meter__facility_id', 'meter__facility__name', 'meter__facility__area_sqft'
    ], as_index=False).agg(
        consumption_kwh=('consumption_kwh', 'sum'),
        peak_demand_kw=('peak_demand_kw', 'max'),
        average_power_factor=('average_power_factor', 'mean'),
        share_pct=('share_pct', 'sum'),
        energy_intensity_kwh_per_sqft=('energy_intensity_kwh_per_sqft', 'mean'),
    )
    return [{
        'facility_id': int(row['meter__facility_id']),
        'facility_name': row['meter__facility__name'],
        'consumption_kwh': round(float(row['consumption_kwh']), 1),
        'share_pct': round(float(row['share_pct']), 1),
        'peak_demand_kw': round(float(row['peak_demand_kw']), 1),
        'average_power_factor': round(float(row['average_power_factor'] or 0.0), 3),
        'energy_intensity_kwh_per_sqft': round(float(row['energy_intensity_kwh_per_sqft']), 3),
    } for _, row in dataframe.sort_values('consumption_kwh', ascending=False).iterrows()]


def peak_demand_analysis(filters):
    rows = list(_reading_queryset(filters).select_related('meter__facility').values(
        'timestamp', 'kw_demand', 'meter__facility__name'
    ).order_by('timestamp'))
    if not rows:
        return []
    dataframe = pd.DataFrame(rows)
    dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], utc=True).dt.tz_convert('Asia/Kolkata')
    coincident = dataframe.groupby('timestamp', as_index=False).agg(
        demand_kw=('kw_demand', 'sum'),
        facility_name=('meter__facility__name', 'first'),
    )
    coincident['hour'] = coincident['timestamp'].dt.floor('h')
    hourly = coincident.groupby('hour', as_index=False).agg(
        demand_kw=('demand_kw', 'max'),
        average_demand_kw=('demand_kw', 'mean'),
        facility_name=('facility_name', 'first'),
    )
    return [{
        'time': row.hour,
        'demand_kw': round(float(row.demand_kw), 1),
        'average_demand_kw': round(float(row.average_demand_kw), 1),
        'facility_name': row.facility_name,
    } for row in hourly.itertuples(index=False)]


def power_factor_analysis(filters, daily_frame=None):
    dataframe = daily_frame if daily_frame is not None else _daily_frame(filters)
    if dataframe.empty:
        return []
    return [{
        'date': row.date,
        'average_power_factor': round(float(row.average_power_factor), 3),
    } for row in dataframe.itertuples(index=False)]


def cost_analysis(filters, daily_frame=None, cost_frame=None):
    daily = daily_frame if daily_frame is not None else _daily_frame(filters)
    cost = cost_frame if cost_frame is not None else _daily_cost_frame(daily, filters)
    merged = daily[['date', 'consumption_kwh']].merge(cost, on='date', how='left') if not daily.empty else pd.DataFrame()
    if merged.empty:
        return []
    return [{
        'date': row.date,
        'consumption_kwh': round(float(row.consumption_kwh), 1),
        'energy_cost': round(float(row.energy_cost), 2),
        'estimated_total_cost': round(float(row.estimated_total_cost), 2),
    } for row in merged.itertuples(index=False)]


def renewable_contribution(filters, daily_frame=None, renewable_points=None):
    if renewable_points is not None:
        return renewable_points
    daily = daily_frame if daily_frame is not None else _daily_frame(filters)
    return _renewable_observations(filters, daily)


def efficiency_indicators(filters, summary=None, comparison=None):
    summary = summary if summary is not None else analytics_summary(filters)
    active_meters = SmartMeter.objects.filter(status='ACTIVE')
    if filters['facility_id']:
        active_meters = active_meters.filter(facility_id=filters['facility_id'])
    active_meter_count = active_meters.count()
    consumption_per_meter = summary['total_consumption_kwh'] / active_meter_count if active_meter_count else 0.0

    insights = []
    if summary['average_power_factor'] and summary['average_power_factor'] < 0.95:
        insights.append('Average power factor is below the 0.95 operating target.')
    if summary['energy_intensity_kwh_per_sqft'] > 0:
        comparison = comparison if comparison is not None else facility_comparison(filters)
        if comparison:
            highest = max(comparison, key=lambda item: item['energy_intensity_kwh_per_sqft'])
            insights.append(
                f"{highest['facility_name']} has the highest measured energy intensity at "
                f"{highest['energy_intensity_kwh_per_sqft']:.3f} kWh/sq ft."
            )
    if not insights:
        insights.append('No efficiency indicators are outside the available telemetry thresholds.')

    return {
        'energy_intensity_kwh_per_sqft': summary['energy_intensity_kwh_per_sqft'],
        'load_factor_pct': summary['load_factor_pct'],
        'average_power_factor': summary['average_power_factor'],
        'consumption_per_active_meter_kwh': round(consumption_per_meter, 1),
        'insights': insights,
    }


def analytics_dashboard(filters):
    daily = _daily_frame(filters)
    costs = _daily_cost_frame(daily, filters)
    renewable = _renewable_observations(filters, daily)
    facilities = facility_comparison(filters)
    summary = analytics_summary(
        filters,
        daily_frame=daily,
        cost_frame=costs,
        renewable_points=renewable,
    )
    return {
        'summary': summary,
        'consumption': consumption_trend(filters, daily),
        'facilities': facilities,
        'peak_demand': peak_demand_analysis(filters),
        'power_factor': power_factor_analysis(filters, daily),
        'cost': cost_analysis(filters, daily, costs),
        'renewable': renewable_contribution(filters, daily, renewable),
        'efficiency': efficiency_indicators(filters, summary, facilities),
    }