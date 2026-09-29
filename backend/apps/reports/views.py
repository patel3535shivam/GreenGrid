import pandas as pd
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.billing.models import UtilityBill
from apps.facilities.models import Facility

from .models import GeneratedReport
from .serializers import (
    BillingReportRowSerializer,
    FacilityReportRowSerializer,
    GeneratedReportSerializer,
    ReportConfigurationsSerializer,
    ReportPreviewSerializer,
    ReportRequestSerializer,
    ReportSummarySerializer,
    TelemetryReportRowSerializer,
)
from .services import (
    BILLING_COLUMNS,
    ENERGY_COLUMNS,
    facility_report_rows,
    report_dataframe,
    report_preview,
    report_summary,
)


REPORT_TYPES = [
    {'value': 'energy', 'label': 'Energy Consumption & Telemetry Stream'},
    {'value': 'billing', 'label': 'Utility Billing & Cost Allocation Audit'},
]


def _request_parameters(query_params):
    facility_id = query_params.get('facility_id')
    serializer = ReportRequestSerializer(data={
        'report_type': query_params.get('report_type', 'energy'),
        'facility_id': facility_id if facility_id and facility_id != 'ALL' else None,
        'format': query_params.get('file_format', 'CSV'),
    })
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


def _csv_response(report_type, facility_id):
    dataframe = report_dataframe(report_type, facility_id)
    facility = Facility.objects.filter(pk=facility_id).first() if facility_id else None
    timestamp = timezone.localtime().strftime('%Y%m%d_%H%M%S')
    scope = f'_facility_{facility_id}' if facility else '_campus'
    filename = f'GreenGrid_{report_type.upper()}_Report{scope}_{timestamp}.csv'
    csv_data = dataframe.to_csv(index=False, columns=BILLING_COLUMNS if report_type == 'billing' else ENERGY_COLUMNS)
    csv_bytes = csv_data.encode('utf-8')
    GeneratedReport.objects.create(
        report_type=report_type,
        facility=facility,
        file_name=filename,
        row_count=len(dataframe.index),
        file_size_bytes=len(csv_bytes),
    )
    response = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['X-Report-Row-Count'] = str(len(dataframe.index))
    return response


class ReportSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ReportSummarySerializer(report_summary()).data)


class ReportConfigurationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = {
            'report_types': REPORT_TYPES,
            'formats': ['CSV'],
            'facilities': [
                {'id': facility.id, 'name': facility.name}
                for facility in Facility.objects.order_by('name')
            ],
        }
        return Response(ReportConfigurationsSerializer(data).data)


class ReportPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _request_parameters(request.query_params)
        data = report_preview(params['report_type'], params.get('facility_id'))
        return Response(ReportPreviewSerializer(data).data)


class TelemetryReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _request_parameters(request.query_params)
        if params['report_type'] != 'energy':
            return Response({'detail': 'Telemetry data requires report_type=energy.'}, status=400)
        dataframe = report_dataframe('energy', params.get('facility_id')).head(250)
        data = dataframe.replace({pd.NA: None}).to_dict(orient='records')
        return Response(TelemetryReportRowSerializer(data, many=True).data)


class BillingReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query_params = request.query_params.copy()
        query_params.setdefault('report_type', 'billing')
        params = _request_parameters(query_params)
        if params['report_type'] != 'billing':
            return Response({'detail': 'Billing data requires report_type=billing.'}, status=400)
        rows = UtilityBill.objects.filter(is_generated=True).select_related('facility').all()
        if params.get('facility_id'):
            rows = rows.filter(facility_id=params['facility_id'])
            rows = report_dataframe('billing', params['facility_id']).to_dict(orient='records')
            for row in rows:
                row['id'] = params['facility_id']
            return Response(BillingReportRowSerializer(rows, many=True).data)
        data = [{
            'id': bill.id,
            'billing_period': bill.billing_period,
            'facility_name': bill.facility.name if bill.facility else 'Campus Wide',
            'start_date': bill.start_date,
            'end_date': bill.end_date,
            'total_kwh': bill.total_kwh,
            'energy_charges': bill.energy_charges,
            'fixed_charges': bill.fixed_charges,
            'tax_amount': bill.tax_amount,
            'net_payable': bill.net_payable,
            'status': bill.status,
        } for bill in rows.order_by('-start_date')]
        return Response(BillingReportRowSerializer(data, many=True).data)


class FacilityReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _request_parameters(request.query_params)
        return Response(FacilityReportRowSerializer(
            facility_report_rows(params.get('facility_id')), many=True
        ).data)


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        params = serializer.validated_data
        response = _csv_response(params['report_type'], params.get('facility_id'))
        response.status_code = status.HTTP_200_OK
        return response


class ExportReportCsvView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = _request_parameters(request.query_params)
        return _csv_response(params['report_type'], params.get('facility_id'))


class GeneratedReportHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = GeneratedReport.objects.select_related('facility').all()
        return Response(GeneratedReportSerializer(reports, many=True).data)