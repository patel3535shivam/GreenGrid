from django.utils import timezone
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alert
from .serializers import AlertSerializer


class AlertListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlertSerializer

    def get_queryset(self):
        queryset = Alert.objects.select_related('facility').all()
        severity = self.request.query_params.get('severity')
        category = self.request.query_params.get('category')
        unacknowledged = self.request.query_params.get('unacknowledged')
        sub_meter_anomalies = self.request.query_params.get('sub_meter_anomalies')
        search = self.request.query_params.get('search', '').strip()

        if severity and severity.upper() != 'ALL':
            queryset = queryset.filter(severity=severity.upper())
        if category and category.upper() != 'ALL':
            queryset = queryset.filter(category=category.upper())
        if unacknowledged and unacknowledged.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(is_acknowledged=False)
        if sub_meter_anomalies and sub_meter_anomalies.lower() in ('true', '1', 'yes'):
            queryset = queryset.filter(category='SUB_METER')
        if search:
            queryset = queryset.filter(
                Q(alert_id__icontains=search)
                | Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(facility__name__icontains=search)
                | Q(meter_id__icontains=search)
            )
        return queryset


class AlertDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AlertSerializer
    queryset = Alert.objects.select_related('facility').all()


class AlertSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        return Response({
            'critical_count': Alert.objects.filter(
                severity='CRITICAL', is_resolved=False
            ).count(),
            'warning_count': Alert.objects.filter(
                severity='WARNING', is_resolved=False
            ).count(),
            'active_unresolved': Alert.objects.filter(is_resolved=False).count(),
            'resolved_today': Alert.objects.filter(
                is_resolved=True, resolved_at__date=today
            ).count(),
            'unacknowledged_count': Alert.objects.filter(is_acknowledged=False).count(),
        })


class AlertLifecycleView(APIView):
    permission_classes = [IsAuthenticated]
    action = None

    def post(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk)
        except Alert.DoesNotExist:
            return Response({'error': 'Alert not found'}, status=404)

        now = timezone.now()
        if self.action == 'acknowledge':
            if not alert.is_acknowledged:
                alert.is_acknowledged = True
                alert.acknowledged_at = now
                alert.save(update_fields=['is_acknowledged', 'acknowledged_at'])
            message = 'Alert acknowledged'
        else:
            fields = []
            if not alert.is_acknowledged:
                alert.is_acknowledged = True
                alert.acknowledged_at = now
                fields.extend(['is_acknowledged', 'acknowledged_at'])
            if not alert.is_resolved:
                alert.is_resolved = True
                alert.resolved_at = now
                fields.extend(['is_resolved', 'resolved_at'])
            if fields:
                alert.save(update_fields=fields)
            message = 'Alert marked as resolved'

        return Response({
            'status': message,
            'alert': AlertSerializer(alert).data,
        })


class AcknowledgeAlertView(AlertLifecycleView):
    action = 'acknowledge'


class ResolveAlertView(AlertLifecycleView):
    action = 'resolve'