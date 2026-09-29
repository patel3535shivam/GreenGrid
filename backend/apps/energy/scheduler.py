import random
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from django.utils import timezone
from .models import EnergyReading, DailyEnergyAggregate
from apps.facilities.models import SmartMeter

def generate_telemetry():
    now = timezone.now()
    meters = SmartMeter.objects.filter(status='ACTIVE')
    for meter in meters:
        # Base load depends on facility type (simplified)
        base_kw = 50.0
        if meter.facility.facility_type == 'MAIN_ADMIN': base_kw = 180.0
        elif meter.facility.facility_type == 'LAB': base_kw = 620.0
        
        # Diurnal factor (9-17h is peak)
        hour = now.hour
        factor = 1.2 if 9 <= hour <= 17 else 0.5
        
        kw = base_kw * factor * (1 + random.gauss(0, 0.05))
        if kw < 0: kw = 0
        
        kwh = kw * (15 / 60) # 15 min interval
        pf = random.uniform(0.88, 0.98)
        
        EnergyReading.objects.create(
            meter=meter,
            timestamp=now,
            kwh_consumed=kwh,
            kw_demand=kw,
            power_factor=pf,
            voltage_avg=230.0 + random.gauss(0, 2.0),
            current_avg=kw / (230.0 * pf * 1.732) * 1000 if pf else 0, # roughly
            frequency=random.gauss(50.0, 0.02),
            thd_voltage=random.uniform(1.5, 5.0)
        )
        
        # Update daily aggregate
        today = now.date()
        agg, _ = DailyEnergyAggregate.objects.get_or_create(meter=meter, date=today)
        agg.total_kwh += kwh
        if kw > agg.peak_kw: agg.peak_kw = kw
        agg.save()

def start_scheduler():
    scheduler = BackgroundScheduler()
    # For demo purposes, we'll run it every 30 seconds to show "live" data instead of 15 min
    scheduler.add_job(generate_telemetry, IntervalTrigger(seconds=30), id='telemetry_gen', replace_existing=True)
    scheduler.start()
