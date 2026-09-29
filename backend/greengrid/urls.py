from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
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
