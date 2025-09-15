# 🏠 Home Services Platform

A comprehensive full-stack web application for home services management, connecting customers with service providers through a modern, scalable platform.

## 🚀 Project Overview

This platform features:
- **Django REST API** backend with **PostgreSQL** database
- **Next.js** frontend with modern React components and TypeScript
- **JWT authentication** with role-based access control
- **Multi-provider booking system** with intelligent request management
- **5-star rating & review system** with customer feedback and provider analytics
- **Real-time service catalog** with 7 categories and 26+ services
- **Advanced provider dashboard** with earnings tracking, ratings, and analytics
- **Customer dashboard** with booking history, rating options, and status tracking
- **Modern, responsive UI** with consistent purple gradient design system
- **API-first architecture** for scalability and mobile-ready integration

## ✨ **Key Features**

- **Multi-Provider Booking System**: Fair competition among service providers
- **5-Star Rating & Review System**: Customer feedback with provider analytics and marketplace integration
- **Real-time Analytics**: Monthly/weekly earnings tracking with completion-date accuracy and rating metrics
- **Smart Request Management**: Automatic conflict prevention and filtering
- **Modern UI**: Consistent purple gradient design across all components with rating displays
- **API-First Architecture**: Clean REST API structure for scalability

## ⚡ **Quick Start (5 Minutes)**

### **Prerequisites**
- **Python 3.9+** installed
- **Node.js 18+** installed
- **PostgreSQL 12+** running
- **Git** for cloning

### **Step 1: Clone & Setup Backend**
```bash
# Clone the repository
git clone <repository-url>
cd mobile-app1

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **Step 2: Database Setup**
```bash
# Complete automated database setup (recommended)
python setup_database.py

# This script will:
# ✅ Create all database tables and relationships
# ✅ Set up user permissions and roles
# ✅ Populate service categories and subcategories
# ✅ Create test users for all roles
# ✅ Configure constraints and indexes

# OR Manual setup (if needed)
python manage.py migrate
python manage.py createsuperuser
```

### **Step 3: Start Backend Server**
```bash
python manage.py runserver
# Backend will be available at: http://localhost:8000
```

### **Step 4: Setup Frontend (New Terminal)**
```bash
cd frontend
npm install
npm run dev
# Frontend will be available at: http://localhost:3000
```

### **Step 5: Access Application**
Open your browser and go to: **http://localhost:3000**

## 🎯 **Login Credentials**

After running `setup_database.py`, you can login with these test accounts:

| Username | Password | User Type | Role | Dashboard Access |
|----------|----------|-----------|------|------------------|
| `admin` | `admin123` | Platform Provider | Admin | Platform Provider Dashboard + Django Admin |
| `test_customer` | `testpass123` | End User | Head of House | End User Dashboard |
| `test_provider` | `testpass123` | Service Provider | Admin | Service Provider Dashboard |
| `family_member` | `testpass123` | End User | Family Member | End User Dashboard |
| `provider_employee` | `testpass123` | Service Provider | Employee | Service Provider Dashboard |

**Note**: You can create additional users through the registration page or Django admin interface.

## 🌐 **Application URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **🏠 Frontend** | http://localhost:3000 | Main application interface |
| **🔧 Backend API** | http://localhost:8000/api/ | REST API endpoints |
| **⚙️ Django Admin** | http://localhost:8000/admin/ | Database management |

## 📱 **How to Use the Platform**

### **👤 For Customers (End Users)**
1. **Register/Login** at http://localhost:3000
2. **Browse Services** - View 7 categories with 26+ services
3. **Select Provider** - Choose from available service providers
4. **Book Service** - Select date, time, and add details
5. **Track Booking** - Monitor status in "My Requests"
6. **Rate & Review** - After completion, rate the service provider

### **🔧 For Service Providers**
1. **Register/Login** as Service Provider
2. **Register Services** - Choose which services to offer
3. **Set Pricing** - Set custom prices for your services
4. **Manage Requests** - Accept/decline incoming bookings
5. **Track Earnings** - View analytics and earnings data
6. **Manage Schedule** - Set availability and off days

### **🛡️ For Platform Admins**
1. **Login** with admin credentials
2. **User Management** - View and manage all users
3. **Platform Analytics** - Monitor platform performance
4. **Permissions** - Manage user roles and permissions
5. **Django Admin** - Direct database management

## 🔄 **Platform Workflow**

### **📋 Booking Process**
1. **Customer** browses services and selects a provider
2. **Booking Request** is sent to the chosen provider
3. **Provider** accepts or declines the request
4. **Service Delivery** happens at scheduled time
5. **Completion** - Provider marks service as complete
6. **Rating & Payment** - Customer rates and pays for service

### **🏗️ Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Django REST Framework | API server and business logic |
| **Database** | PostgreSQL | Data storage and management |
| **Frontend** | Next.js + TypeScript | User interface and interactions |
| **Authentication** | JWT Tokens | Secure user authentication |
| **API Architecture** | RESTful | Clean, scalable API design |

## 🛠️ **Development Commands**

### **Database Setup & Management**
```bash
# Complete automated database setup (recommended)
python setup_database.py            # Creates tables, permissions, services, test users

# Verify database configuration
python verify_database_setup.py     # Checks all database components

# Generate database documentation
python database_schema_documentation.py # Creates detailed schema docs

# Manual database operations
python manage.py makemigrations      # Create new migrations
python manage.py migrate             # Apply migrations
python manage.py dbshell             # Access PostgreSQL shell
python manage.py shell               # Django shell with database access
```

### **Backend Commands**
```bash
# Start development server
python manage.py runserver

# Create superuser
python manage.py createsuperuser

# Check migration status
python manage.py showmigrations

# Reset database (WARNING: Deletes all data)
python manage.py flush
```

### **Frontend Commands**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Install dependencies
npm install
```

## 🔧 **Troubleshooting**

### **Database Verification**
```bash
# Verify database setup is complete and correct
python verify_database_setup.py

# This will check:
# ✅ Database connection
# ✅ All required tables exist
# ✅ Data is properly populated
# ✅ Test users are created
# ✅ Relationships are working
# ✅ Constraints are in place
```

### **Common Issues & Solutions**

#### **Database Issues**
- **Connection failed**: Check PostgreSQL is running and credentials in `backend/settings.py`
- **Tables missing**: Run `python setup_database.py`
- **No test users**: Run `python setup_database.py` to create test accounts
- **Permission errors**: Verify database user has CREATE/ALTER permissions
- **Migration conflicts**: Delete migration files and run `python manage.py makemigrations`

```bash
# Complete database reset (WARNING: Deletes all data)
python manage.py flush
python setup_database.py

# Verify setup after reset
python verify_database_setup.py
```

#### **Backend Issues**
- **Port 8000 in use**: Kill process with `taskkill /f /im python.exe` (Windows) or `pkill python` (Linux/Mac)
- **Import errors**: Ensure virtual environment is activated and dependencies installed
- **API errors**: Check Django logs and verify database connection

#### **Frontend Issues**
- **Port 3000 in use**: Use `npm run dev -- -p 3001`
- **Module not found**: Run `npm install` in frontend directory
- **API connection failed**: Ensure backend is running on port 8000
- **Login issues**: Verify test user credentials and backend API status

---

## �️ **Database Schema & Setup**

### **📊 Database Overview**
The platform uses **PostgreSQL** as the primary database with a well-structured schema designed for scalability and performance.

### **🏗️ Core Database Tables**

| Table Name | Purpose | Key Relationships |
|------------|---------|-------------------|
| `authentication_user` | User accounts and authentication | Primary user table |
| `bookings` | Service booking requests | Links to users and services |
| `service_categories` | Service category definitions | Parent to subcategories |
| `service_subcategories` | Specific services offered | Child of categories |
| `user_registered_services` | Provider service registrations | Links users to services |
| `provider_ratings` | Customer ratings and reviews | Links bookings to ratings |
| `provider_availability` | Provider time slot management | User availability schedules |
| `provider_off_days` | Provider unavailable days | User off-day management |
| `authentication_permission` | System permissions | Permission definitions |
| `authentication_usertyperolepermission` | Role-based permissions | Maps roles to permissions |
| `authentication_userpermissionoverride` | User-specific permission overrides | Individual user permissions |

### **🔑 Key Relationships & Constraints**

#### **User Management**
- `authentication_user` → Primary user table with user types and roles
- Foreign key relationships to bookings, ratings, availability
- Unique constraints on username and email

#### **Service Management**
- `service_categories` (1) → `service_subcategories` (many)
- `service_subcategories` → `bookings` (booking requests)
- `user_registered_services` → Many-to-many between users and services

#### **Booking System**
- `bookings` table with status tracking and payment management
- Foreign keys to users (customer/provider) and services
- Declined provider tracking and cancellation management

#### **Rating System**
- `provider_ratings` with unique constraints per booking
- Links customers, providers, and bookings
- Supports both ratings and written reviews

#### **Availability Management**
- `provider_availability` for time slot management
- `provider_off_days` for unavailable dates
- Unique constraints prevent scheduling conflicts

### **🛠️ Database Setup Commands**

#### **Quick Setup (Recommended)**
```bash
# Complete automated setup
python setup_database.py
```

#### **Manual Setup (Step by Step)**
```bash
# 1. Run migrations to create tables
python manage.py makemigrations
python manage.py migrate

# 2. Create superuser
python manage.py createsuperuser

# 3. Generate database documentation
python database_schema_documentation.py

# 4. Check database status
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT COUNT(*) FROM authentication_user;')
    print(f'Users: {cursor.fetchone()[0]}')
"
```

### **📋 Database Configuration**

#### **Environment Variables**
```env
# Database Configuration (backend/settings.py)
DB_NAME=virtual_presenz
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

#### **PostgreSQL Requirements**
- **Version**: PostgreSQL 12+ recommended
- **Extensions**: None required (uses standard PostgreSQL features)
- **Encoding**: UTF-8
- **Timezone**: UTC

### **🔧 Database Management Commands**

```bash
# View all tables
python manage.py dbshell -c "\dt"

# Check migration status
python manage.py showmigrations

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: Deletes all data)
python manage.py flush

# Database shell access
python manage.py dbshell

# Django shell with database access
python manage.py shell
```

### **📊 Sample Data & Test Users**

The `setup_database.py` script creates:

#### **Test Users**
| Username | Password | User Type | Role | Purpose |
|----------|----------|-----------|------|---------|
| `admin` | `admin123` | Platform Provider | Admin | Platform administration |
| `test_customer` | `testpass123` | End User | Head of House | Customer testing |
| `test_provider` | `testpass123` | Service Provider | Admin | Provider testing |
| `family_member` | `testpass123` | End User | Family Member | Family user testing |
| `provider_employee` | `testpass123` | Service Provider | Employee | Employee testing |

#### **Service Categories (7 categories, 26+ services)**
- 🧹 **Cleaning Services** (4 services)
- 🔧 **Plumbing Services** (4 services)
- ⚡ **Electrical Services** (4 services)
- ❄️ **HVAC Services** (4 services)
- 🔨 **Carpentry Services** (4 services)
- 🎨 **Painting Services** (4 services)
- 🌱 **Landscaping Services** (4 services)

#### **Permissions System (25+ permissions)**
- Dashboard access permissions
- Booking management permissions
- Service registration permissions
- User management permissions
- Analytics and reporting permissions
- Rating and review permissions
- Availability management permissions

### **🔍 Database Monitoring & Maintenance**

#### **Performance Monitoring**
```bash
# Check database size
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT pg_size_pretty(pg_database_size(current_database()));')
    print(f'Database size: {cursor.fetchone()[0]}')
"

# Check table row counts
python database_schema_documentation.py
```

#### **Backup & Restore**
```bash
# Backup database
pg_dump -h localhost -U postgres virtual_presenz > backup.sql

# Restore database
psql -h localhost -U postgres virtual_presenz < backup.sql

# Django data export/import
python manage.py dumpdata > data.json
python manage.py loaddata data.json
```

---

## �📡 **API Documentation**

This platform uses a clean API-first architecture where **all database interactions happen through well-defined API endpoints** located in `backend/api/`.

### **API Base URL**
```
http://localhost:8000/api/
```

### **🔑 Authentication API (`/api/auth/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | ❌ |
| POST | `/api/auth/login/` | User login | ❌ |
| POST | `/api/auth/logout/` | User logout | ✅ |
| GET | `/api/auth/me/` | Get current user info | ✅ |
| PUT | `/api/auth/me/update/` | Update user profile | ✅ |
| GET | `/api/auth/users/` | Get all users (admin only) | ✅ |

### **🛠️ Services API (`/api/services/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/services/categories/` | Get service categories | ❌ |
| GET | `/api/services/subcategories/` | Get all services | ❌ |
| GET | `/api/services/categories/{id}/services/` | Get services by category | ❌ |
| GET | `/api/services/provider/registered/` | Get provider's services | ✅ |
| GET | `/api/services/provider/available/` | Get available services | ✅ |
| POST | `/api/services/provider/register/` | Register for service | ✅ |
| DELETE | `/api/services/provider/unregister/` | Unregister from service | ✅ |

### **📅 Bookings API (`/api/bookings/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/create/` | Create new booking | ✅ |
| GET | `/api/bookings/user/` | Get user's bookings | ✅ |
| GET | `/api/bookings/provider/` | Get provider's bookings (all) | ✅ |
| GET | `/api/bookings/provider/?status=active` | Get active bookings only | ✅ |
| GET | `/api/bookings/provider/?status=completed` | Get completed bookings only | ✅ |
| GET | `/api/bookings/provider/requests/` | Get pending requests | ✅ |
| PUT | `/api/bookings/{id}/status/` | Update booking status | ✅ |
| POST | `/api/bookings/{id}/accept/` | Accept request | ✅ |
| POST | `/api/bookings/{id}/decline/` | Decline request | ✅ |
| POST | `/api/bookings/{id}/complete/` | Complete booking | ✅ |
| POST | `/api/bookings/{id}/cancel/` | Cancel booking | ✅ |

### **⭐ Ratings & Reviews API (`/api/bookings/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/rate-provider/` | Submit rating and review for completed service | ✅ |
| GET | `/api/bookings/provider/{id}/ratings/` | Get all ratings and reviews for a provider | ❌ |

**Rating System Features:**
- **1-5 Star Ratings**: Customers can rate completed services
- **Written Reviews**: Optional detailed feedback with rating
- **Duplicate Prevention**: One rating per booking per customer
- **Average Calculation**: Automatic average rating computation
- **Review Filtering**: Distinguishes between total ratings and written reviews
- **Provider Analytics**: Ratings included in provider dashboard stats

**Request/Response Examples:**

**Submit Rating:**
```json
POST /api/bookings/rate-provider/
{
  "booking_id": "123",
  "rating": 5,
  "review": "Excellent service! Very professional and on time."
}
```

**Get Provider Ratings:**
```json
GET /api/bookings/provider/6/ratings/
{
  "provider_id": 6,
  "provider_name": "spc",
  "total_ratings": 3,
  "total_reviews": 2,
  "average_rating": 4.0,
  "ratings": [
    {
      "id": 1,
      "rating": 5,
      "review": "Excellent service!",
      "customer": "Priyanka",
      "created_at": "2025-01-08T10:30:00Z",
      "booking_id": 21
    }
  ]
}
```

### **📊 Analytics API (`/api/analytics/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/customer/dashboard/` | Customer dashboard stats | ✅ |
| GET | `/api/analytics/provider/dashboard/` | Provider dashboard stats with ratings, earnings & performance | ✅ |
| GET | `/api/analytics/provider/earnings/` | Detailed earnings with monthly/weekly breakdown | ✅ |
| GET | `/api/analytics/platform/` | Platform analytics (admin only) | ✅ |

**Enhanced Provider Dashboard Stats:**
```json
{
  "total_bookings": 15,
  "pending_requests_count": 3,
  "active_bookings_count": 2,
  "completed_bookings_count": 10,
  "completion_rate": 85.5,
  "average_rating": 4.2,
  "total_reviews": 8,
  "total_earnings": 1250.00,
  "monthly_earnings": 450.00,
  "weekly_earnings": 120.00
}
```

### **🏪 Marketplace API (`/api/marketplace/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/marketplace/register-service/` | Provider registers service with custom pricing | ✅ |
| GET | `/api/marketplace/service/{id}/providers/` | Get available providers with pricing, ratings & reviews | ✅ |
| POST | `/api/marketplace/book-provider/` | Create booking for specific provider | ✅ |
| GET | `/api/marketplace/provider/{id}/profile/` | Get provider profile with ratings and services | ✅ |
| PUT | `/api/marketplace/service-registration/{id}/` | Update provider's service pricing and availability | ✅ |

**Enhanced Provider Listings:**
```json
{
  "service": "Door & Window Repair",
  "providers": [
    {
      "provider_id": 6,
      "provider_name": "spc",
      "provider_price": 150.00,
      "rating": 4.2,
      "total_ratings": 5,
      "total_reviews": 3,
      "completed_bookings": 12,
      "description": "Professional repair service with quality guarantee"
    }
  ]
}
```

### **🔄 API Features**

- **Smart Filtering**: Bookings API supports status filtering (`?status=active`, `?status=completed`)
- **Enhanced Analytics**: Monthly and weekly earnings calculated from completion dates
- **Conflict Prevention**: Declined requests automatically filtered per provider
- **Rating System**: Complete 5-star rating and review system with duplicate prevention
- **Review Intelligence**: Distinguishes between total ratings and written reviews
- **Provider Rankings**: Automatic average rating calculation and marketplace integration
- **Quality Control**: Customer feedback system for service improvement
- **Trust Building**: Transparent rating display helps customers choose providers
- **Real-time Updates**: All endpoints return fresh data with proper caching
- **Error Handling**: Comprehensive error responses with helpful messages

---

## ⭐ **Rating & Review System**

### **🎯 Overview**
Complete 5-star rating and review system that builds trust between customers and service providers.

### **✨ Features**

#### **For Customers:**
- ⭐ **Rate completed services** with 1-5 stars
- 💬 **Write detailed reviews** about their experience
- 👀 **View provider ratings** before booking services
- 🔍 **Read detailed reviews** by clicking on ratings
- 🚫 **Duplicate prevention** - cannot rate the same service twice

#### **For Service Providers:**
- 📊 **Dashboard analytics** showing average rating and review counts
- 📝 **Detailed ratings page** with all customer feedback
- 👤 **See who rated** and when reviews were submitted
- 📈 **Performance insights** to improve service quality

#### **For Platform:**
- 🏪 **Marketplace integration** - ratings displayed to help customers choose
- 🔢 **Automatic calculations** - average ratings computed in real-time
- 🎯 **Quality control** - customer feedback drives service improvement
- 🤝 **Trust building** - transparent rating system builds confidence

### **🔧 Technical Implementation**

#### **Smart Review Logic:**
- **Total Ratings**: Count of all star ratings (e.g., 5 users rated)
- **Written Reviews**: Count of ratings with review text (e.g., 3 left comments)
- **Display Logic**: Only shows reviews with actual text content
- **Empty States**: Intelligent messages based on rating vs review counts

#### **Data Structure:**
```json
{
  "provider_ratings": {
    "total_ratings": 5,      // All star ratings
    "total_reviews": 3,      // Only ratings with text
    "average_rating": 4.2,   // Calculated from all ratings
    "ratings": [
      {
        "rating": 5,
        "review": "Excellent service!",
        "customer": "John Doe",
        "created_at": "2025-01-08T10:30:00Z"
      }
    ]
  }
}
```

#### **Integration Points:**
- **Marketplace**: Shows ratings in provider listings
- **Dashboard**: Provider analytics include rating metrics
- **Booking Flow**: Rating option appears after service completion
- **Reviews Modal**: Detailed review display for customers

---

## 🛠️ **Development**

## 📊 **Project Structure**

```
home-services-platform/
├── 📁 backend/                 # Django REST API
│   ├── 📁 api/                # API endpoints
│   ├── 📄 settings.py         # Django configuration
│   └── 📄 urls.py            # URL routing
├── 📁 frontend/               # Next.js application
│   ├── 📁 app/               # App router pages
│   ├── 📁 components/        # Reusable components
│   └── 📄 package.json       # Dependencies
├── 📁 authentication/         # User management
├── 📁 bookings/              # Booking system
├── 📁 platform_provider_dashboard/ # Admin dashboard
├── 📁 service_provider/      # Provider features
├── 📄 manage.py              # Django management
├── 📄 requirements.txt       # Python dependencies
└── 📄 README.md             # This file
```

## 🔗 **API Reference**

### **Base URL**: `http://localhost:8000/api/`

### **🔐 Authentication Endpoints**
- `POST /auth/register/` - Register new user
- `POST /auth/login/` - User login
- `GET /auth/me/` - Get current user info
- `PUT /auth/me/update/` - Update user profile
- `POST /auth/forgot-password-clean/` - Reset password

### **🛠️ Service Management**
- `GET /services/categories/` - Get service categories
- `GET /services/subcategories/` - Get all services
- `GET /services/provider/registered/` - Get provider's services
- `POST /services/provider/register/` - Register for service

### **📋 Booking Operations**
- `POST /bookings/create-cart/` - Create booking with cart
- `GET /bookings/user/` - Get user's bookings
- `GET /bookings/provider/` - Get provider's bookings
- `GET /bookings/provider/requests/` - Get pending requests
- `POST /bookings/{id}/accept/` - Accept booking request
- `POST /bookings/{id}/decline/` - Decline booking request

### **⭐ Rating & Reviews**
- `POST /bookings/rate-provider/` - Submit rating and review
- `GET /bookings/provider/{id}/ratings/` - Get provider ratings

### **📊 Analytics**
- `GET /analytics/provider/dashboard/` - Provider dashboard stats
- `GET /analytics/provider/earnings/` - Provider earnings data
- `GET /platform_provider_dashboard/analytics/` - Platform analytics

**Total Active APIs**: 32 endpoints

### **📝 Example API Calls**

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepass123",
    "user_type": "End User",
    "role": "Head of House"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepass123"
  }'
```

#### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "subcategory_id": "1",
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Need deep cleaning for 3-bedroom apartment"
  }'
```

#### Get Service Categories
```bash
curl http://localhost:8000/api/services/categories/
```

#### Get Provider Earnings
```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8000/api/analytics/provider/earnings/
```

#### Register Service with Custom Price (Provider)
```bash
curl -X POST http://localhost:8000/api/marketplace/register-service/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <provider_token>" \
  -d '{
    "service_id": 1,
    "provider_price": 750.00,
    "description": "Professional cleaning with eco-friendly products",
    "is_available": true
  }'
```

#### Get Available Providers for Service (Customer)
```bash
curl -H "Authorization: Bearer <customer_token>" \
  http://localhost:8000/api/marketplace/service/1/providers/
```

#### Book Specific Provider (Customer)
```bash
curl -X POST http://localhost:8000/api/marketplace/book-provider/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "provider_id": 2,
    "service_id": 1,
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Need deep cleaning for 3-bedroom apartment"
  }'
```

#### Rate Provider (Customer)
```bash
curl -X POST http://localhost:8000/api/marketplace/rate-provider/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "booking_id": 1,
    "rating": 5,
    "review": "Excellent service, very professional!"
  }'
```

#### Submit Rating and Review (Customer)
```bash
curl -X POST http://localhost:8000/api/bookings/rate-provider/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <customer_token>" \
  -d '{
    "booking_id": "123",
    "rating": 5,
    "review": "Excellent service! Very professional and completed work on time. Highly recommended!"
  }'
```

#### Get Provider Ratings and Reviews
```bash
curl http://localhost:8000/api/bookings/provider/6/ratings/
```

#### Get Provider Dashboard with Ratings
```bash
curl -H "Authorization: Bearer <provider_token>" \
  http://localhost:8000/api/analytics/provider/dashboard/
```

---

## � **Features Overview**

### **� Core Features**
- ✅ **User Registration & Authentication** - JWT-based secure login
- ✅ **Service Catalog** - 7 categories with 26+ services
- ✅ **Multi-Provider Booking** - Choose from available providers
- ✅ **Real-time Status Tracking** - From booking to completion
- ✅ **Rating & Review System** - 5-star ratings with written reviews
- ✅ **Provider Analytics** - Earnings, ratings, and performance metrics
- ✅ **Admin Dashboard** - Platform management and analytics
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### **🔐 Security Features**
- �️ **JWT Authentication** - Secure token-based authentication
- � **Role-based Access Control** - Different permissions for user types
- � **Permission System** - Granular control over feature access
- 🔐 **Password Reset** - Secure email-based password recovery

### **📊 Analytics & Reporting**
- 📈 **Provider Dashboard** - Earnings, bookings, and ratings
- 📋 **Customer Dashboard** - Booking history and status tracking
- 🏢 **Platform Analytics** - Overall platform performance metrics
- 💰 **Earnings Tracking** - Monthly and weekly revenue reports

## 🚀 **Production Deployment**

### **Environment Variables**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### **Production Setup**
```bash
# Install production dependencies
pip install gunicorn psycopg2-binary

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000

# Frontend production build
cd frontend
npm run build
npm start
```

---

## 📞 **Support & Help**

### **Getting Help**
- 📖 **Documentation**: Check this README and API documentation
- 🐛 **Issues**: Report bugs or request features via GitHub issues
- 💬 **Discussions**: Join community discussions for questions

### **Common Questions**
- **Q**: How do I reset the database?
  **A**: Run `python manage.py flush` (WARNING: Deletes all data)
- **Q**: How do I add new services?
  **A**: Use Django admin or modify the populate_services command
- **Q**: How do I change user permissions?
  **A**: Use the Platform Provider Dashboard or Django admin

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Submit** a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎉 **Acknowledgments**

- Built with **Django REST Framework** for robust API development
- Powered by **Next.js** for modern frontend experience
- Designed with **PostgreSQL** for reliable data management
- Secured with **JWT** authentication

---

**🏠 Built with ❤️ for connecting customers with reliable home service providers**

*Ready to transform the home services industry? Get started in 5 minutes!*
