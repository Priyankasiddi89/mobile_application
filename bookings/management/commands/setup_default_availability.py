from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta, time
from authentication.models import User
from bookings.models import ProviderAvailability, ProviderOffDay


class Command(BaseCommand):
    help = 'Set up default availability slots for all service providers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--provider-id',
            type=int,
            help='Set up availability for specific provider ID',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to create availability for (default: 30)',
        )

    def handle(self, *args, **options):
        provider_id = options.get('provider_id')
        days_ahead = options.get('days')
        
        # Default time slots
        default_slots = [
            (time(9, 0), time(12, 0)),   # 9 AM - 12 PM
            (time(12, 0), time(15, 0)),  # 12 PM - 3 PM
            (time(15, 0), time(18, 0)),  # 3 PM - 6 PM
            (time(18, 0), time(21, 0)),  # 6 PM - 9 PM
        ]
        
        if provider_id:
            try:
                provider = User.objects.get(id=provider_id, user_type='Service Provider')
                providers = [provider]
                self.stdout.write(f"Setting up availability for provider: {provider.username}")
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Provider with ID {provider_id} not found')
                )
                return
        else:
            providers = User.objects.filter(user_type='Service Provider')
            self.stdout.write(f"Setting up availability for {providers.count()} providers")
        
        start_date = date.today()
        
        for provider in providers:
            self.stdout.write(f"Processing provider: {provider.username}")
            
            slots_created = 0
            sundays_marked = 0
            
            for day_offset in range(days_ahead):
                current_date = start_date + timedelta(days=day_offset)
                
                # Check if it's Sunday (weekday 6)
                if current_date.weekday() == 6:  # Sunday
                    # Mark Sunday as off day if not already marked
                    off_day, created = ProviderOffDay.objects.get_or_create(
                        provider=provider,
                        date=current_date,
                        defaults={'reason': 'Default Sunday off'}
                    )
                    if created:
                        sundays_marked += 1
                else:
                    # Create availability slots for non-Sunday days
                    for start_time, end_time in default_slots:
                        slot, created = ProviderAvailability.objects.get_or_create(
                            provider=provider,
                            date=current_date,
                            start_time=start_time,
                            end_time=end_time,
                            defaults={'is_available': True}
                        )
                        if created:
                            slots_created += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ {provider.username}: {slots_created} slots created, {sundays_marked} Sundays marked off"
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS('Default availability setup completed!')
        )
