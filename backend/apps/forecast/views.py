from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ForecastFacilitySerializer,
    ForecastFiltersSerializer,
    ForecastPointSerializer,
    ForecastRequestSerializer,
    ForecastSummarySerializer,
)
from .services import HORIZONS, build_forecast, facility_forecasts, forecast_filters


def _params(request):
    payload = {
        'horizon_days': request.query_params.get('horizon_days', 7),
    }
    facility_id = request.query_params.get('facility_id')
    if facility_id and facility_id != 'ALL':
        payload['facility_id'] = facility_id
    serializer = ForecastRequestSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


class ForecastFiltersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = forecast_filters()
        data['horizons'] = HORIZONS
        return Response(ForecastFiltersSerializer(data).data)


class ForecastSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _params(request)
        forecast = build_forecast(
            params.get('facility_id'),
            int(params['horizon_days']),
        )
        return Response(ForecastSummarySerializer(forecast).data)


class ForecastConsumptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _params(request)
        forecast = build_forecast(params.get('facility_id'), int(params['horizon_days']))
        return Response(ForecastPointSerializer(
            forecast['history'] + forecast['forecast'], many=True
        ).data)


class ForecastPeakDemandView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _params(request)
        forecast = build_forecast(params.get('facility_id'), int(params['horizon_days']))
        rows = [{
            'date': point['date'],
            'actual_kwh': None,
            'forecast_kwh': None,
            'lower_kwh': None,
            'upper_kwh': None,
            'actual_peak_kw': point['actual_peak_kw'],
            'predicted_peak_kw': point['predicted_peak_kw'],
            'peak_lower_kw': point['peak_lower_kw'],
            'peak_upper_kw': point['peak_upper_kw'],
            'kind': point['kind'],
        } for point in forecast['history'] + forecast['forecast']]
        return Response(ForecastPointSerializer(rows, many=True).data)


class ForecastConfidenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _params(request)
        forecast = build_forecast(params.get('facility_id'), int(params['horizon_days']))
        return Response({
            'horizon_days': forecast['horizon_days'],
            'confidence_pct': forecast['confidence_pct'],
            'history_days': forecast['history_days'],
            'model_name': forecast['model_name'],
            'energy_lower_kwh': forecast['energy_lower_kwh'],
            'energy_upper_kwh': forecast['energy_upper_kwh'],
            'peak_lower_kw': forecast['peak_lower_kw'],
            'peak_upper_kw': forecast['peak_upper_kw'],
        })


class FacilityForecastView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _params(request)
        if params.get('facility_id'):
            forecast = build_forecast(params['facility_id'], int(params['horizon_days']))
            facility_id = params['facility_id']
            from apps.facilities.models import Facility
            facility = Facility.objects.get(pk=facility_id)
            data = [{
                'facility_id': facility.id,
                'facility_name': facility.name,
                'forecast_energy_kwh': forecast['forecast_energy_kwh'],
                'predicted_peak_demand_kw': forecast['predicted_peak_demand_kw'],
                'energy_lower_kwh': forecast['energy_lower_kwh'],
                'energy_upper_kwh': forecast['energy_upper_kwh'],
                'confidence_pct': forecast['confidence_pct'],
            }]
        else:
            data = facility_forecasts(int(params['horizon_days']))
        return Response(ForecastFacilitySerializer(data, many=True).data)