from datetime import date, timedelta

import pandas as pd
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UtilityBill
from .serializers import (
    BillingSummarySerializer,
    BillingTrendSerializer,
    FacilityBillingSerializer,
    GenerateBillSerializer,
    TariffConfigSerializer,
    UtilityBillSerializer,
)
from .services import active_tariff, calculate_bill


def _current_period():
    today = timezone.localdate()
    return today.replace(day=1), today


def _due_date(end_date):
    following_month = end_date.replace(day=28) + timedelta(days=4)
    return following_month.replace(day=15)


def _summary_data(start_date, end_date, bill=None):
    calculated = calculate_bill(start_date, end_date, active_tariff())
    days = calculated['days_with_data']
    status_value = bill.status if bill else 'DUE'
    data = {
        'billing_period': f"{start_date.strftime('%B %Y')} ({start_date.strftime('%b %d')} - {end_date.strftime('%b %d, %Y')})",
        'period_start': start_date,
        'period_end': end_date,
        'current_month_bill': calculated['net_payable'],
        'total_consumption_kwh': calculated['total_consumption_kwh'],
        'energy_charges': calculated['energy_charges'],
        'fixed_charges': calculated['fixed_charges'],
        'tax_amount': calculated['tax_amount'],
        'renewable_credit': calculated['renewable_credit'],
        'net_payable': calculated['net_payable'],
        'avg_cost_per_unit': calculated['avg_cost_per_unit'],
        'daily_average_kwh': round(calculated['total_consumption_kwh'] / days, 2) if days else 0.0,
        'due_date': _due_date(end_date),
        'status': status_value,
    }
    return data, calculated


class BillingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date, end_date = _current_period()
        bill = UtilityBill.objects.filter(
            is_generated=True,
            facility__isnull=True,
            start_date=start_date,
            end_date=end_date,
        ).first()
        data, _ = _summary_data(start_date, end_date, bill)
        return Response(BillingSummarySerializer(data).data)


class TariffConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tariff = active_tariff()
        return Response(TariffConfigSerializer(tariff).data)

    def put(self, request):
        tariff = active_tariff()
        serializer = TariffConfigSerializer(tariff, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class FacilityBillingBreakdownView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date, end_date = _current_period()
        _, calculated = _summary_data(start_date, end_date)
        return Response(FacilityBillingSerializer(
            calculated['facility_breakdown'], many=True
        ).data)


class BillHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bills = UtilityBill.objects.filter(is_generated=True).select_related('facility')
        return Response(UtilityBillSerializer(bills, many=True).data)


class BillingTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        current_month_ordinal = today.year * 12 + today.month - 1
        first_month_ordinal = current_month_ordinal - 5
        first_year, first_month_index = divmod(first_month_ordinal, 12)
        first_month = date(first_year, first_month_index + 1, 1)
        after_last_year, after_last_month_index = divmod(current_month_ordinal + 1, 12)
        after_last_month = date(after_last_year, after_last_month_index + 1, 1)
        bills = UtilityBill.objects.filter(
            facility__isnull=True,
            start_date__gte=first_month,
            start_date__lt=after_last_month,
        ).order_by('start_date')
        monthly_bills = {}
        for bill in bills:
            key = (bill.start_date.year, bill.start_date.month)
            current = monthly_bills.get(key)
            if current is None or (bill.is_generated and not current.is_generated):
                monthly_bills[key] = bill

        start_date, end_date = _current_period()
        current_data, _ = _summary_data(start_date, end_date)
        data = []
        for month_ordinal in range(first_month_ordinal, current_month_ordinal + 1):
            year, month_index = divmod(month_ordinal, 12)
            month_start = date(year, month_index + 1, 1)
            key = (year, month_index + 1)
            bill = monthly_bills.get(key)
            if key == (today.year, today.month) and current_data['total_consumption_kwh'] > 0:
                data.append({
                    'month': month_start.strftime('%b %Y'),
                    'kwh': current_data['total_consumption_kwh'],
                    'cost': current_data['current_month_bill'],
                })
            elif bill is not None:
                data.append({
                    'month': month_start.strftime('%b %Y'),
                    'kwh': bill.total_kwh,
                    'cost': bill.net_payable,
                })

        return Response(BillingTrendSerializer(data, many=True).data)


class GenerateBillView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GenerateBillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        today = timezone.localdate()
        start_date = serializer.validated_data.get('start_date', today.replace(day=1))
        end_date = serializer.validated_data.get('end_date', today)
        if start_date > end_date:
            return Response(
                {'end_date': 'Must be on or after start_date.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if end_date > today:
            return Response(
                {'end_date': 'Cannot generate a bill for a future date.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data, calculated = _summary_data(start_date, end_date)
        period_name = start_date.strftime('%B %Y')
        bill, created = UtilityBill.objects.update_or_create(
            is_generated=True,
            facility=None,
            billing_period=period_name,
            defaults={
                'start_date': start_date,
                'end_date': end_date,
                'total_kwh': calculated['total_consumption_kwh'],
                'energy_charges': calculated['energy_charges'],
                'fixed_charges': calculated['fixed_charges'],
                'tax_amount': calculated['tax_amount'],
                'renewable_credit': calculated['renewable_credit'],
                'net_payable': calculated['net_payable'],
                'due_date': _due_date(end_date),
                'status': 'DUE',
                'is_generated': True,
            },
        )
        response_data = UtilityBillSerializer(bill).data
        response_data['created'] = created
        response_data['summary'] = data
        return Response(response_data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class BillingCsvExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date, end_date = _current_period()
        _, calculated = _summary_data(start_date, end_date)
        frame = pd.DataFrame(calculated['facility_breakdown'], columns=[
            'facility_name', 'consumption_kwh', 'energy_charges', 'fixed_charges',
            'tax', 'total_bill', 'status',
        ])
        response = HttpResponse(frame.to_csv(index=False), content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="greengrid-billing.csv"'
        return response