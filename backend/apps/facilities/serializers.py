from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone
from .models import Organization, Facility, SmartMeter
from apps.energy.models import EnergyReading, DailyEnergyAggregate

class SmartMeterSerializer(serializers.ModelSerializer):
    current_kw = serializers.SerializerMethodField()

    class Meta:
        model = SmartMeter
        fields = '__all__'

    def get_current_kw(self, obj):
        latest = obj.readings.order_by('-timestamp').first()
        return round(latest.kw_demand, 1) if latest else 0.0

class FacilitySerializer(serializers.ModelSerializer):
    meters = SmartMeterSerializer(many=True, read_only=True)
    active_meter_count = serializers.IntegerField(read_only=True)
    current_kw = serializers.SerializerMethodField()
    today_kwh = serializers.SerializerMethodField()
    connected_capacity_kw = serializers.SerializerMethodField()
    load_pct = serializers.SerializerMethodField()

    class Meta:
        model = Facility
        fields = '__all__'

    def get_current_kw(self, obj):
        readings = EnergyReading.objects.filter(meter__facility=obj).order_by('-timestamp')[:obj.meters.count()]
        val = sum(r.kw_demand for r in readings) if readings else 0.0
        return round(val, 1)

    def get_today_kwh(self, obj):
        today = timezone.now().date()
        aggs = DailyEnergyAggregate.objects.filter(meter__facility=obj, date=today)
        val = aggs.aggregate(Sum('total_kwh'))['total_kwh__sum'] or 0.0
        return round(val, 1)

    def get_connected_capacity_kw(self, obj):
        val = obj.meters.aggregate(Sum('rated_capacity_kw'))['rated_capacity_kw__sum'] or (obj.meters.count() * 100.0)
        return round(val, 1)

    def get_load_pct(self, obj):
        kw = self.get_current_kw(obj)
        cap = self.get_connected_capacity_kw(obj)
        return round((kw / cap * 100), 1) if cap > 0 else 0.0

class FacilityListSerializer(FacilitySerializer):
    class Meta:
        model = Facility
        fields = (
            'id', 'name', 'facility_type', 'status', 'area_sqft', 'floors', 
            'active_meter_count', 'current_kw', 'today_kwh', 'connected_capacity_kw', 'load_pct'
        )

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'
