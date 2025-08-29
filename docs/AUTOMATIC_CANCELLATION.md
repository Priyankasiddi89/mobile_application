# Automatic Booking Cancellation System

This document explains the automatic cancellation system for expired bookings and how customer cancellations are tracked and displayed.

## Features

### 1. Automatic Cancellation of Expired Bookings
- **Purpose**: Automatically cancel bookings that have passed their service date/time without being completed
- **Status**: Bookings with status `pending`, `accepted`, or `confirmed` are eligible for auto-cancellation
- **Tracking**: Auto-cancelled bookings are marked with `cancelled_by = 'system'`

### 2. Enhanced Cancellation Tracking
- **Purpose**: Track who cancelled a booking (customer, provider, or system) and why
- **Cancellation Source**: `cancelled_by` field tracks the source of cancellation
- **Cancellation Reason**: `cancellation_reason` field stores detailed explanation
- **Display**: Service provider dashboard shows both source and reason
- **Integrity**: Maintains data integrity and provides clear audit trail

## Implementation

### Database Changes

The `Booking` model now includes enhanced cancellation tracking fields:

```python
cancelled_by = models.CharField(max_length=20, blank=True, null=True, choices=[
    ('customer', 'Customer'),
    ('provider', 'Service Provider'),
    ('system', 'System (Auto-cancelled)'),
])

cancellation_reason = models.TextField(max_length=500, blank=True, null=True,
                                     help_text="Reason for cancellation")
```

### Management Command

#### Usage

```bash
# Basic usage - cancel all expired bookings
python manage.py cancel_expired_bookings

# Preview what would be cancelled (dry run)
python manage.py cancel_expired_bookings --dry-run

# Add grace period (e.g., 2 hours after service time)
python manage.py cancel_expired_bookings --hours=2

# Verbose output for debugging
python manage.py cancel_expired_bookings --verbose --dry-run
```

#### Scheduling

Set up automatic execution using cron jobs:

```bash
# Run every hour
0 * * * * cd /path/to/project && python manage.py cancel_expired_bookings

# Run every 30 minutes
*/30 * * * * cd /path/to/project && python manage.py cancel_expired_bookings

# Run daily at 2 AM with 1-hour grace period
0 2 * * * cd /path/to/project && python manage.py cancel_expired_bookings --hours=1
```

#### Windows Task Scheduler

For Windows servers, create a scheduled task:

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily, hourly)
4. Set action to start a program:
   - Program: `python`
   - Arguments: `manage.py cancel_expired_bookings`
   - Start in: `C:\path\to\your\project`

### Frontend Display

#### Service Provider Dashboard

The service provider dashboard now shows comprehensive cancellation information:

- **Previous Bookings Section**: Shows who cancelled each booking and why
- **Status Badge**: Displays cancellation source below the status
- **Cancellation Reason**: Shows detailed reason below the source
- **Visual Indicators**:
  - "Customer cancelled" - when customer cancels
  - "Provider cancelled" - when provider cancels
  - "Auto-cancelled (expired)" - when system auto-cancels
- **Interactive Cancellation**: Prompts for reason when cancelling bookings

#### Display Examples

```
CANCELLED
Customer cancelled
Change of plans
```

```
CANCELLED
Auto-cancelled (expired)
Automatically cancelled due to expiry - service was scheduled for 2025-08-29 13:15 but was not completed
```

```
CANCELLED
Provider cancelled
Service provider unavailable
```

## API Changes

### Booking Serializer

The `BookingSerializer` now includes the `cancelled_by` field:

```python
class BookingSerializer(serializers.Serializer):
    # ... other fields ...
    cancelled_by = serializers.CharField(required=False, allow_blank=True)
```

### Customer Cancellation Endpoint

Updated to properly track cancellation source:

```python
# bookings/views.py - CustomerBookingView.put()
if new_status == 'cancelled':
    booking.status = 'cancelled'
    booking.cancelled_by = 'customer'  # Track that customer cancelled
    booking.save()
```

## Testing

### Manual Testing

1. **Create Test Booking**:
   ```bash
   python test_auto_cancel.py
   ```

2. **Test Dry Run**:
   ```bash
   python manage.py cancel_expired_bookings --dry-run --verbose
   ```

3. **Test Actual Cancellation**:
   ```bash
   python manage.py cancel_expired_bookings --verbose
   ```

### Verification Steps

1. **Check Database**: Verify `cancelled_by` field is set correctly
2. **Check Frontend**: Verify cancellation info displays in dashboard
3. **Check Logs**: Review command output for any errors

## Monitoring

### Command Output

The management command provides detailed output:

```
🔍 Checking for expired bookings...
   Current time: 2024-01-15 14:30:00+00:00
   Grace period: 0 hours
   Cutoff time: 2024-01-15 14:30:00+00:00
   Dry run mode: OFF
------------------------------------------------------------
⚠️  Found 3 expired booking(s) to cancel:
   📅 Booking #123: House Cleaning
      Customer: john_doe
      Provider: jane_cleaner
      Service Date: 2024-01-15 12:00:00+00:00
      Current Status: accepted
      Hours Passed: 2
      ✅ Cancelled (was accepted)
------------------------------------------------------------
✅ Successfully cancelled 3 expired booking(s)
```

### Error Handling

- **Database Errors**: Logged with booking ID for investigation
- **Permission Errors**: Should not occur (system has full access)
- **Network Errors**: Not applicable (local database operations)

## Best Practices

### Scheduling Frequency

- **High Traffic**: Every 15-30 minutes
- **Medium Traffic**: Every hour
- **Low Traffic**: Every 2-4 hours
- **Maintenance**: Daily with longer grace period

### Grace Period Guidelines

- **No Grace**: `--hours=0` (immediate cancellation)
- **Short Grace**: `--hours=1` (1 hour buffer)
- **Standard Grace**: `--hours=2` (2 hour buffer)
- **Extended Grace**: `--hours=4` (4 hour buffer for special cases)

### Monitoring

1. **Log Analysis**: Monitor command output for patterns
2. **Database Queries**: Track cancellation rates by source
3. **User Feedback**: Monitor customer complaints about auto-cancellations
4. **Provider Impact**: Track how auto-cancellations affect provider ratings

## Troubleshooting

### Common Issues

1. **Command Not Running**:
   - Check cron job syntax
   - Verify Python path and virtual environment
   - Check file permissions

2. **No Bookings Cancelled**:
   - Verify booking statuses in database
   - Check service_date values
   - Run with `--dry-run --verbose` to debug

3. **Frontend Not Showing Cancellation Info**:
   - Check API response includes `cancelled_by` field
   - Verify frontend code handles the field
   - Clear browser cache

### Debug Commands

```bash
# Check for expired bookings without cancelling
python manage.py cancel_expired_bookings --dry-run --verbose

# Test with different grace periods
python manage.py cancel_expired_bookings --dry-run --hours=24

# Check database directly
python manage.py shell
>>> from bookings.models import Booking
>>> Booking.objects.filter(status='cancelled', cancelled_by='system').count()
```
