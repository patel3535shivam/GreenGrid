from .base import *
from decouple import config
import os

DEBUG = config('DEBUG', default=False, cast=bool)

# Robust ALLOWED_HOSTS Configuration
# Parses comma-separated values, strips schemes (http/https), quotes, and trailing slashes.
# Automatically includes Render external hostname and .onrender.com wildcard.
raw_allowed_hosts = config('ALLOWED_HOSTS', default='*')
ALLOWED_HOSTS = []
for host in raw_allowed_hosts.split(','):
    host = host.strip().strip("'\"").rstrip('/')
    if host.startswith('https://'):
        host = host[len('https://'):]
    elif host.startswith('http://'):
        host = host[len('http://'):]
    host = host.rstrip('/')
    if host:
        ALLOWED_HOSTS.append(host)

render_external_hostname = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if render_external_hostname and render_external_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_external_hostname)

if '.onrender.com' not in ALLOWED_HOSTS and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.extend(['.onrender.com', 'localhost', '127.0.0.1'])

# Database configuration: support DATABASE_URL (for Render PostgreSQL) or MySQL or SQLite fallback
DATABASE_URL = config('DATABASE_URL', default=None)
if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                default=DATABASE_URL,
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
    except ImportError:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'greengrid_dev.sqlite3',
            }
        }
elif config('USE_MYSQL', default=False, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': config('DB_NAME', default='greengrid_db'),
            'USER': config('DB_USER', default='root'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
            },
        }
    }
else:
    # Default SQLite fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'greengrid_dev.sqlite3',
        }
    }

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173,http://127.0.0.1:5173').split(',')
    if origin.strip()
]
# Default to allowing all origins so that frontend deployments are not blocked
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)
CORS_ALLOW_CREDENTIALS = True

# Security enhancements for production when behind Render's reverse proxy
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
    CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
