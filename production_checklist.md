# Production Deployment Checklist

## Before Deployment
- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up email backend
- [ ] Configure CORS origins
- [ ] Set up SSL certificates
- [ ] Configure static files serving

## Security
- [ ] Enable HTTPS
- [ ] Set security headers
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Configure backups

## Commands to Run
```bash
# 1. Create .env file with production values
cp .env.example .env

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Collect static files
python manage.py collectstatic

# 5. Create superuser
python manage.py createsuperuser

# 6. Start with Gunicorn
gunicorn backend.wsgi:application -c gunicorn.conf.py

# 7. Build frontend
cd frontend
npm run build
npm start
```

## Server Setup
1. Install PostgreSQL
2. Install Nginx (reverse proxy)
3. Configure SSL with Let's Encrypt
4. Set up process manager (systemd/supervisor)