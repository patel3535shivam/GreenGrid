from django.contrib import admin
from .models import Organization, Facility, SmartMeter

admin.site.register(Organization)
admin.site.register(Facility)
admin.site.register(SmartMeter)
