from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BESSAsset, SolarAsset
from .serializers import (
    BESSAssetSerializer,
    GridInteractionPointSerializer,
    RenewableSummarySerializer,
    SolarAssetSerializer,
    SolarProfilePointSerializer,
)
from .services import grid_interaction_history, renewable_summary, solar_generation_profile


class RenewableSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(RenewableSummarySerializer(renewable_summary()).data)


class SolarProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(SolarProfilePointSerializer(
            solar_generation_profile(), many=True
        ).data)


class GridNetMeteringView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(GridInteractionPointSerializer(
            grid_interaction_history(), many=True
        ).data)


class SolarFleetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assets = SolarAsset.objects.select_related('facility').order_by('id')
        return Response(SolarAssetSerializer(assets, many=True).data)


class BESSFleetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assets = BESSAsset.objects.order_by('id')
        return Response(BESSAssetSerializer(assets, many=True).data)