from rest_framework import serializers

from apps.facilities.models import Facility


class ForecastFiltersSerializer(serializers.Serializer):
    facilities = serializers.ListField(child=serializers.DictField())
    horizons = serializers.ListField(child=serializers.DictField())


class ForecastRequestSerializer(serializers.Serializer):
    facility_id = serializers.IntegerField(required=False, allow_null=True)
    horizon_days = serializers.ChoiceField(choices=[1, 3, 7, 14], default=7)

    def validate_facility_id(self, value):
        if value is not None and not Facility.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Unknown facility.')
        return value


class ForecastSummarySerializer(serializers.Serializer):
    facility_name = serializers.CharField()
    horizon_days = serializers.IntegerField()
    forecast_energy_kwh = serializers.FloatField()
    average_daily_energy_kwh = serializers.FloatField()
    predicted_peak_demand_kw = serializers.FloatField()
    energy_lower_kwh = serializers.FloatField()
    energy_upper_kwh = serializers.FloatField()
    peak_lower_kw = serializers.FloatField()
    peak_upper_kw = serializers.FloatField()
    confidence_pct = serializers.FloatField()
    history_days = serializers.IntegerField()
    model_name = serializers.CharField()


class ForecastPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    actual_kwh = serializers.FloatField(allow_null=True)
    forecast_kwh = serializers.FloatField(allow_null=True)
    lower_kwh = serializers.FloatField(allow_null=True)
    upper_kwh = serializers.FloatField(allow_null=True)
    actual_peak_kw = serializers.FloatField(allow_null=True)
    predicted_peak_kw = serializers.FloatField(allow_null=True)
    peak_lower_kw = serializers.FloatField(allow_null=True)
    peak_upper_kw = serializers.FloatField(allow_null=True)
    kind = serializers.ChoiceField(choices=['history', 'forecast'])


class ForecastFacilitySerializer(serializers.Serializer):
    facility_id = serializers.IntegerField()
    facility_name = serializers.CharField()
    forecast_energy_kwh = serializers.FloatField()
    predicted_peak_demand_kw = serializers.FloatField()
    energy_lower_kwh = serializers.FloatField()
    energy_upper_kwh = serializers.FloatField()
    confidence_pct = serializers.FloatField()