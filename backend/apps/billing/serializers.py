from rest_framework import serializers
from .models import TariffConfig, UtilityBill

class TariffConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TariffConfig
        fields = '__all__'

    def validate(self, attrs):
        for field in (
            'tier1_rate', 'tier2_rate', 'tier3_rate', 'peak_surcharge_rate',
            'fixed_charge_monthly', 'tax_percentage', 'solar_credit_rate',
        ):
            value = attrs.get(field, getattr(self.instance, field, 0))
            if value < 0:
                raise serializers.ValidationError({field: 'Must be zero or greater.'})
        if attrs.get('tax_percentage', getattr(self.instance, 'tax_percentage', 0)) > 100:
            raise serializers.ValidationError({'tax_percentage': 'Must not exceed 100.'})
        return attrs


class GenerateBillSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({'end_date': 'Must be on or after start_date.'})
        return attrs


class BillingSummarySerializer(serializers.Serializer):
    billing_period = serializers.CharField()
    period_start = serializers.DateField()
    period_end = serializers.DateField()
    current_month_bill = serializers.FloatField()
    total_consumption_kwh = serializers.FloatField()
    energy_charges = serializers.FloatField()
    fixed_charges = serializers.FloatField()
    tax_amount = serializers.FloatField()
    renewable_credit = serializers.FloatField()
    net_payable = serializers.FloatField()
    avg_cost_per_unit = serializers.FloatField()
    daily_average_kwh = serializers.FloatField()
    due_date = serializers.DateField()
    status = serializers.CharField()


class FacilityBillingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    facility_name = serializers.CharField()
    consumption_kwh = serializers.FloatField()
    energy_charges = serializers.FloatField()
    fixed_charges = serializers.FloatField()
    tax = serializers.FloatField()
    total_bill = serializers.FloatField()
    status = serializers.CharField()


class BillingTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    kwh = serializers.FloatField()
    cost = serializers.FloatField()

class UtilityBillSerializer(serializers.ModelSerializer):
    facility_name = serializers.SerializerMethodField()

    class Meta:
        model = UtilityBill
        fields = '__all__'

    def get_facility_name(self, obj):
        return obj.facility.name if obj.facility else 'Campus Wide Aggregated'
