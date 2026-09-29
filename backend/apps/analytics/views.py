from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AnalyticsDashboardSerializer,
    AnalyticsFilterSerializer,
    AnalyticsFiltersResponseSerializer,
    AnalyticsSummarySerializer,
    ConsumptionTrendPointSerializer,
    CostPointSerializer,
    EfficiencySerializer,
    FacilityComparisonSerializer,
    PeakDemandPointSerializer,
    PowerFactorPointSerializer,
    RenewablePointSerializer,
)
from .services import (
    RANGE_LABELS,
    analytics_dashboard,
    analytics_filters,
    analytics_summary,
    consumption_trend,
    cost_analysis,
    efficiency_indicators,
    facility_comparison,
    peak_demand_analysis,
    power_factor_analysis,
    renewable_contribution,
    resolve_filters,
)


def _validated_filters(request):
    facility_id = request.query_params.get('facility_id')
    payload = {
        'range': request.query_params.get('range', '7d'),
        'facility_id': facility_id if facility_id and facility_id != 'ALL' else None,
    }
    if request.query_params.get('start_date'):
        payload['start_date'] = request.query_params['start_date']
    if request.query_params.get('end_date'):
        payload['end_date'] = request.query_params['end_date']
    serializer = AnalyticsFilterSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    return resolve_filters(serializer.validated_data)


class AnalyticsFiltersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AnalyticsFiltersResponseSerializer(analytics_filters()).data)


class AnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AnalyticsDashboardSerializer(
            analytics_dashboard(_validated_filters(request))
        ).data)


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AnalyticsSummarySerializer(
            analytics_summary(_validated_filters(request))
        ).data)


class ConsumptionTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ConsumptionTrendPointSerializer(
            consumption_trend(_validated_filters(request)), many=True
        ).data)


class FacilityComparisonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(FacilityComparisonSerializer(
            facility_comparison(_validated_filters(request)), many=True
        ).data)


class PeakDemandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PeakDemandPointSerializer(
            peak_demand_analysis(_validated_filters(request)), many=True
        ).data)


class PowerFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(PowerFactorPointSerializer(
            power_factor_analysis(_validated_filters(request)), many=True
        ).data)


class CostAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CostPointSerializer(
            cost_analysis(_validated_filters(request)), many=True
        ).data)


class RenewableContributionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(RenewablePointSerializer(
            renewable_contribution(_validated_filters(request)), many=True
        ).data)


class EfficiencyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(EfficiencySerializer(
            efficiency_indicators(_validated_filters(request))
        ).data)