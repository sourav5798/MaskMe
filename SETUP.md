# 🚀 MaskMe - Complete Setup Guide

This guide will help you set up and run the complete MaskMe project with all features integrated.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

## 🔧 Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=10000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/maskme
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

**Important:** Replace `JWT_SECRET` with a strong random string (at least 32 characters) for production.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:10000
```

### 3. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) and update MONGO_URI in backend/.env
```

## 🏃 Running the Application

### Start Backend

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:10000`

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## ✅ Features Completed

### Backend
- ✅ User authentication (signup/login) with JWT
- ✅ Alias creation (email & phone) with expiry
- ✅ Alias management (list, delete, stats)
- ✅ OTP/message receiving and storage
- ✅ Real-time notifications via Socket.io
- ✅ Automatic expiry cleanup (cron job)
- ✅ Rate limiting
- ✅ CORS configuration

### Frontend
- ✅ Authentication UI (Login/Signup)
- ✅ Dashboard with real-time data
- ✅ Alias creation and management
- ✅ Message/OTP viewing
- ✅ Real-time Socket.io integration
- ✅ Error handling and loading states
- ✅ Token management
- ✅ Beautiful interstellar-inspired UI

## 🔐 Authentication Flow

1. User signs up or logs in
2. JWT token is stored in localStorage
3. Token is sent with all API requests
4. Backend validates token on protected routes
5. User can access dashboard and create aliases

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Aliases
- `POST /api/alias/create` - Create new alias (requires auth)
- `GET /api/alias/` - Get all user aliases (requires auth)
- `DELETE /api/alias/:id` - Delete alias (requires auth)
- `GET /api/alias/stats` - Get alias statistics (requires auth)

### OTP/Messages
- `POST /api/otp/receive` - Receive OTP/message
- `GET /api/otp/:aliasId` - Get messages for alias (requires auth)

### Health
- `GET /api/health` - Health check

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:10000/api/health

# Signup
curl -X POST http://localhost:10000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login (use token from signup response)
curl -X POST http://localhost:10000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection (MONGO_URI)
- Verify JWT_SECRET is set
- Check if port 10000 is available

### Frontend can't connect to backend
- Verify VITE_API_URL in frontend/.env
- Check backend is running
- Check CORS settings in backend

### Authentication issues
- Clear localStorage in browser
- Check JWT_SECRET matches
- Verify token is being sent in Authorization header

## 📝 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 10000)
- `CLIENT_URL` - Frontend URL for CORS
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing (REQUIRED)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 🎯 Next Steps

1. Set up MongoDB (local or Atlas)
2. Configure environment variables
3. Install dependencies
4. Start backend and frontend
5. Create an account and start using MaskMe!

## 📚 Additional Resources

- See `README.md` for project overview
- Check `frontend/src/README.md` for design system details
- Review API routes in `backend/routes/`

