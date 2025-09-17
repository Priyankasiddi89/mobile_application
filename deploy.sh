#!/bin/bash

echo "🚀 Starting deployment..."

# Install dependencies
pip install -r requirements.txt

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser if needed (optional)
# python manage.py createsuperuser --noinput

echo "✅ Deployment complete!"
echo "🌐 Start server with: gunicorn backend.wsgi:application -c gunicorn.conf.py"