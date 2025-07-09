# Django + MongoDB Authentication API

## Status

✅ Registration, login, logout, and authenticated endpoints are working and tested successfully (as of July 2025).

---

This backend provides authentication APIs using Django, MongoDB (via mongoengine), and JWT (SimpleJWT). Below are instructions for running the backend and testing the APIs using PowerShell's Invoke-WebRequest and Postman.

---

## Getting Started

### 1. Install Requirements

```powershell
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root with your MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
MONGO_DB_NAME=virtual_Presenz
```

### 3. Run the Server

```powershell
python manage.py runserver
```

---

## API Endpoints & Usage

### 1. Register a New User

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/register/" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username": "testuser", "password": "testpass123", "user_type": "End User", "role": "Head of House"}' `
  | Select-Object -ExpandProperty Content
```

### 2. Login (Get JWT Token)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username": "testuser", "password": "testpass123"}' `
  | Select-Object -ExpandProperty Content
```
- The response will include `"access"` token.

### 3. Logout (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/logout/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method POST `
  | Select-Object -ExpandProperty Content
```
- Replace `<access_token>` with the value from the login response.

### 4. Get Current User Info (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/me/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method GET `
  | Select-Object -ExpandProperty Content
```
- Replace `<access_token>` with the value from the login response.

### 5. List Active Users (Authenticated)

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/users/" `
  -Headers @{"Authorization"="Bearer <access_token>"} `
  -Method GET `
  | Select-Object -ExpandProperty Content
```

---

## Testing the API with Postman

You can also test all endpoints using [Postman](https://www.postman.com/):

### 1. Register a New User
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/register/`
- Go to the **Body** tab, select **raw** and **JSON**
- Paste this JSON:
  ```json
  {
    "username": "testuser",
    "password": "testpass123",
    "user_type": "End User",
    "role": "Head of House"
  }
  ```
- Click **Send**

### 2. Login (Get JWT Token)
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/login/`
- **Body**: raw, JSON:
  ```json
  {
    "username": "testuser",
    "password": "testpass123"
  }
  ```
- Click **Send**
- Copy the `access` token from the response

### 3. Logout (Authenticated)
- Set method to **POST**
- URL: `http://127.0.0.1:8000/api/auth/logout/`
- Go to the **Authorization** tab
- Set type to **Bearer Token**
- Paste your `access` token
- Click **Send**

### 4. Get Current User Info (Authenticated)
- Set method to **GET**
- URL: `http://127.0.0.1:8000/api/auth/me/`
- Go to the **Authorization** tab
- Set type to **Bearer Token**
- Paste your `access` token
- Click **Send**

### 5. List Active Users (Authenticated)
- Set method to **GET**
- URL: `http://127.0.0.1:8000/api/auth/users/`
- **Authorization**: Bearer Token, paste your `access` token
- Click **Send**

---

**Tips:**
- Always set the `Content-Type` header to `application/json` for POST requests.
- For authenticated endpoints, use the **Authorization** tab and select **Bearer Token**.
- You can save your requests in a Postman collection for easy reuse.

---

## User Types and Roles
- **End User:** Head of House, Family member
- **Service Provider:** Admin, Employee, Supervisor
- **Platform Provider:** Admin, Employee, Service Desk

---

## Troubleshooting
- If you see `Authentication credentials were not provided.`, check your Authorization header.
- If you see `Invalid user type` or `Invalid role for user type`, check your registration payload.
- If you have issues with PowerShell, try using Postman or HTTPie for testing.

---

## Next Steps
- Add more user/account features (profile update, password reset, etc.)
- Implement role-based permissions for certain endpoints
- Build out your main app logic and connect it to these APIs
- Start integrating with your Next.js frontend
- Add API documentation (Swagger/OpenAPI)

For further help, see the code comments or contact the project maintainer. 