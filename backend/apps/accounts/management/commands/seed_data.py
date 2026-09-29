from django.core.management.base import BaseCommand
from apps.accounts.models import CustomUser
from apps.facilities.models import Organization, Facility, SmartMeter

class Command(BaseCommand):
    help = 'Seeds initial data for GreenGrid Phase 1'

    def handle(self, *args, **kwargs):
        # 1. Organization
        org, created = Organization.objects.get_or_create(
            tenant_id='GG-CORP-5021',
            defaults={'name': 'GreenGrid Campus', 'address': '123 Green Way'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Organization'))

        # 2. Facilities
        facilities_data = [
            {'name': 'Main Admin Block', 'facility_type': 'MAIN_ADMIN', 'area_sqft': 45000, 'floors': 5, 'status': 'ACTIVE'},
            {'name': 'Computer Lab & Data Center', 'facility_type': 'LAB', 'area_sqft': 28000, 'floors': 3, 'status': 'ACTIVE'},
            {'name': 'Factory & Advanced Workshops', 'facility_type': 'FACTORY', 'area_sqft': 65000, 'floors': 2, 'status': 'ACTIVE'},
            {'name': 'Hostel & Student Center', 'facility_type': 'HOSTEL', 'area_sqft': 38000, 'floors': 6, 'status': 'ACTIVE'},
            {'name': 'Canteen & Dining Complex', 'facility_type': 'CANTEEN', 'area_sqft': 12000, 'floors': 2, 'status': 'ACTIVE'},
        ]
        
        # Add 7 generic ones
        for i in range(1, 8):
            facilities_data.append({
                'name': f'Generic Block {i}', 'facility_type': 'OTHER', 'area_sqft': 10000, 'floors': 1, 'status': 'ACTIVE'
            })

        for data in facilities_data:
            fac, c = Facility.objects.get_or_create(
                name=data['name'], organization=org,
                defaults={
                    'facility_type': data['facility_type'],
                    'area_sqft': data['area_sqft'],
                    'floors': data['floors'],
                    'status': data['status']
                }
            )
            
            if c:
                # 3. SmartMeters
                SmartMeter.objects.get_or_create(
                    meter_id=f"MTR-{fac.id}-MAIN", facility=fac,
                    defaults={'meter_type': 'MAIN', 'rated_capacity_kw': 100.0, 'status': 'ACTIVE'}
                )
                SmartMeter.objects.get_or_create(
                    meter_id=f"MTR-{fac.id}-SUB1", facility=fac,
                    defaults={'meter_type': 'SUB', 'rated_capacity_kw': 50.0, 'status': 'ACTIVE'}
                )

        self.stdout.write(self.style.SUCCESS('Created Facilities and Meters'))

        # 4. Users
        users = [
            {'email': 'admin@greengrid.com', 'password': 'Admin@123', 'role': 'ADMIN', 'full_name': 'Dr. Elena Vance', 'is_staff': True, 'is_superuser': True},
            {'email': 'manager@greengrid.com', 'password': 'Manager@123', 'role': 'ENERGY_MANAGER', 'full_name': 'Energy Manager', 'is_staff': False, 'is_superuser': False},
            {'email': 'viewer@greengrid.com', 'password': 'Viewer@123', 'role': 'VIEWER', 'full_name': 'John Viewer', 'is_staff': False, 'is_superuser': False},
        ]

        for u in users:
            if not CustomUser.objects.filter(email=u['email']).exists():
                user = CustomUser.objects.create_user(
                    email=u['email'], password=u['password'],
                    role=u['role'], full_name=u['full_name'],
                    is_staff=u['is_staff'], is_superuser=u['is_superuser']
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data!'))
        self.stdout.write("Test Credentials:")
        self.stdout.write("admin@greengrid.com / Admin@123")
        self.stdout.write("manager@greengrid.com / Manager@123")
        self.stdout.write("viewer@greengrid.com / Viewer@123")
