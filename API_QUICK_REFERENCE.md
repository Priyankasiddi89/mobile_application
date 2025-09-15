# 🚀 Home Services Platform - API Quick Reference

## 📋 **Essential Endpoints**

### **🔐 Authentication**
```bash
# Login
POST /api/auth/login/
{"username": "user", "password": "pass"}

# Get current user
GET /api/auth/me/
Headers: Authorization: Bearer <token>

# Register new user
POST /api/auth/register/
{"username": "user", "email": "email", "password": "pass", "user_type": "End User", "role": "Head of House"}

# Forgot password (email must be registered)
POST /api/auth/forgot-password/
{"email": "registered@example.com"}
```

### **🏷️ Services**
```bash
# Get all categories
GET /api/services/categories/

# Get subcategories
GET /api/services/subcategories/

# Provider: Register for service
POST /api/services/provider/register/
{"service_id": 1, "provider_price": 50.00}
```

### **📋 Bookings**
```bash
# Create booking
POST /api/bookings/create/
{"subcategory_id": 1, "service_date": "2024-01-15T10:00:00Z", "address": "123 Main St"}

# Get my bookings
GET /api/bookings/user/

# Provider: Get requests
GET /api/bookings/provider/requests/

# Provider: Accept booking
POST /api/bookings/{id}/accept/

# Provider: Complete booking
POST /api/bookings/{id}/complete/
{"payment_method": "cash"}
```

### **📅 Availability**
```bash
# Provider: Set availability
POST /api/bookings/availability/
{"date": "2024-01-15", "start_time": "09:00", "end_time": "17:00", "is_available": true}

# Provider: Mark off day
POST /api/bookings/off-days/
{"date": "2024-01-15", "reason": "Holiday"}

# Get provider slots
GET /api/bookings/provider/{id}/available-slots/?date=2024-01-15
```

### **⭐ Ratings**
```bash
# Rate provider
POST /api/bookings/rate-provider/
{"booking_id": 1, "provider_id": 2, "rating": 5, "review": "Excellent service!"}

# Provider: Respond to rating
POST /api/bookings/ratings/{id}/respond/
{"response": "Thank you for the feedback!"}
```

### **📊 Analytics**
```bash
# Customer dashboard stats
GET /api/analytics/customer/dashboard/

# Provider dashboard stats
GET /api/analytics/provider/dashboard/

# Provider earnings
GET /api/analytics/provider/earnings/
```

---

## 🔑 **Authentication Headers**

### **Required for Protected Endpoints**
```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

---

## 📊 **Common Response Formats**

### **Success Response**
```json
{
  "data": {...},
  "message": "Success message"
}
```

### **Error Response**
```json
{
  "error": "Error message",
  "detail": "Detailed description"
}
```

### **Permission Error**
```json
{
  "error": "You do not have permission to perform this action. Contact your administrator to grant 'permission_name' permission."
}
```

---

## 🎯 **User Types & Permissions**

### **End User**
- Create bookings
- View own bookings
- Rate providers
- Cancel own bookings

### **Service Provider**
- View booking requests
- Accept/decline requests
- Manage availability
- Complete bookings
- Respond to ratings

### **Platform Provider**
- Manage all users
- View platform analytics
- Manage permissions
- System administration

---

## 🔧 **Development Setup**

### **Start Backend**
```bash
cd mobile-app1
python manage.py runserver
# API: http://localhost:8000/api/
# Admin: http://localhost:8000/admin/
```

### **Start Frontend**
```bash
cd mobile-app1/frontend
npm run dev
# Frontend: http://localhost:3000
```

### **Database**
```bash
# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access admin
# URL: http://localhost:8000/admin/
# User: superuser1 / admin123
```

---

## 📋 **Status Codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## 🛠️ **Testing Examples**

### **Login & Get Token**
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Save token
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### **Create Booking**
```bash
curl -X POST http://localhost:8000/api/bookings/create/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subcategory_id": 1,
    "service_date": "2024-01-15T10:00:00Z",
    "notes": "Please call before arriving",
    "address": "123 Main St, City"
  }'
```

### **Get User Bookings**
```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/bookings/user/
```

---

## 📞 **Quick Support**

### **Common Issues**
1. **401 Unauthorized**: Check JWT token in Authorization header
2. **403 Forbidden**: User lacks required permissions
3. **400 Bad Request**: Check request body format
4. **404 Not Found**: Verify endpoint URL

### **Admin Access**
- **URL**: http://localhost:8000/admin/
- **Username**: superuser1
- **Password**: admin123

### **Database Tables**: 20 total
- Users, Permissions, Bookings, Services, Availability, Ratings

### **Total API Endpoints**: 50+
- Authentication: 7 endpoints
- Services: 6 endpoints  
- Bookings: 15 endpoints
- Analytics: 4 endpoints
- Marketplace: 6 endpoints
- Platform Admin: 6 endpoints
- Legacy: 10+ endpoints
