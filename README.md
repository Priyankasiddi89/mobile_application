# Django Authentication API (MongoDB)

## Setup

1. **Install dependencies:**
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
5. **Run the server:**
   ```sh
   python manage.py runserver
   ```

---

## API Endpoints

### 1. Register
- **POST** `/api/register/`
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
- **POST** `/api/login/`
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
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "mypassword", "user_type": "Service Provider", "role": "Admin"}'
```

### Login
```sh
curl -X POST http://localhost:8000/api/login/ \
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

---

## Notes
- All endpoints except `/api/register/` and `/api/login/` require a valid JWT access token in the `Authorization` header.
- User roles and types are validated according to the defined structure in the code.
- The `is_active` field is only visible in the database and user info endpoints. 