from rest_framework import serializers
from .models import EnergyReading, DailyEnergyAggregate
from apps.facilities.serializers import SmartMeterSerializer

class EnergyReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyReading
        fields = '__all__'

class DailyEnergyAggregateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyEnergyAggregate
        fields = '__all__'

class MeterTelemetrySerializer(serializers.Serializer):
    meter = SmartMeterSerializer()
    latest_reading = EnergyReadingSerializer()
    daily_aggregate = DailyEnergyAggregateSerializer()
