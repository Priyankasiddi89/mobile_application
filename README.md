# Home Services App: Django Backend & Next.js Frontend

## Project Overview
This project is a full-stack web application for home services, featuring:
- **Django** backend (with MongoDB)
- **Next.js** frontend (React)
- JWT authentication with user roles and types

---

## User Structure
```
├── End User
│   ├── Head of House
│   └── Family Member
│
├── Service Provider
│   ├── Admin
│   ├── Employee
│   └── Supervisor
│
└── Platform Provider (Hidden)
    ├── Admin
    ├── Employee
    └── Service Desk
```
*Platform Provider is not available in the UI for registration.*

---

## Backend Setup (Django)

1. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
2. **Set up your .env file:**
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
   MONGO_DB_NAME=<dbname>
   ```
3. **Apply migrations:**
   ```sh
   python manage.py makemigrations users
   python manage.py migrate
   ```
4. **Create a superuser (optional):**
   ```sh
   python manage.py createsuperuser
   ```
5. **Run the backend server:**
   ```sh
   python manage.py runserver
   ```
   The backend will be available at [http://localhost:8000](http://localhost:8000)

---

## Frontend Setup (Next.js)

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```
2. **Install frontend dependencies:**
   ```sh
   npm install
   ```
3. **Run the frontend development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Authentication Flow
- **Login:** `/login` (username, password)
- **Sign Up:** `/signup` (username, password, user type, role)
  - User type and role are selected via dropdowns
  - Only End User and Service Provider types are available for registration

---

## API Endpoints (Backend)

### Register
- **POST** `/api/auth/register/`
- **Request Body:**
  ```json
  {
    "username": "alice",
    "password": "mypassword",
    "user_type": "Service Provider",
    "role": "Admin"
  }
  ```

### Login
- **POST** `/api/auth/login/`
- **Request Body:**
  ```json
  {
    "username": "alice",
    "password": "mypassword"
  }
  ```

### Other Endpoints
- `/api/auth/logout/` (POST)
- `/api/auth/me/` (GET, JWT required)
- `/api/auth/users/` (GET, JWT required)

---

## Troubleshooting
- Ensure both backend and frontend servers are running.
- Use Node.js 18.18.0 or higher for the frontend.
- Use Python 3.8+ for the backend.
- If you get 404 errors for API endpoints, check your Django `urls.py` configuration.
- For CORS issues, ensure Django CORS headers are configured if accessing from a different port.

---

## Notes
- Backend dependencies are in `requirements.txt`.
- Frontend dependencies are managed by npm in `frontend/package.json`.
- All endpoints except `/api/auth/register/` and `/api/auth/login/` require a valid JWT access token in the `Authorization` header.

---

## API Endpoints

### 1. Register
- **POST** `/api/auth/register/`
- **Request Body (JSON):**
  ```json
  {
    "username": "alice",
    "password": "mypassword",
    "user_type": "Service Provider",
    "role": "Admin"
  }
  ```
- **Response:**
  ```json
  { "msg": "User registered successfully" }
  ```

### 2. Login
- **POST** `/api/auth/login/`
- **Request Body (JSON):**
  ```json
  {
    "username": "alice",
    "password": "mypassword"
  }
  ```
- **Response:**
  ```json
  {
    "refresh": "<refresh_token>",
    "access": "<access_token>",
    "user_type": "Service Provider",
    "role": "Admin"
  }
  ```

### 3. Get Current User
- **GET** `/api/current_user/`
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  {
    "id": 1,
    "username": "alice",
    "user_type": "Service Provider",
    "role": "Admin",
    "is_active": true
  }
  ```

### 4. Get All Active Users
- **GET** `/api/active_users/`
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "username": "alice",
      "user_type": "Service Provider",
      "role": "Admin",
      "is_active": true
    },
    ...
  ]
  ```

### 5. Get All Users
- **GET** `/api/all_users/`
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "username": "alice",
      "user_type": "Service Provider",
      "role": "Admin",
      "is_active": true
    },
    ...
  ]
  ```

### 6. Protected Endpoint Example
- **GET** `/api/protected-endpoint/`
- **Headers:**
  - `Authorization: Bearer <access_token>`
- **Response (if allowed):**
  ```json
  {
    "msg": "Hello, alice! You are a Admin in Service Provider."
  }
  ```
- **Response (if not allowed):**
  ```json
  { "detail": "You do not have permission to access this endpoint." }
  ```

---

## Testing with curl

### Register
```sh
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "mypassword", "user_type": "Service Provider", "role": "Admin"}'
```

### Login
```sh
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "mypassword"}'
```

### Get Current User
```sh
curl -X GET http://localhost:8000/api/current_user/ \
  -H "Authorization: Bearer <access_token>"
```

### Get All Active Users
```sh
curl -X GET http://localhost:8000/api/active_users/ \
  -H "Authorization: Bearer <access_token>"
```

### Get All Users
```sh
curl -X GET http://localhost:8000/api/all_users/ \
  -H "Authorization: Bearer <access_token>"
```

### Protected Endpoint
```sh
curl -X GET http://localhost:8000/api/protected-endpoint/ \
  -H "Authorization: Bearer <access_token>"
``` 