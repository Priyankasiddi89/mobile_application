# 📡 Home Services Platform - Complete API Documentation

## 🏗️ **API Architecture**

**Base URL**: `http://localhost:8000`  
**API Prefix**: `/api/`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

---

## 🔐 **Authentication APIs**

### **User Registration**
```http
POST /api/auth/register/
```
**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "user_type": "End User|Service Provider|Platform Provider",
  "role": "string",
  "first_name": "string",
  "last_name": "string"
}
```

### **User Login**
```http
POST /api/auth/login/
```
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "access": "jwt_token",
  "user_type": "string",
  "role": "string"
}
```

### **User Logout**
```http
POST /api/auth/logout/
```
**Headers:** `Authorization: Bearer <token>`

### **Forgot Password**
```http
POST /api/auth/forgot-password-clean/
```
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Success Response (200):**
```json
{
  "message": "Password has been reset successfully for username. A new password has been sent to user@example.com.",
  "new_password": "Abc123!@",
  "username": "username"
}
```
**Error Response (404) - Email Not Registered:**
```json
{
  "error": "No account found with this email address. Please check your email or register for a new account."
}
```
**Error Response (400) - Missing Email:**
```json
{
  "error": "Email is required"
}
```
**Note:** `new_password` and `username` are only returned in development mode.

### **Get Current User**
```http
GET /api/auth/me/
```
**Headers:** `Authorization: Bearer <token>`

### **Update User Profile**
```http
PUT /api/auth/me/update/
```
**Headers:** `Authorization: Bearer <token>`

### **Get User Profile**
```http
GET /api/auth/profile/
```
**Headers:** `Authorization: Bearer <token>`

### **Get All Users** (Admin)
```http
GET /api/auth/users/
```
**Headers:** `Authorization: Bearer <token>`

---

## 🏷️ **Services APIs**

### **Get Service Categories**
```http
GET /api/services/categories/
```

### **Get Service Subcategories**
```http
GET /api/services/subcategories/
```

### **Get Services by Category**
```http
GET /api/services/categories/{category_id}/services/
```

### **Provider Service Management**
```http
GET /api/services/provider/registered/
POST /api/services/provider/register/
DELETE /api/services/provider/unregister/
GET /api/services/provider/available/
```
**Headers:** `Authorization: Bearer <token>`

---

## 📋 **Booking APIs**

### **Create Booking**
```http
POST /api/bookings/create/
```
**Body:**
```json
{
  "subcategory_id": "integer",
  "service_date": "datetime",
  "notes": "string",
  "address": "string"
}
```

### **Get User Bookings**
```http
GET /api/bookings/user/
```

### **Get Provider Bookings**
```http
GET /api/bookings/provider/
```

### **Get Provider Requests**
```http
GET /api/bookings/provider/requests/
```

### **Booking Actions**
```http
POST /api/bookings/{booking_id}/accept/
POST /api/bookings/{booking_id}/decline/
POST /api/bookings/{booking_id}/complete/
POST /api/bookings/{booking_id}/cancel/
DELETE /api/bookings/{booking_id}/delete/
```

### **Cart Booking**
```http
POST /api/bookings/cart/create/
```

---

## ⭐ **Rating APIs**

### **Create Provider Rating**
```http
POST /api/bookings/rate-provider/
```
**Body:**
```json
{
  "booking_id": "integer",
  "provider_id": "integer",
  "rating": "integer (1-5)",
  "review": "string"
}
```

### **Get Provider Ratings**
```http
GET /api/bookings/provider/{provider_id}/ratings/
```

### **Respond to Rating**
```http
POST /api/bookings/ratings/{rating_id}/respond/
```

---

## 📅 **Availability APIs**

### **Manage Provider Availability**
```http
GET /api/bookings/availability/
POST /api/bookings/availability/
```
**Body (POST):**
```json
{
  "date": "date",
  "start_time": "time",
  "end_time": "time",
  "is_available": "boolean"
}
```

### **Manage Provider Off Days**
```http
GET /api/bookings/off-days/
POST /api/bookings/off-days/
DELETE /api/bookings/off-days/
```

### **Get Provider Available Slots**
```http
GET /api/bookings/provider/{provider_id}/available-slots/
```

---

## 📊 **Analytics APIs**

### **Customer Dashboard Stats**
```http
GET /api/analytics/customer/dashboard/
```

### **Provider Dashboard Stats**
```http
GET /api/analytics/provider/dashboard/
```

### **Provider Earnings**
```http
GET /api/analytics/provider/earnings/
```

### **Platform Analytics** (Admin)
```http
GET /api/analytics/platform/
```

---

## 🛒 **Marketplace APIs**

### **Register Service with Price**
```http
POST /api/marketplace/register-service/
```

### **Get Available Providers**
```http
GET /api/marketplace/service/{service_id}/providers/
```

### **Create Provider-Specific Booking**
```http
POST /api/marketplace/book-provider/
```

### **Rate Provider (Marketplace)**
```http
POST /api/marketplace/rate-provider/
```

### **Get Provider Profile**
```http
GET /api/marketplace/provider/{provider_id}/profile/
```

### **Get Provider Services**
```http
GET /api/marketplace/provider/{provider_id}/services/
```

---

## 🔑 **Permission APIs**

### **Get User Permissions**
```http
GET /api/user/permissions/
```
**Headers:** `Authorization: Bearer <token>`

---

## 👥 **Platform Provider Dashboard APIs**

### **Admin Profile**
```http
GET /api/platform_provider_dashboard/profile/
```

### **Users Management**
```http
GET /api/platform_provider_dashboard/users/
```

### **Services Management**
```http
GET /api/platform_provider_dashboard/services/
```

### **Platform Analytics**
```http
GET /api/platform_provider_dashboard/analytics/
```

### **Permission Management**
```http
GET /api/platform_provider_dashboard/permissions/
GET /api/platform_provider_dashboard/user-type-role-permissions/
PUT /api/platform_provider_dashboard/user-type-role-permissions/
```

---


## 📝 **Request/Response Examples**

### **Authentication Example**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Response
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user_type": "End User",
  "role": "Head of House"
}
```

### **Booking Example**
```bash
# Create Booking
curl -X POST http://localhost:8000/api/bookings/create/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subcategory_id": 1,
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Please call before arriving",
    "address": "123 Main St, City"
  }'
```

---

## 🔒 **Authentication & Authorization**

### **JWT Token Structure**
```json
{
  "user_id": "string",
  "user_type": "string",
  "role": "string",
  "exp": "timestamp",
  "token_type": "access"
}
```

### **User Types & Roles**
- **End User**: Head of House, Family member
- **Service Provider**: Admin, Employee, Supervisor  
- **Platform Provider**: Admin, Employee, Service Desk

### **Permission System**
- Role-based permissions via `UserTypeRolePermission`
- User-specific overrides via `UserPermissionOverride`
- 30+ granular permissions across 7 categories

---

## 📊 **Database Schema**

### **Core Tables**
- `authentication_user` - User accounts
- `bookings` - Service bookings
- `service_categories` - Service categories
- `service_subcategories` - Specific services
- `user_registered_services` - Provider services
- `provider_availability` - Time slots
- `provider_off_days` - Unavailable days
- `provider_ratings` - Customer reviews

---

## 🚀 **Getting Started**

1. **Start Django Server:**
   ```bash
   python manage.py runserver
   ```

2. **API Base URL:**
   ```
   http://localhost:8000/api/
   ```

3. **Admin Interface:**
   ```
   http://localhost:8000/admin/
   Username: superuser1
   Password: admin123
   ```

---

## 📋 **Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔍 **Detailed API Specifications**

### **Booking Status Flow**
```
pending → accepted → confirmed → completed
    ↓         ↓          ↓
cancelled  declined   cancelled
```



### **User Permission Categories**
1. **Profile Management** - Edit profile, view profile
2. **Service Management** - Register services, manage availability
3. **Booking Management** - Create, accept, decline, complete bookings
4. **Availability Management** - View/manage availability calendar
5. **Analytics** - View dashboard stats and earnings
6. **Rating Management** - Rate providers, respond to ratings
7. **Platform Administration** - User management, system settings

---

## 🛡️ **Error Handling**

### **Standard Error Response**
```json
{
  "error": "Error message",
  "detail": "Detailed error description",
  "code": "ERROR_CODE"
}
```

### **Validation Error Response**
```json
{
  "error": "Validation failed",
  "details": {
    "field_name": ["Error message for this field"],
    "another_field": ["Another error message"]
  }
}
```

### **Permission Error Response**
```json
{
  "error": "You do not have permission to perform this action. Contact your administrator to grant 'permission_name' permission."
}
```

---

## 📊 **Response Data Formats**

### **User Object**
```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "user_type": "string",
  "role": "string",
  "is_active": "boolean",
  "date_joined": "datetime"
}
```

### **Booking Object**
```json
{
  "id": "integer",
  "customer": "string",
  "provider": "string",
  "subcategory": {
    "id": "integer",
    "name": "string",
    "price": "decimal",
    "category": "string"
  },
  "service_date": "datetime",
  "total_price": "decimal",
  "status": "string",
  "payment_status": "string",
  "notes": "string",
  "address": "string",
  "created_at": "datetime"
}
```

### **Service Category Object**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "icon": "string",
  "gradient": "string",
  "subcategories": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "price": "decimal",
      "duration_hours": "decimal"
    }
  ]
}
```

---

## 🔧 **Development Tools**

### **API Testing with cURL**
```bash
# Set token variable
TOKEN="your_jwt_token_here"

# Get user bookings
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/bookings/user/

# Create a booking
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"subcategory_id": 1, "service_date": "2024-01-15T10:00:00Z"}' \
     http://localhost:8000/api/bookings/create/
```

### **API Testing with Postman**
1. **Set Base URL**: `http://localhost:8000`
2. **Add Authorization**: Bearer Token
3. **Set Headers**: `Content-Type: application/json`
4. **Import Collection**: Use the endpoints listed above

---

## 📈 **Rate Limiting & Performance**

### **Current Limits**
- No rate limiting implemented (development)
- JWT token expires in 60 minutes
- Database connection pooling enabled
- CORS enabled for localhost:3000

### **Recommended Production Settings**
- Implement rate limiting (100 requests/minute)
- Use Redis for session management
- Enable database query optimization
- Add API versioning (/api/v1/)

---

## 🔄 **API Versioning**

### **Current Version**: v1 (implicit)
### **Future Versioning Strategy**:
- `/api/v1/` - Current stable API
- `/api/v2/` - Future API versions
- Backward compatibility for 2 major versions

---

## 📞 **Support & Contact**

### **Development Team**
- **Backend**: Django REST Framework + PostgreSQL
- **Frontend**: Next.js + TypeScript
- **Database**: PostgreSQL with 20 tables
- **Authentication**: JWT with custom user model

### **API Status**
- **Total Endpoints**: 30+ API endpoints
- **Authentication**: JWT-based
- **Database**: PostgreSQL (20 tables)
- **Documentation**: Complete API specification
- **Admin Interface**: Django Admin at `/admin/`
