from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def root_api_view(request):
    """
    Root endpoint health-check & API directory.
    Confirms the backend service is live and healthy on Render.
    """
    return JsonResponse({
        "status": "online",
        "service": "GreenGrid Smart Energy Management System API",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/v1/auth/",
            "facilities": "/api/v1/facilities/",
            "meters": "/api/v1/meters/",
            "energy": "/api/v1/energy/",
            "billing": "/api/v1/billing/",
            "renewable": "/api/v1/renewable/",
            "alerts": "/api/v1/alerts/",
            "reports": "/api/v1/reports/",
            "analytics": "/api/v1/analytics/",
            "forecast": "/api/v1/forecast/"
        }
    })

urlpatterns = [
    path('', root_api_view, name='root_api'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/', include('apps.facilities.urls')),
    path('api/v1/energy/', include('apps.energy.urls')),
    path('api/v1/billing/', include('apps.billing.urls')),
    path('api/v1/renewable/', include('apps.renewable.urls')),
    path('api/v1/alerts/', include('apps.alerts.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/forecast/', include('apps.forecast.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
