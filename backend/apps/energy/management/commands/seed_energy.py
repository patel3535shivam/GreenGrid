from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from apps.energy.models import EnergyReading, DailyEnergyAggregate
from apps.facilities.models import SmartMeter

class Command(BaseCommand):
    help = 'Seeds 24 hours of energy telemetry data'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        start_time = now - timedelta(hours=24)
        meters = SmartMeter.objects.filter(status='ACTIVE')
        
        EnergyReading.objects.all().delete()
        DailyEnergyAggregate.objects.all().delete()
        
        self.stdout.write("Generating 24 hours of data (15-min intervals)...")
        
        for meter in meters:
            base_kw = 50.0
            if meter.facility.facility_type == 'MAIN_ADMIN': base_kw = 180.0
            elif meter.facility.facility_type == 'LAB': base_kw = 620.0
            elif meter.facility.facility_type == 'FACTORY': base_kw = 450.0
            
            current_time = start_time
            while current_time <= now:
                hour = current_time.hour
                factor = 1.2 if 9 <= hour <= 17 else 0.5
                kw = base_kw * factor * (1 + random.gauss(0, 0.05))
                if kw < 0: kw = 0
                kwh = kw * 0.25
                pf = random.uniform(0.88, 0.98)
                
                EnergyReading.objects.create(
                    meter=meter,
                    timestamp=current_time,
                    kwh_consumed=kwh,
                    kw_demand=kw,
                    power_factor=pf,
                    voltage_avg=230.0 + random.gauss(0, 2.0),
                    current_avg=kw / (230.0 * pf * 1.732) * 1000 if pf else 0,
                    frequency=random.gauss(50.0, 0.02),
                    thd_voltage=random.uniform(1.5, 5.0)
                )
                
                today = current_time.date()
                agg, _ = DailyEnergyAggregate.objects.get_or_create(meter=meter, date=today)
                agg.total_kwh += kwh
                if kw > agg.peak_kw: agg.peak_kw = kw
                agg.save()
                
                current_time += timedelta(minutes=15)
                
        self.stdout.write(self.style.SUCCESS('Successfully seeded energy data!'))
