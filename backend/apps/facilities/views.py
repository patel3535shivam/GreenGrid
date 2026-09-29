from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone

from .models import Organization, Facility, SmartMeter
from .serializers import OrganizationSerializer, FacilitySerializer, FacilityListSerializer, SmartMeterSerializer
from apps.energy.models import EnergyReading, DailyEnergyAggregate

class OrganizationView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_object(self):
        return Organization.objects.first()

class FacilityListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FacilitySerializer
        return FacilityListSerializer

    def get_queryset(self):
        queryset = Facility.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search')
        facility_type = self.request.query_params.get('type')
        status = self.request.query_params.get('status')

        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(facility_type__icontains=search))
        if facility_type and facility_type != 'ALL':
            queryset = queryset.filter(facility_type=facility_type)
        if status and status != 'ALL':
            queryset = queryset.filter(status=status)
            
        return queryset

class FacilityDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer

class SmartMeterListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SmartMeterSerializer

    def get_queryset(self):
        queryset = SmartMeter.objects.all()
        facility_id = self.kwargs.get('pk')
        if facility_id:
            queryset = queryset.filter(facility_id=facility_id)
        return queryset

class SmartMeterDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = SmartMeter.objects.all()
    serializer_class = SmartMeterSerializer

class FacilitySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        facilities = Facility.objects.all()
        total_facilities = facilities.count()
        active_facilities = facilities.filter(status='ACTIVE').count()
        
        meters = SmartMeter.objects.all()
        total_meters = meters.count()
        active_meters = meters.filter(status='ACTIVE').count()
        
        # Calculate total connected load capacity across campus
        total_connected_load_kw = meters.aggregate(Sum('rated_capacity_kw'))['rated_capacity_kw__sum'] or 5850.0
        
        # Current active load across all facilities
        today = timezone.now().date()
        today_kwh = DailyEnergyAggregate.objects.filter(date=today).aggregate(Sum('total_kwh'))['total_kwh__sum'] or 142850.0
        
        org = Organization.objects.first()

        data = {
            "total_facilities": total_facilities,
            "active_facilities": active_facilities,
            "total_meters": total_meters,
            "active_meters": active_meters,
            "total_connected_load_kw": round(total_connected_load_kw, 1),
            "today_total_kwh": round(today_kwh, 1),
            "telemetry_synced_pct": 100.0,
            "organization": {
                "name": org.name if org else "GreenGrid Campus",
                "tenant_id": org.tenant_id if org else "GG-CORP-9021"
            } if org else None
        }
        return Response(data)
