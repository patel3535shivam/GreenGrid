from rest_framework import serializers

from apps.facilities.models import Facility
from .models import GeneratedReport


class GeneratedReportSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='facility.name', read_only=True, default='Campus Wide')

    class Meta:
        model = GeneratedReport
        fields = '__all__'


class ReportRequestSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=['energy', 'billing'])
    facility_id = serializers.IntegerField(required=False, allow_null=True)
    format = serializers.ChoiceField(choices=['CSV'], default='CSV')

    def validate_facility_id(self, value):
        if value is not None and not Facility.objects.filter(pk=value).exists():
            raise serializers.ValidationError('Unknown facility.')
        return value


class ReportPreviewSerializer(serializers.Serializer):
    report_type = serializers.CharField()
    facility_name = serializers.CharField()
    consumption_kwh = serializers.FloatField()
    billed_cost = serializers.FloatField()
    peak_demand_kw = serializers.FloatField()
    solar_yield_kwh = serializers.FloatField()
    average_power_factor = serializers.FloatField()
    telemetry_rows = serializers.IntegerField()
    telemetry_reporting_meters = serializers.IntegerField()
    active_meters = serializers.IntegerField()
    audit_compliance_pct = serializers.FloatField()
    compiled_at = serializers.DateTimeField()


class ReportSummarySerializer(serializers.Serializer):
    total_reports_generated = serializers.IntegerField()
    automated_dispatch = serializers.IntegerField()
    audit_compliance_pct = serializers.FloatField()
    total_export_bytes = serializers.IntegerField()
    rows_exported_quarter = serializers.IntegerField()
    telemetry_reporting_meters = serializers.IntegerField()
    active_meters = serializers.IntegerField()


class ReportConfigurationsSerializer(serializers.Serializer):
    report_types = serializers.ListField(child=serializers.DictField())
    formats = serializers.ListField(child=serializers.CharField())
    facilities = serializers.ListField(child=serializers.DictField())


class TelemetryReportRowSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    meter_id = serializers.CharField()
    facility_name = serializers.CharField()
    meter_type = serializers.CharField()
    kwh_consumed = serializers.FloatField()
    kw_demand = serializers.FloatField()
    power_factor = serializers.FloatField()
    voltage_avg = serializers.FloatField()
    thd_voltage = serializers.FloatField()


class BillingReportRowSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    billing_period = serializers.CharField()
    facility_name = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_kwh = serializers.FloatField()
    energy_charges = serializers.FloatField()
    fixed_charges = serializers.FloatField()
    tax_amount = serializers.FloatField()
    net_payable = serializers.FloatField()
    status = serializers.CharField()


class FacilityReportRowSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    facility_name = serializers.CharField()
    facility_type = serializers.CharField()
    consumption_kwh = serializers.FloatField()
    peak_demand_kw = serializers.FloatField()
    average_power_factor = serializers.FloatField()
    billed_cost = serializers.FloatField()