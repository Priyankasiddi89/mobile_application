# 🚀 Backend API Documentation

## 📋 Overview

This document describes the API-first architecture for the Home Services Platform. All database interactions happen through these well-defined API endpoints located in `backend/api/`.

## 🏗️ API Architecture

```
backend/api/
├── auth.py          # Authentication endpoints
├── services.py      # Service management endpoints
├── bookings.py      # Booking management endpoints
├── analytics.py     # Dashboard analytics endpoints
└── urls.py          # URL routing configuration
```

## 🔐 Authentication

All protected endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
```

## 📡 API Endpoints

### 🔑 Authentication API (`/api/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | ❌ |
| POST | `/api/auth/login/` | User login | ❌ |
| POST | `/api/auth/logout/` | User logout | ✅ |
| GET | `/api/auth/me/` | Get current user | ✅ |
| PUT | `/api/auth/me/update/` | Update profile | ✅ |
| GET | `/api/auth/users/` | Get all users (admin) | ✅ |

### 🛠️ Services API (`/api/services/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/services/categories/` | Get service categories | ❌ |
| GET | `/api/services/subcategories/` | Get all services | ❌ |
| GET | `/api/services/categories/{id}/services/` | Get services by category | ❌ |
| GET | `/api/services/provider/registered/` | Get provider's services | ✅ |
| GET | `/api/services/provider/available/` | Get available services | ✅ |
| POST | `/api/services/provider/register/` | Register for service | ✅ |
| DELETE | `/api/services/provider/unregister/` | Unregister from service | ✅ |

### 📅 Bookings API (`/api/bookings/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/create/` | Create booking | ✅ |
| GET | `/api/bookings/user/` | Get user's bookings | ✅ |
| GET | `/api/bookings/provider/` | Get provider's bookings | ✅ |
| GET | `/api/bookings/provider/requests/` | Get pending requests | ✅ |
| PUT | `/api/bookings/{id}/status/` | Update booking status | ✅ |
| POST | `/api/bookings/{id}/accept/` | Accept request | ✅ |
| POST | `/api/bookings/{id}/decline/` | Decline request | ✅ |
| POST | `/api/bookings/{id}/complete/` | Complete booking | ✅ |

### 📊 Analytics API (`/api/analytics/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/customer/dashboard/` | Customer dashboard stats | ✅ |
| GET | `/api/analytics/provider/dashboard/` | Provider dashboard stats | ✅ |
| GET | `/api/analytics/provider/earnings/` | Provider earnings data | ✅ |
| GET | `/api/analytics/platform/` | Platform analytics (admin) | ✅ |

## 🔄 API Usage Examples

### Register User
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

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepass123"
  }'
```

### Get Service Categories
```bash
curl -X GET http://localhost:8000/api/services/categories/
```

### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "subcategory_id": 1,
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Need deep cleaning for 3-bedroom apartment"
  }'
```

### Get Provider Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/analytics/provider/dashboard/ \
  -H "Authorization: Bearer <access_token>"
```

## 🎯 API Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error description",
  "details": { ... }
}
```

## 🔒 Permission Levels

### Public Endpoints
- Service categories and subcategories
- User registration and login

### Authenticated Endpoints
- User profile management
- Booking creation and management
- Dashboard analytics

### Role-Based Endpoints
- **End Users**: Customer bookings and analytics
- **Service Providers**: Provider bookings, requests, earnings
- **Platform Admins**: Platform-wide analytics and user management

## 🚀 Frontend Integration

### Update Frontend API Calls

Replace direct database calls with API calls:

```typescript
// Before (direct database interaction)
const services = await getServicesFromDB();

// After (API-first approach)
const response = await fetch('/api/services/categories/');
const services = await response.json();
```

### API Client Example
```typescript
class APIClient {
  private baseURL = 'http://localhost:8000/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

## 🔧 Development Guidelines

### Adding New Endpoints
1. Create function in appropriate API file (`auth.py`, `services.py`, etc.)
2. Add URL pattern to `backend/api/urls.py`
3. Test endpoint with curl or Postman
4. Update this documentation

### Error Handling
All API endpoints include try-catch blocks and return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

### Database Interaction
- ✅ **DO**: Use API endpoints for all database operations
- ❌ **DON'T**: Direct database queries in frontend or other components
- ✅ **DO**: Handle errors gracefully with proper HTTP status codes
- ❌ **DON'T**: Expose sensitive database information in API responses

---

**This API-first architecture ensures clean separation of concerns and makes the platform scalable and maintainable.** 🚀
