from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    facility_name = serializers.CharField(source='facility.name', read_only=True, default='Campus Main Incomer')
    is_sub_meter_anomaly = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = '__all__'

    def get_is_sub_meter_anomaly(self, obj):
        return obj.category == 'SUB_METER'
