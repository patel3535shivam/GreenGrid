from .base import *
from decouple import config
import os

DEBUG = config('DEBUG', default=False, cast=bool)

# Read ALLOWED_HOSTS from env (defaults to localhost, 127.0.0.1, and any .onrender.com domain)
ALLOWED_HOSTS = [
    h.strip()
    for h in config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.onrender.com').split(',')
    if h.strip()
]

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
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOW_CREDENTIALS = True

# Security enhancements for production when behind Render's reverse proxy
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
    CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
