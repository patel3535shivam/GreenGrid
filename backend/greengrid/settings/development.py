from .base import *
from decouple import config
import os

DEBUG = config('DEBUG', default=True, cast=bool)

# Database Configuration
# Supports both SQLite (for quick local dev) and MySQL (for production/full setup)
# Set USE_MYSQL=True in .env to switch to MySQL
USE_MYSQL = config('USE_MYSQL', default=False, cast=bool)

if USE_MYSQL:
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
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
else:
    # SQLite for quick local development (no MySQL installation needed)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'greengrid_dev.sqlite3',
        }
    }

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173').split(',')
CORS_ALLOW_CREDENTIALS = True
