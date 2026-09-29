from rest_framework import serializers
from .models import SolarAsset, BESSAsset

class SolarAssetSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='facility.name', read_only=True, default='Rooftop Solar Site')

    class Meta:
        model = SolarAsset
        fields = '__all__'

class BESSAssetSerializer(serializers.ModelSerializer):
    current_charge_kwh = serializers.SerializerMethodField()
    state_of_charge_pct = serializers.SerializerMethodField()

    class Meta:
        model = BESSAsset
        fields = '__all__'

    def get_current_charge_kwh(self, obj):
        return min(max(obj.current_charge_kwh, 0.0), max(obj.capacity_kwh, 0.0))

    def get_state_of_charge_pct(self, obj):
        if obj.capacity_kwh <= 0:
            return 0.0
        charge = min(max(obj.current_charge_kwh, 0.0), obj.capacity_kwh)
        return round(charge / obj.capacity_kwh * 100.0, 1)


class RenewableSummarySerializer(serializers.Serializer):
    total_solar_generated_kwh = serializers.FloatField()
    solar_trend = serializers.CharField()
    renewable_share_pct = serializers.FloatField()
    share_trend = serializers.CharField()
    bess_storage_capacity_kwh = serializers.FloatField()
    bess_current_charge_kwh = serializers.FloatField()
    bess_soc_pct = serializers.FloatField(min_value=0, max_value=100)
    grid_export_kwh = serializers.FloatField()
    grid_import_kw = serializers.FloatField()
    grid_import_share_pct = serializers.FloatField()
    campus_total_load_kw = serializers.FloatField()
    solar_current_generation_kw = serializers.FloatField()
    solar_capacity_kw = serializers.FloatField()
    bess_discharge_kw = serializers.FloatField()
    clean_supply_pct = serializers.FloatField()
    carbon_offset_kg = serializers.FloatField()
    co2_saved_tons = serializers.FloatField()
    campus_consumption_kwh = serializers.FloatField()
    emission_factor_kg_co2_per_kwh = serializers.FloatField()


class SolarProfilePointSerializer(serializers.Serializer):
    time = serializers.CharField()
    solar_kw = serializers.FloatField()
    irradiance = serializers.FloatField()


class GridInteractionPointSerializer(serializers.Serializer):
    hour = serializers.CharField()
    grid_import = serializers.FloatField()
    solar_gen = serializers.FloatField()
    bess_discharge = serializers.FloatField()
