from rest_framework import serializers

from apps.facilities.models import Facility


class AnalyticsFilterSerializer(serializers.Serializer):
    range = serializers.ChoiceField(choices=['today', '7d', '30d', '90d', 'custom'], default='7d')
    facility_id = serializers.IntegerField(required=False, allow_null=True)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    def validate_facility_id(self, value):
        if value is not None and not Facility.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Unknown facility.')
        return value

    def validate(self, attrs):
        selected_range = attrs.get('range', '7d')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if selected_range == 'custom' and (not start_date or not end_date):
            raise serializers.ValidationError('Custom range requires start_date and end_date.')
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'Must be on or after start_date.'})
        if start_date and end_date and (end_date - start_date).days > 365:
            raise serializers.ValidationError('Analytics date ranges cannot exceed 366 days.')
        return attrs


class AnalyticsSummarySerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_consumption_kwh = serializers.FloatField()
    peak_demand_kw = serializers.FloatField()
    average_power_factor = serializers.FloatField()
    estimated_energy_cost = serializers.FloatField()
    renewable_generation_kwh = serializers.FloatField()
    renewable_share_pct = serializers.FloatField()
    energy_intensity_kwh_per_sqft = serializers.FloatField()
    load_factor_pct = serializers.FloatField()
    reporting_days = serializers.IntegerField()


class ConsumptionTrendPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    consumption_kwh = serializers.FloatField()
    peak_demand_kw = serializers.FloatField()
    average_power_factor = serializers.FloatField()


class FacilityComparisonSerializer(serializers.Serializer):
    facility_id = serializers.IntegerField()
    facility_name = serializers.CharField()
    consumption_kwh = serializers.FloatField()
    share_pct = serializers.FloatField()
    peak_demand_kw = serializers.FloatField()
    average_power_factor = serializers.FloatField()
    energy_intensity_kwh_per_sqft = serializers.FloatField()


class PeakDemandPointSerializer(serializers.Serializer):
    time = serializers.DateTimeField()
    demand_kw = serializers.FloatField()
    average_demand_kw = serializers.FloatField()
    facility_name = serializers.CharField()


class PowerFactorPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    average_power_factor = serializers.FloatField()


class CostPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    consumption_kwh = serializers.FloatField()
    energy_cost = serializers.FloatField()
    estimated_total_cost = serializers.FloatField()


class RenewablePointSerializer(serializers.Serializer):
    date = serializers.DateField()
    solar_generation_kwh = serializers.FloatField()
    consumption_kwh = serializers.FloatField()
    renewable_share_pct = serializers.FloatField()


class EfficiencySerializer(serializers.Serializer):
    energy_intensity_kwh_per_sqft = serializers.FloatField()
    load_factor_pct = serializers.FloatField()
    average_power_factor = serializers.FloatField()
    consumption_per_active_meter_kwh = serializers.FloatField()
    insights = serializers.ListField(child=serializers.CharField())


class AnalyticsFiltersResponseSerializer(serializers.Serializer):
    facilities = serializers.ListField(child=serializers.DictField())
    ranges = serializers.ListField(child=serializers.DictField())


class AnalyticsDashboardSerializer(serializers.Serializer):
    summary = AnalyticsSummarySerializer()
    consumption = ConsumptionTrendPointSerializer(many=True)
    facilities = FacilityComparisonSerializer(many=True)
    peak_demand = PeakDemandPointSerializer(many=True)
    power_factor = PowerFactorPointSerializer(many=True)
    cost = CostPointSerializer(many=True)
    renewable = RenewablePointSerializer(many=True)
    efficiency = EfficiencySerializer()