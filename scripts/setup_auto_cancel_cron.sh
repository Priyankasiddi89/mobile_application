#!/bin/bash

# Setup automatic booking cancellation cron job
# This script helps set up the cron job for automatic cancellation of expired bookings

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_PATH=$(which python)
MANAGE_PY="$PROJECT_DIR/manage.py"

echo "🔧 Setting up automatic booking cancellation cron job"
echo "Project directory: $PROJECT_DIR"
echo "Python path: $PYTHON_PATH"
echo "Manage.py path: $MANAGE_PY"

# Check if manage.py exists
if [ ! -f "$MANAGE_PY" ]; then
    echo "❌ Error: manage.py not found at $MANAGE_PY"
    exit 1
fi

# Test the command first
echo ""
echo "🧪 Testing the cancellation command..."
cd "$PROJECT_DIR"
$PYTHON_PATH manage.py cancel_expired_bookings --dry-run

if [ $? -ne 0 ]; then
    echo "❌ Error: Command test failed. Please check your Django setup."
    exit 1
fi

echo ""
echo "✅ Command test successful!"

# Create cron job entry
CRON_ENTRY="0 * * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py cancel_expired_bookings"

echo ""
echo "📋 Suggested cron job entry (runs every hour):"
echo "$CRON_ENTRY"

echo ""
echo "🔧 To add this cron job, run:"
echo "crontab -e"
echo ""
echo "Then add this line:"
echo "$CRON_ENTRY"

echo ""
echo "📝 Alternative schedules:"
echo "# Every 30 minutes:"
echo "*/30 * * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py cancel_expired_bookings"
echo ""
echo "# Every 15 minutes:"
echo "*/15 * * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py cancel_expired_bookings"
echo ""
echo "# Daily at 2 AM with 1-hour grace period:"
echo "0 2 * * * cd $PROJECT_DIR && $PYTHON_PATH manage.py cancel_expired_bookings --hours=1"

echo ""
echo "💡 To automatically add the hourly cron job, run:"
echo "echo '$CRON_ENTRY' | crontab -"

echo ""
echo "🔍 To view current cron jobs:"
echo "crontab -l"

echo ""
echo "✅ Setup complete! Choose your preferred schedule and add it to crontab."
