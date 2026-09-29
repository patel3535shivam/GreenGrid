from django.apps import AppConfig

class EnergyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.energy'

    def ready(self):
        import os
        if os.environ.get('RUN_MAIN', None) == 'true':
            from .scheduler import start_scheduler
            start_scheduler()
