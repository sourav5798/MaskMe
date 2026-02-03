# 🛡️ MaskMe

**Disposable Digital Identity Generator** – A full-stack application that lets users create temporary email and phone aliases without any registration or login. Protect your privacy by using disposable identities instead of sharing your real contact information.

---

## 🎯 Overview

MaskMe generates disposable email and phone aliases on demand through a beautiful, interstellar-inspired web interface. Users can create aliases instantly without any authentication - each browser session gets its own anonymous session ID for tracking aliases.

The system provides:
- **No Registration Required** - Use immediately without signup/login
- **Anonymous Sessions** - Each browser session gets a unique session ID
- **Temporary Aliases** - Set expiry times from 1 hour to 24 hours
- **Real-time Updates** - Socket.io integration for live notifications
- **Beautiful UI** - Interstellar-inspired design with nebula backgrounds

---

## ✨ Features

### Core Features
- ✅ **Create Email Aliases** - Generate unique disposable email addresses
- ✅ **Create Phone Aliases** - Generate temporary phone numbers
- ✅ **Set Expiry Times** - Control alias lifetime (1h, 6h, 12h, 24h)
- ✅ **View Messages/OTPs** - See all incoming messages for your aliases
- ✅ **Delete Aliases** - Remove aliases anytime
- ✅ **Real-time Notifications** - Get instant updates via Socket.io
- ✅ **Anonymous Usage** - No login or registration required
- ✅ **Session-based Tracking** - Aliases linked to browser session

### Technical Features
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Socket.io for live updates
- **Styling**: Tailwind CSS with custom interstellar theme
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React hooks and context

---

## 📁 Project Structure

```
DevLock/
├── backend/                    # Node.js + Express API server
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── env.js              # Environment configuration
│   ├── controllers/
│   │   ├── aliasController.js  # Alias CRUD operations
│   │   └── otpController.js    # OTP/message handling
│   ├── cron/
│   │   └── expiryCleanup.js    # Automatic alias cleanup
│   ├── middlewares/
│   │   └── rateLimiter.js      # Rate limiting
│   ├── models/
│   │   ├── Alias.js            # Alias schema
│   │   ├── Message.js          # Message schema
│   │   └── User.js             # User schema (legacy, not used)
│   ├── routes/
│   │   ├── aliasRoutes.js      # Alias API routes
│   │   └── otpRoutes.js        # OTP API routes
│   ├── sockets/
│   │   └── notifications.js    # Socket.io setup
│   ├── utils/
│   │   ├── aliasHelpers.js     # Alias metadata helpers
│   │   ├── generateAlias.js    # Alias generation logic
│   │   ├── emailService.js     # Email service (placeholder)
│   │   └── smsService.js       # SMS service (placeholder)
│   ├── server.js               # Express server entry point
│   └── package.json
│
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx   # Main dashboard component
│   │   │   ├── LandingSplash.tsx # Landing page
│   │   │   ├── NebulaBackground.tsx # Animated background
│   │   │   ├── GlassCard.tsx   # Glassmorphism card
│   │   │   ├── StatusBadge.tsx # Status indicators
│   │   │   ├── Toast.tsx       # Toast notifications
│   │   │   └── ui/             # UI component library
│   │   ├── services/
│   │   │   ├── api.ts          # API service layer
│   │   │   └── socket.ts       # Socket.io client
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── README.md                    # This file
└── SETUP.md                     # Setup instructions
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevLock
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**

   Create `backend/.env`:
   ```env
   PORT=10000
   CLIENT_URL=http://localhost:3000
   MONGO_URI=mongodb://localhost:27017/maskme
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:10000
   ```

5. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas and update MONGO_URI in backend/.env
   ```

6. **Run the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Open `http://localhost:3000` in your browser
   - No login required - start creating aliases immediately!

---

## 📡 API Endpoints

### Alias Management

#### Create Alias
```http
POST /api/alias/create
Content-Type: application/json
X-Session-ID: <session-id>

{
  "type": "email" | "phone",
  "expiryDuration": 3600000  // milliseconds (1 hour = 3600000)
}
```

**Response:**
```json
{
  "_id": "...",
  "alias": "mask_abc123@maskme.dev",
  "type": "email",
  "userId": "anon_1234567890_xyz",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T01:00:00.000Z",
  "isExpired": false,
  "status": "Active",
  "timeRemaining": 3600000
}
```

#### Get All Aliases
```http
GET /api/alias/
X-Session-ID: <session-id>
```

#### Delete Alias
```http
DELETE /api/alias/:id
X-Session-ID: <session-id>
```

#### Get Alias Statistics
```http
GET /api/alias/stats
X-Session-ID: <session-id>
```

### OTP/Messages

#### Receive OTP/Message
```http
POST /api/otp/receive
Content-Type: application/json

{
  "aliasId": "...",
  "content": "Your verification code is: 123456",
  "sender": "service@example.com"
}
```

#### Get Messages for Alias
```http
GET /api/otp/:aliasId
```

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "mongo": "connected"
}
```

---

## 🔧 How It Works

### Anonymous Session System

1. **Session Creation**: When a user first visits the app, a unique session ID is generated and stored in `localStorage`
2. **Session ID Format**: `anon_<timestamp>_<random>`
3. **Alias Tracking**: All aliases created in a session are linked to that session ID
4. **Persistence**: Session ID persists across page refreshes via localStorage
5. **Privacy**: Each browser/device gets its own session - no cross-device tracking

### Alias Generation

- **Email Aliases**: Format: `mask_<session-part>_<random>@maskme.dev`
- **Phone Aliases**: Format: `+1-XXX-XX-X` (placeholder - can be customized)
- **Uniqueness**: Guaranteed by combining session ID with random string

### Expiry System

- Aliases have configurable expiry times (1h, 6h, 12h, 24h)
- Expired aliases are automatically cleaned up by a cron job (runs hourly)
- Frontend shows time remaining for each alias

### Real-time Updates

- Socket.io connection established on dashboard load
- Users join "rooms" for each alias to receive notifications
- When a message arrives for an alias, all connected clients in that room get notified

---

## 🎨 Design System

### Theme
- **Dark Mode**: Deep space aesthetic with nebula backgrounds
- **Colors**: 
  - Primary: `#6C63FF` (Violet)
  - Secondary: `#5CE1E6` (Aqua)
  - Background: `#0D0D0D` (Deep Black)
  - Text: `#EDEDED` (Light Gray)

### Components
- **Glassmorphism**: Frosted glass effect cards
- **Nebula Background**: Animated 3-layer parallax background
- **Smooth Animations**: Framer Motion with cinematic easing
- **Responsive**: Works on desktop and mobile

---

## 🛠️ Development

### Backend Scripts
```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-reload)
```

### Frontend Scripts
```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
```

### Environment Variables

#### Backend (.env)
- `PORT` - Server port (default: 10000)
- `CLIENT_URL` - Frontend URL for CORS
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret (legacy, not actively used)

#### Frontend (.env)
- `VITE_API_URL` - Backend API URL

---

## 📝 Key Features Explained

### No Authentication Required
- Users can start using the app immediately
- No signup, login, or account creation needed
- Each browser session is automatically tracked via session ID

### Session-Based Tracking
- Session ID stored in browser localStorage
- Persists across page refreshes
- Each browser/device has its own isolated session
- Aliases are scoped to the session that created them

### Automatic Cleanup
- Cron job runs every hour to delete expired aliases
- Keeps database clean and performant
- Expired aliases are automatically removed

### Real-time Notifications
- Socket.io provides instant updates
- No need to refresh to see new messages
- Efficient room-based broadcasting

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Verify MongoDB is running: `mongod` or check Atlas connection
- Check `MONGO_URI` in `backend/.env`
- Ensure MongoDB is accessible from your network

**Port Already in Use**
- Change `PORT` in `backend/.env`
- Or kill the process using port 10000

### Frontend Issues

**Can't Connect to Backend**
- Verify `VITE_API_URL` in `frontend/.env`
- Check backend is running on the correct port
- Check browser console for CORS errors

**Aliases Not Loading**
- Check browser console for errors
- Verify session ID is in localStorage
- Check Network tab to see API responses

### Common Issues

**"No token provided" Error**
- This shouldn't happen anymore - if it does, restart the backend server
- Clear browser cache and localStorage
- Hard refresh (Ctrl+Shift+R)

**Aliases Not Persisting**
- Check MongoDB connection
- Verify session ID is being sent in headers
- Check backend logs for errors

---

## 🔮 Future Enhancements

Potential features for future development:

- [ ] Email forwarding to real email addresses
- [ ] SMS forwarding to real phone numbers
- [ ] Custom alias domains
- [ ] Alias analytics and statistics
- [ ] Export aliases to CSV/JSON
- [ ] Browser extension for quick alias generation
- [ ] Mobile app (React Native)
- [ ] Premium features (longer expiry, custom domains)
- [ ] Email templates and auto-replies
- [ ] Alias sharing between sessions

---

## 📄 License

[Add your license here]

---

## 👥 Contributing

[Add contribution guidelines here]

---

## 📞 Support

For issues, questions, or contributions, please [open an issue](link-to-issues) or [contact the maintainers](link-to-contact).

---

## 🎯 Project Status

✅ **Production Ready** - All core features implemented and tested
- Anonymous session system working
- Alias creation and management functional
- Real-time notifications operational
- Beautiful UI with interstellar theme
- No authentication required

---

**Built with ❤️ using React, Node.js, and MongoDB**
