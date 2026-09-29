from django.db.models import Sum

from .models import TariffConfig
from apps.energy.models import DailyEnergyAggregate, EnergyReading
from apps.facilities.models import Facility, SmartMeter


def active_tariff():
    tariff = TariffConfig.objects.filter(is_active=True).first()
    if tariff is None:
        tariff = TariffConfig.objects.create()
    return tariff


def _meter_usage(facility, start_date, end_date):
    meters = SmartMeter.objects.filter(facility=facility).exclude(meter_type='SOLAR')
    main_meters = meters.filter(meter_type='MAIN')
    if main_meters.exists():
        meters = main_meters

    aggregates = DailyEnergyAggregate.objects.filter(
        meter__in=meters,
        date__range=(start_date, end_date),
    )
    aggregate_values = aggregates.aggregate(
        total=Sum('total_kwh'),
        peak=Sum('on_peak_kwh'),
    )
    total_kwh = aggregate_values['total']
    readings = EnergyReading.objects.filter(
        meter__in=meters,
        timestamp__date__range=(start_date, end_date),
    )
    if total_kwh is None:
        total_kwh = readings.aggregate(total=Sum('kwh_consumed'))['total'] or 0.0

    peak_kwh = aggregate_values['peak'] or 0.0
    if peak_kwh <= 0:
        peak_kwh = readings.filter(
            timestamp__hour__gte=13,
            timestamp__hour__lt=17,
        ).aggregate(total=Sum('kwh_consumed'))['total'] or 0.0

    days_with_data = aggregates.values('date').distinct().count()
    if days_with_data == 0:
        days_with_data = readings.datetimes('timestamp', 'day').count()

    return {
        'total_kwh': max(0.0, float(total_kwh)),
        'peak_kwh': min(max(0.0, float(peak_kwh)), max(0.0, float(total_kwh))),
        'days_with_data': days_with_data,
    }


def _solar_credit_kwh(start_date, end_date):
    solar_meters = SmartMeter.objects.filter(meter_type='SOLAR')
    aggregates = DailyEnergyAggregate.objects.filter(
        meter__in=solar_meters,
        date__range=(start_date, end_date),
    )
    total = aggregates.aggregate(total=Sum('total_kwh'))['total']
    if total is None:
        total = EnergyReading.objects.filter(
            meter__in=solar_meters,
            timestamp__date__range=(start_date, end_date),
        ).aggregate(total=Sum('kwh_consumed'))['total'] or 0.0
    return max(0.0, float(total))


def _tiered_charge(kwh, tariff):
    first_slab = min(kwh, 100.0)
    second_slab = min(max(kwh - 100.0, 0.0), 400.0)
    third_slab = max(kwh - 500.0, 0.0)
    return (
        first_slab * tariff.tier1_rate
        + second_slab * tariff.tier2_rate
        + third_slab * tariff.tier3_rate
    )


def energy_charge(kwh, peak_kwh, tariff):
    peak_kwh = min(max(peak_kwh, 0.0), max(kwh, 0.0))
    off_peak_kwh = max(kwh - peak_kwh, 0.0)
    return round(
        _tiered_charge(off_peak_kwh, tariff)
        + peak_kwh * tariff.peak_surcharge_rate,
        2,
    )


def calculate_bill(start_date, end_date, tariff):
    facility_usage = []
    for facility in Facility.objects.all():
        usage = _meter_usage(facility, start_date, end_date)
        facility_usage.append({
            'id': facility.id,
            'facility_name': facility.name,
            **usage,
        })

    total_kwh = sum(item['total_kwh'] for item in facility_usage)
    peak_kwh = sum(item['peak_kwh'] for item in facility_usage)
    energy_charges = energy_charge(total_kwh, peak_kwh, tariff)
    fixed_charges = round(tariff.fixed_charge_monthly, 2)
    solar_kwh = _solar_credit_kwh(start_date, end_date)
    renewable_credit = min(
        round(solar_kwh * tariff.solar_credit_rate, 2),
        energy_charges,
    )
    tax_amount = round(
        (energy_charges + fixed_charges) * tariff.tax_percentage / 100.0,
        2,
    )
    net_payable = round(
        energy_charges + fixed_charges + tax_amount - renewable_credit,
        2,
    )

    raw_charges = [
        energy_charge(item['total_kwh'], item['peak_kwh'], tariff)
        for item in facility_usage
    ]
    weights = raw_charges if sum(raw_charges) else [item['total_kwh'] for item in facility_usage]
    total_weight = sum(weights)
    facility_count = len(facility_usage)
    fixed_per_facility = round(fixed_charges / facility_count, 2) if facility_count else 0.0
    allocated_energy = []
    for index, weight in enumerate(weights):
        if index == len(weights) - 1:
            amount = round(energy_charges - sum(allocated_energy), 2)
        elif total_weight:
            amount = round(energy_charges * weight / total_weight, 2)
        else:
            amount = 0.0
        allocated_energy.append(amount)

    breakdown = []
    for index, item in enumerate(facility_usage):
        facility_fixed = fixed_per_facility
        if index == len(facility_usage) - 1:
            facility_fixed = round(fixed_charges - fixed_per_facility * index, 2)
        facility_energy = allocated_energy[index]
        facility_tax = round(
            (facility_energy + facility_fixed) * tariff.tax_percentage / 100.0,
            2,
        )
        breakdown.append({
            'id': item['id'],
            'facility_name': item['facility_name'],
            'consumption_kwh': round(item['total_kwh'], 2),
            'energy_charges': facility_energy,
            'fixed_charges': facility_fixed,
            'tax': facility_tax,
            'total_bill': round(facility_energy + facility_fixed + facility_tax, 2),
            'status': 'Due' if item['id'] % 3 == 0 else 'Paid',
            '_raw_energy_charge': raw_charges[index],
        })

    breakdown.sort(key=lambda item: item['total_bill'], reverse=True)
    for item in breakdown:
        item.pop('_raw_energy_charge')

    return {
        'total_consumption_kwh': round(total_kwh, 2),
        'peak_consumption_kwh': round(peak_kwh, 2),
        'days_with_data': max((item['days_with_data'] for item in facility_usage), default=0),
        'energy_charges': energy_charges,
        'fixed_charges': fixed_charges,
        'tax_amount': tax_amount,
        'renewable_credit': renewable_credit,
        'net_payable': net_payable,
        'avg_cost_per_unit': round(net_payable / total_kwh, 2) if total_kwh else 0.0,
        'facility_breakdown': breakdown,
    }