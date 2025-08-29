# 🏠 Home Services Platform

A comprehensive full-stack web application for home services management, connecting customers with service providers throug
h a modern, scalable platform.

## 🚀 Project Overview

This platform features:
- **Django REST API** backend with **PostgreSQL** database
- **Next.js** frontend with modern React components and TypeScript
- **JWT authentication** with role-based access control
- **Multi-provider booking system** with intelligent request management
- **5-star rating & review system** with customer feedback and provider analytics
- **Real-time service catalog** with 6 categories and 24+ services
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

```bash
# 1. Clone and setup backend
git clone <repository-url>
cd home-services-platform
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Setup database (PostgreSQL required)
python manage.py migrate
python create_superuser_if_needed.py
python create_clean_permissions.py
python update_services_database.py
python create_test_users_postgresql.py

# 3. Start backend
python manage.py runserver
# 4. Setup frontend (new terminal)
cd frontend
npm install
npx next dev

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Login: test_customer / testpass123
```

## 🚀 **Detailed Setup Guide**

### **Prerequisites**
- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 12+** database
- **Git** for version control

### **1. Backend Setup (Django + PostgreSQL)**

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Setup database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python create_superuser_if_needed.py
   python create_clean_permissions.py
   python update_services_database.py
   python create_test_users_postgresql.py
   ```

3. **Start backend server:**
   ```bash
   python manage.py runserver
   ```

### **2. Frontend Setup (Next.js)**

1. **Navigate to frontend:**
   ```bash
   cd frontend
   npm install
   npx next dev
   ```

### **3. Access the Application**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application interface |
| **Backend API** | http://localhost:8000 | REST API endpoints |
| **Django Admin** | http://localhost:8000/admin | Database management |

### **4. Test with Demo Accounts**

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `test_customer` | `testpass123` | End User | Customer dashboard, booking services |
| `test_provider` | `testpass123` | Service Provider | Provider dashboard, manage requests |
| `admin` | `admin123` | Platform Admin | Full system access |
| **`superuser1`** | **Your password** | **Django Superuser** | **Auto-redirects to Django admin** |

## 🔄 **How It Works**

1. **Customers** browse services and create booking requests
2. **Service Providers** register for services and compete for requests
3. **Smart matching** connects customers with qualified providers
4. **Real-time tracking** from booking to completion and payment

## 🏗️ **Technology Stack**

- **Backend**: Django REST Framework + PostgreSQL
- **Frontend**: Next.js + TypeScript
- **Authentication**: JWT tokens
- **API**: RESTful endpoints under `/api/`

---

## 📡 **API Documentation**

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

### **Essential Commands**
```bash
# Backend
python manage.py runserver           # Start Django server

# Frontend
npx next dev                         # Start Next.js development server

# Database Setup
python create_clean_permissions.py   # Setup user permissions
python update_services_database.py   # Populate service catalog
python create_test_users_postgresql.py # Create test users
```

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

## 📋 **Recent Updates**

### **🆕 Version 2.1.0 - Rating & Review System**
*Released: January 2025*

#### **New Features:**
- ⭐ **Complete Rating System** - 5-star ratings with written reviews
- 📊 **Enhanced Provider Analytics** - Rating metrics in dashboard
- 🏪 **Marketplace Integration** - Ratings displayed in provider listings
- 🔍 **Review Intelligence** - Smart filtering between ratings and reviews
- 🚫 **Duplicate Prevention** - One rating per booking per customer
- 📱 **Responsive UI** - Beautiful rating modals and displays

#### **New API Endpoints:**
- `POST /api/bookings/rate-provider/` - Submit ratings and reviews
- `GET /api/bookings/provider/{id}/ratings/` - Get provider ratings
- Enhanced `/api/analytics/provider/dashboard/` with rating data
- Enhanced `/api/marketplace/service/{id}/providers/` with ratings

#### **Technical Improvements:**
- **Smart Review Logic** - Distinguishes total ratings vs written reviews
- **Real-time Calculations** - Automatic average rating computation
- **Enhanced Data Models** - New ProviderRating model with relationships
- **Improved UX** - Only display meaningful review content

#### **Bug Fixes:**
- ✅ Fixed booking number display in provider dashboard
- ✅ Corrected API endpoint references (`/api/auth/me/`)
- ✅ Improved error handling for rating submissions
- ✅ Enhanced empty state messages for better UX

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for connecting customers with reliable home service providers**
