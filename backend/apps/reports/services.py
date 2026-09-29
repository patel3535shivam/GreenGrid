from datetime import timedelta

import pandas as pd
from django.db.models import Avg, Count, Max, Sum
from django.utils import timezone

from apps.billing.models import UtilityBill
from apps.billing.services import active_tariff, calculate_bill
from apps.energy.models import DailyEnergyAggregate, EnergyReading
from apps.facilities.models import Facility, SmartMeter
from apps.renewable.models import SolarAsset

from .models import GeneratedReport


ENERGY_COLUMNS = [
    'timestamp', 'meter_id', 'facility_name', 'meter_type', 'kwh_consumed',
    'kw_demand', 'power_factor', 'voltage_avg', 'thd_voltage',
]
BILLING_COLUMNS = [
    'billing_period', 'facility_name', 'start_date', 'end_date', 'total_kwh',
    'energy_charges', 'fixed_charges', 'tax_amount', 'net_payable', 'status',
]


def _report_queryset(report_type, facility_id=None):
    if report_type == 'billing':
        queryset = UtilityBill.objects.filter(is_generated=True).select_related('facility')
        if facility_id:
            queryset = queryset.filter(facility_id=facility_id)
        return queryset.order_by('-start_date', 'facility__name')

    queryset = EnergyReading.objects.select_related('meter', 'meter__facility').all()
    if facility_id:
        queryset = queryset.filter(meter__facility_id=facility_id)
    return queryset.order_by('-timestamp')


def report_dataframe(report_type, facility_id=None):
    queryset = _report_queryset(report_type, facility_id)
    if report_type == 'billing':
        if facility_id:
            today = timezone.localdate()
            calculated = calculate_bill(today.replace(day=1), today, active_tariff())
            facility_bill = next(
                (row for row in calculated['facility_breakdown'] if row['id'] == facility_id),
                None,
            )
            if facility_bill is None:
                return pd.DataFrame(columns=BILLING_COLUMNS)
            facility = Facility.objects.get(pk=facility_id)
            return pd.DataFrame([{
                'billing_period': today.strftime('%B %Y'),
                'facility_name': facility.name,
                'start_date': today.replace(day=1),
                'end_date': today,
                'total_kwh': facility_bill['consumption_kwh'],
                'energy_charges': facility_bill['energy_charges'],
                'fixed_charges': facility_bill['fixed_charges'],
                'tax_amount': facility_bill['tax'],
                'net_payable': facility_bill['total_bill'],
                'status': 'DUE',
            }], columns=BILLING_COLUMNS)
        rows = queryset.values(
            'billing_period', 'facility__name', 'start_date', 'end_date', 'total_kwh',
            'energy_charges', 'fixed_charges', 'tax_amount', 'net_payable', 'status',
        )
        dataframe = pd.DataFrame(list(rows))
        if dataframe.empty:
            dataframe = pd.DataFrame(columns=BILLING_COLUMNS)
        else:
            dataframe.rename(columns={'facility__name': 'facility_name'}, inplace=True)
        return dataframe[BILLING_COLUMNS]

    rows = queryset.values(
        'timestamp', 'meter__meter_id', 'meter__facility__name', 'meter__meter_type',
        'kwh_consumed', 'kw_demand', 'power_factor', 'voltage_avg', 'thd_voltage',
    )
    dataframe = pd.DataFrame(list(rows))
    if dataframe.empty:
        return pd.DataFrame(columns=ENERGY_COLUMNS)
    dataframe.rename(columns={
        'meter__meter_id': 'meter_id',
        'meter__facility__name': 'facility_name',
        'meter__meter_type': 'meter_type',
    }, inplace=True)
    return dataframe[ENERGY_COLUMNS]


def report_preview(report_type='energy', facility_id=None):
    today = timezone.localdate()
    aggregates = DailyEnergyAggregate.objects.filter(date=today)
    readings = EnergyReading.objects.filter(timestamp__date=today)
    solar_assets = SolarAsset.objects.filter(status='ONLINE')
    facilities = Facility.objects.all()
    if facility_id:
        aggregates = aggregates.filter(meter__facility_id=facility_id)
        readings = readings.filter(meter__facility_id=facility_id)
        solar_assets = solar_assets.filter(facility_id=facility_id)
        facilities = facilities.filter(pk=facility_id)

    aggregate_metrics = aggregates.aggregate(
        consumption=Sum('total_kwh'),
        peak=Max('peak_kw'),
    )
    reading_metrics = readings.aggregate(
        consumption=Sum('kwh_consumed'),
        peak=Max('kw_demand'),
        power_factor=Avg('power_factor'),
        rows=Count('id'),
    )
    consumption = aggregate_metrics['consumption']
    if consumption is None:
        consumption = reading_metrics['consumption'] or 0.0
    peak_demand = aggregate_metrics['peak'] or reading_metrics['peak'] or 0.0

    solar_yield = solar_assets.aggregate(total=Sum('daily_yield_kwh'))['total'] or 0.0
    average_power_factor = reading_metrics['power_factor'] or 0.0
    telemetry_rows = reading_metrics['rows'] or 0
    facility_name = facilities.first().name if facility_id else 'Campus Wide'

    current_bill = UtilityBill.objects.filter(
        is_generated=True,
        facility__isnull=True,
        start_date__year=today.year,
        start_date__month=today.month,
    ).order_by('-created_at').first()
    if facility_id:
        month_start = today.replace(day=1)
        calculated = calculate_bill(month_start, today, active_tariff())
        selected = next(
            (row for row in calculated['facility_breakdown'] if row['id'] == facility_id),
            None,
        )
        billed_cost = selected['total_bill'] if selected else 0.0
    elif current_bill:
        billed_cost = current_bill.net_payable
    else:
        billed_cost = 0.0

    active_meters = SmartMeter.objects.filter(status='ACTIVE')
    if facility_id:
        active_meters = active_meters.filter(facility_id=facility_id)
    active_meter_count = active_meters.count()
    reported_meter_count = readings.values('meter_id').distinct().count()
    audit_compliance = (
        min(reported_meter_count / active_meter_count * 100.0, 100.0)
        if active_meter_count else 0.0
    )

    return {
        'report_type': report_type,
        'facility_name': facility_name,
        'consumption_kwh': round(float(consumption), 1),
        'billed_cost': round(float(billed_cost), 2),
        'peak_demand_kw': round(float(peak_demand), 1),
        'solar_yield_kwh': round(float(solar_yield), 1),
        'average_power_factor': round(float(average_power_factor), 3),
        'telemetry_rows': telemetry_rows,
        'telemetry_reporting_meters': reported_meter_count,
        'active_meters': active_meter_count,
        'audit_compliance_pct': round(audit_compliance, 1),
        'compiled_at': timezone.now(),
    }


def report_summary():
    now = timezone.localtime()
    quarter_month = ((now.month - 1) // 3) * 3 + 1
    quarter_start = now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
    reports = GeneratedReport.objects.all()
    meters = SmartMeter.objects.filter(status='ACTIVE')
    reporting_meters = EnergyReading.objects.filter(
        timestamp__date=timezone.localdate(),
        meter__in=meters,
    ).values('meter_id').distinct().count()
    active_meter_count = meters.count()
    return {
        'total_reports_generated': reports.count(),
        'automated_dispatch': 0,
        'audit_compliance_pct': round(
            min(reporting_meters / active_meter_count * 100.0, 100.0)
            if active_meter_count else 0.0,
            1,
        ),
        'total_export_bytes': reports.aggregate(total=Sum('file_size_bytes'))['total'] or 0,
        'rows_exported_quarter': reports.filter(created_at__gte=quarter_start).aggregate(
            total=Sum('row_count')
        )['total'] or 0,
        'telemetry_reporting_meters': reporting_meters,
        'active_meters': active_meter_count,
    }


def facility_report_rows(facility_id=None):
    today = timezone.localdate()
    month_start = today.replace(day=1)
    calculated = calculate_bill(month_start, today, active_tariff())
    billing_by_facility = {
        row['id']: row['total_bill'] for row in calculated['facility_breakdown']
    }
    output = []
    facilities = Facility.objects.order_by('name')
    if facility_id:
        facilities = facilities.filter(pk=facility_id)
    for facility in facilities:
        aggregates = DailyEnergyAggregate.objects.filter(
            meter__facility=facility,
            date=today,
        ).aggregate(
            consumption=Sum('total_kwh'),
            peak=Max('peak_kw'),
            average_power_factor=Avg('avg_power_factor'),
        )
        output.append({
            'id': facility.id,
            'facility_name': facility.name,
            'facility_type': facility.facility_type,
            'consumption_kwh': round(aggregates['consumption'] or 0.0, 1),
            'peak_demand_kw': round(aggregates['peak'] or 0.0, 1),
            'average_power_factor': round(aggregates['average_power_factor'] or 0.0, 3),
            'billed_cost': round(billing_by_facility.get(facility.id, 0.0), 2),
        })
    return output