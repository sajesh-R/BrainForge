# LMS Auth Module

A full-stack Authentication Module for the Learning Management System.

## Folder Structure

```
lms/
├── backend/                 # Node.js + Express REST API
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   └── authController.js # Register & Login logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification middleware
│   ├── models/
│   │   └── User.js           # Mongoose User schema
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth/register, /api/auth/login
│   │   └── userRoutes.js     # /api/user/profile (protected)
│   ├── .env                  # Environment variables
│   └── server.js             # Express entry point
│
└── frontend/                # React application
    └── src/
        ├── api/
        │   └── auth.js       # Axios client with JWT interceptor
        ├── components/
        │   └── AuthContext.js # Auth state & localStorage management
        ├── pages/
        │   ├── Register.js   # Registration form
        │   ├── Login.js      # Login form
        │   └── Dashboard.js  # Protected dashboard
        ├── App.js            # Root component / routing
        └── App.css           # Global styles
```

## Setup & Run

### Prerequisites
- Node.js ≥ 16
- MongoDB running locally (`mongodb://localhost:27017`)

### Backend
```bash
cd backend
npm install
npm run dev       # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start         # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint              | Auth Required | Description                  |
|--------|-----------------------|---------------|------------------------------|
| POST   | /api/auth/register    | No            | Register a new user          |
| POST   | /api/auth/login       | No            | Login and receive JWT token  |
| GET    | /api/user/profile     | Yes (Bearer)  | Get authenticated user info  |

## Auth Flow

```
Register → Validate → Encrypt Password (bcrypt) → Store in DB
Login    → Validate → Verify Password → Generate JWT Token
Token    → Sent to Frontend → Stored in localStorage
Frontend → Sends Token in Authorization Header (Bearer)
Backend  → Verifies Token (JWT) → Grants / Denies Access
```
