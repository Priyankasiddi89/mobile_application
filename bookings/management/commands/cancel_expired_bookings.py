"""
Django management command to automatically cancel expired bookings.
This command should be run periodically (e.g., via cron job) to maintain data integrity.

Usage:
    python manage.py cancel_expired_bookings
    python manage.py cancel_expired_bookings --dry-run  # Preview what would be cancelled
    python manage.py cancel_expired_bookings --hours=1  # Custom expiry hours (default: 0)
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from bookings.models import Booking
from django.db.models import Q


class Command(BaseCommand):
    help = 'Automatically cancel expired bookings that have passed their service date/time'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview what would be cancelled without making changes',
        )
        parser.add_argument(
            '--hours',
            type=int,
            default=0,
            help='Grace period in hours after service time before auto-cancelling (default: 0)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output for each booking processed',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        grace_hours = options['hours']
        verbose = options['verbose']
        
        # Calculate cutoff time (current time minus grace period)
        cutoff_time = timezone.now() - timedelta(hours=grace_hours)
        
        self.stdout.write(
            self.style.SUCCESS(f"🔍 Checking for expired bookings...")
        )
        self.stdout.write(f"   Current time: {timezone.now()}")
        self.stdout.write(f"   Grace period: {grace_hours} hours")
        self.stdout.write(f"   Cutoff time: {cutoff_time}")
        self.stdout.write(f"   Dry run mode: {'ON' if dry_run else 'OFF'}")
        self.stdout.write("-" * 60)

        # Find bookings that should be auto-cancelled
        # Only cancel bookings that are not yet completed, cancelled, or declined
        # and whose service_date has passed the cutoff time
        expired_bookings = Booking.objects.filter(
            service_date__lt=cutoff_time,
            status__in=['pending', 'accepted', 'confirmed']
        ).order_by('service_date')

        total_found = expired_bookings.count()
        
        if total_found == 0:
            self.stdout.write(
                self.style.SUCCESS("✅ No expired bookings found.")
            )
            return

        self.stdout.write(
            self.style.WARNING(f"⚠️  Found {total_found} expired booking(s) to cancel:")
        )

        cancelled_count = 0
        
        for booking in expired_bookings:
            time_passed = timezone.now() - booking.service_date
            hours_passed = int(time_passed.total_seconds() / 3600)
            
            if verbose or dry_run:
                self.stdout.write(
                    f"   📅 Booking #{booking.id}: {booking.subcategory.name}"
                )
                self.stdout.write(
                    f"      Customer: {booking.customer}"
                )
                self.stdout.write(
                    f"      Provider: {booking.provider or 'Unassigned'}"
                )
                self.stdout.write(
                    f"      Service Date: {booking.service_date}"
                )
                self.stdout.write(
                    f"      Current Status: {booking.status}"
                )
                self.stdout.write(
                    f"      Hours Passed: {hours_passed}"
                )
                
            if not dry_run:
                try:
                    # Update booking status to cancelled
                    old_status = booking.status
                    booking.status = 'cancelled'
                    booking.cancelled_by = 'system'  # Mark as system cancellation
                    booking.cancellation_reason = f'Automatically cancelled due to expiry - service was scheduled for {booking.service_date.strftime("%Y-%m-%d %H:%M")} but was not completed'
                    booking.save()
                    
                    cancelled_count += 1
                    
                    if verbose:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"      ✅ Cancelled (was {old_status})"
                            )
                        )
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f"      ❌ Error cancelling booking #{booking.id}: {str(e)}"
                        )
                    )
            else:
                if verbose:
                    self.stdout.write(
                        self.style.WARNING("      🔍 Would be cancelled (dry run)")
                    )
            
            if verbose or dry_run:
                self.stdout.write("")  # Empty line for readability

        # Summary
        self.stdout.write("-" * 60)
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"🔍 DRY RUN COMPLETE: {total_found} booking(s) would be cancelled"
                )
            )
            self.stdout.write("   Run without --dry-run to actually cancel these bookings")
        else:
            if cancelled_count > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Successfully cancelled {cancelled_count} expired booking(s)"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING("⚠️  No bookings were cancelled")
                )

        # Provide scheduling guidance
        if not dry_run and cancelled_count > 0:
            self.stdout.write("")
            self.stdout.write(
                self.style.SUCCESS("💡 TIP: Schedule this command to run automatically:")
            )
            self.stdout.write("   # Add to crontab (runs every hour)")
            self.stdout.write("   0 * * * * cd /path/to/project && python manage.py cancel_expired_bookings")
            self.stdout.write("")
            self.stdout.write("   # Or run every 30 minutes")
            self.stdout.write("   */30 * * * * cd /path/to/project && python manage.py cancel_expired_bookings")
