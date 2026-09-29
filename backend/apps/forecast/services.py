from datetime import timedelta

import numpy as np
import pandas as pd
from django.db.models import Max, Sum
from django.utils import timezone
from sklearn.linear_model import LinearRegression

from apps.energy.models import DailyEnergyAggregate, EnergyReading
from apps.facilities.models import Facility, SmartMeter


HORIZONS = [
    {'value': 1, 'label': '1 Day'},
    {'value': 3, 'label': '3 Days'},
    {'value': 7, 'label': '7 Days'},
    {'value': 14, 'label': '14 Days'},
]
HISTORY_DAYS = 90


def forecast_filters():
    return {
        'facilities': [
            {'id': facility.id, 'name': facility.name}
            for facility in Facility.objects.order_by('name')
        ],
        'horizons': HORIZONS,
    }


def _primary_meters(facility_id=None):
    meters = SmartMeter.objects.filter(status='ACTIVE')
    if facility_id:
        meters = meters.filter(facility_id=facility_id)

    main_facilities = SmartMeter.objects.filter(
        status='ACTIVE',
        meter_type='MAIN',
    ).values('facility_id')
    if facility_id:
        if meters.filter(meter_type='MAIN').exists():
            return meters.filter(meter_type='MAIN')
        return meters
    if main_facilities.exists():
        return meters.filter(
            models_q_main_or_without_main(main_facilities)
        )
    return meters


def models_q_main_or_without_main(main_facilities):
    from django.db.models import Q

    return Q(meter_type='MAIN') | (~Q(facility_id__in=main_facilities))


def _history_frame(facility_id=None):
    today = timezone.now().date()
    start_date = today - timedelta(days=HISTORY_DAYS - 1)
    meters = _primary_meters(facility_id)
    aggregates = list(DailyEnergyAggregate.objects.filter(
        meter__in=meters,
        date__range=(start_date, today),
    ).values('date').annotate(
        consumption_kwh=Sum('total_kwh'),
        peak_kw=Max('peak_kw'),
    ).order_by('date'))
    
    dataframe = pd.DataFrame(aggregates)
    
    # Only query raw EnergyReading if daily aggregates are missing or empty
    if dataframe.empty:
        readings = EnergyReading.objects.filter(
            meter__in=meters,
            timestamp__date__range=(start_date, today),
        ).values('timestamp', 'kwh_consumed', 'kw_demand')
        reading_rows = list(readings)
        if reading_rows:
            reading_frame = pd.DataFrame(reading_rows)
            reading_frame['timestamp'] = pd.to_datetime(reading_frame['timestamp'], utc=True)
            reading_frame['date'] = reading_frame['timestamp'].dt.date
            daily_peaks = reading_frame.groupby(['date', 'timestamp'], as_index=False).agg(
                coincident_demand_kw=('kw_demand', 'sum'),
            ).groupby('date', as_index=False).agg(
                coincident_peak_kw=('coincident_demand_kw', 'max'),
            )
            reading_daily = reading_frame.groupby('date', as_index=False).agg(
                reading_consumption_kwh=('kwh_consumed', 'sum'),
            )
            readings_daily = reading_daily.merge(daily_peaks, on='date', how='left')
            dataframe = readings_daily.rename(columns={'reading_consumption_kwh': 'consumption_kwh', 'coincident_peak_kw': 'peak_kw'})

    if dataframe.empty:
        return pd.DataFrame(columns=['date', 'consumption_kwh', 'peak_demand_kw'])
    
    dataframe['consumption_kwh'] = dataframe['consumption_kwh'].fillna(0.0)
    dataframe['peak_demand_kw'] = dataframe['peak_kw'].fillna(0.0)
    return dataframe[['date', 'consumption_kwh', 'peak_demand_kw']].sort_values('date').reset_index(drop=True)


def _forecast_values(values, horizon_days):
    numeric = np.asarray(values, dtype=float)
    numeric = numeric[np.isfinite(numeric) & (numeric >= 0)]
    if not len(numeric):
        return [], 'Insufficient history', 0.0, 0.0

    recent = numeric[-14:]
    center = float(np.median(recent))
    deviations = np.abs(recent - center)
    robust_scale = float(np.median(deviations) * 1.4826) if len(recent) > 1 else 0.0
    robust_scale = max(robust_scale, center * 0.1, 0.01)
    model_name = 'Robust recent-median baseline'

    if len(numeric) >= 7:
        x = np.arange(len(numeric), dtype=float).reshape(-1, 1)
        estimator = LinearRegression()
        estimator.fit(x, numeric)
        all_predictions = estimator.predict(x)
        residual_scale = float(np.sqrt(np.mean((numeric - all_predictions) ** 2)))
        recent_center = float(np.median(recent))
        slope = float(estimator.coef_[0])
        damped_slope = np.clip(slope, -recent_center * 0.05, recent_center * 0.05)
        base = recent_center
        lead_values = [max(base + damped_slope * step, 0.0) for step in range(1, horizon_days + 1)]
        robust_scale = max(robust_scale, residual_scale, recent_center * 0.05)
        model_name = 'Damped linear trend (Scikit-learn)'
    else:
        lead_values = [center] * horizon_days

    confidence_pct = min(90.0, 50.0 + len(numeric) * 5.0)
    intervals = []
    for step, point in enumerate(lead_values, start=1):
        margin = 1.28 * robust_scale * np.sqrt(1.0 + step / max(len(recent), 1))
        intervals.append({
            'value': round(float(point), 1),
            'lower': round(float(max(point - margin, 0.0)), 1),
            'upper': round(float(point + margin), 1),
        })
    return intervals, model_name, confidence_pct, robust_scale


def build_forecast(facility_id=None, horizon_days=7):
    history = _history_frame(facility_id)
    consumption_forecast, model_name, confidence_pct, consumption_scale = _forecast_values(
        history['consumption_kwh'].to_numpy() if not history.empty else [],
        horizon_days,
    )
    peak_forecast, _, _, peak_scale = _forecast_values(
        history['peak_demand_kw'].to_numpy() if not history.empty else [],
        horizon_days,
    )
    today = timezone.now().date()
    history_points = [{
        'date': row.date,
        'actual_kwh': round(float(row.consumption_kwh), 1),
        'forecast_kwh': None,
        'lower_kwh': None,
        'upper_kwh': None,
        'actual_peak_kw': round(float(row.peak_demand_kw), 1),
        'predicted_peak_kw': None,
        'peak_lower_kw': None,
        'peak_upper_kw': None,
        'kind': 'history',
    } for row in history.itertuples(index=False)]

    forecast_points = []
    for index in range(horizon_days):
        forecast_date = today + timedelta(days=index + 1)
        forecast_points.append({
            'date': forecast_date,
            'actual_kwh': None,
            'forecast_kwh': consumption_forecast[index]['value'] if consumption_forecast else 0.0,
            'lower_kwh': consumption_forecast[index]['lower'] if consumption_forecast else 0.0,
            'upper_kwh': consumption_forecast[index]['upper'] if consumption_forecast else 0.0,
            'actual_peak_kw': None,
            'predicted_peak_kw': peak_forecast[index]['value'] if peak_forecast else 0.0,
            'peak_lower_kw': peak_forecast[index]['lower'] if peak_forecast else 0.0,
            'peak_upper_kw': peak_forecast[index]['upper'] if peak_forecast else 0.0,
            'kind': 'forecast',
        })

    energy_total = sum(point['value'] for point in consumption_forecast)
    peak_total = max((point['value'] for point in peak_forecast), default=0.0)
    lower_total = sum(point['lower'] for point in consumption_forecast)
    upper_total = sum(point['upper'] for point in consumption_forecast)
    peak_lower = min((point['lower'] for point in peak_forecast), default=0.0)
    peak_upper = max((point['upper'] for point in peak_forecast), default=0.0)
    facility = Facility.objects.filter(pk=facility_id).first() if facility_id else None

    return {
        'facility_name': facility.name if facility else 'Campus Wide',
        'horizon_days': horizon_days,
        'forecast_energy_kwh': round(energy_total, 1),
        'average_daily_energy_kwh': round(energy_total / horizon_days, 1) if horizon_days else 0.0,
        'predicted_peak_demand_kw': round(peak_total, 1),
        'energy_lower_kwh': round(lower_total, 1),
        'energy_upper_kwh': round(upper_total, 1),
        'peak_lower_kw': round(peak_lower, 1),
        'peak_upper_kw': round(peak_upper, 1),
        'confidence_pct': round(confidence_pct, 1),
        'history_days': int(history['date'].nunique()) if not history.empty else 0,
        'model_name': model_name,
        'history': history_points,
        'forecast': forecast_points,
    }


def facility_forecasts(horizon_days):
    forecasts = []
    for facility in Facility.objects.order_by('name'):
        result = build_forecast(facility.id, horizon_days)
        forecasts.append({
            'facility_id': facility.id,
            'facility_name': facility.name,
            'forecast_energy_kwh': result['forecast_energy_kwh'],
            'predicted_peak_demand_kw': result['predicted_peak_demand_kw'],
            'energy_lower_kwh': result['energy_lower_kwh'],
            'energy_upper_kwh': result['energy_upper_kwh'],
            'confidence_pct': result['confidence_pct'],
        })
    return forecasts