import os
from django.core.wsgi import get_wsgi_application

# Default to production settings on Render (Render injects RENDER=true), otherwise development
default_settings = 'greengrid.settings.production' if os.environ.get('RENDER') else 'greengrid.settings.development'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', default_settings)

application = get_wsgi_application()
