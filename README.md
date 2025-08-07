# MediConnect - Telemedicine Platform

A full-stack telemedicine platform with real-time doctor-patient interactions, pharmacy device registration, and comprehensive admin dashboard. The platform features robust real-time status updates for doctors and sessions, ensuring seamless communication between all components of the system.

## Deployed URL
- Frontend - https://medi-connect-seven-umber.vercel.app/login
- Backend - 

## 🚀 Features

### Backend (Node.js/Express)
- **RESTful APIs** for doctor, device, and session management
- **JWT Authentication** for secure access
- **MongoDB** with Mongoose ORM
- **WebSocket Integration** (Socket.IO) for real-time updates
  - Reliable doctor status synchronization across clients
  - Immediate session lifecycle event broadcasting
  - Enhanced error handling and reconnection logic
- **Comprehensive Logging** and audit trail
- **Docker Support** for easy deployment

### Frontend (React/Vite)
- **Modern Admin Dashboard** with real-time updates
- **Beautiful UI** with SCSS styling
- **Real-time Doctor Status Tracking**
  - Instant visual updates when doctors go online/offline
  - Automatic status synchronization across all clients
  - Reliable status persistence during session management
- **Session Management** with complete/cancel actions
  - Automatic doctor availability updates during session lifecycle
  - Real-time session status updates across all clients
- **Device Activity Map** with GPS coordinates
- **Responsive Design** for all devices

## 🛠️ Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Winston for logging
- Docker for containerization

### Frontend
- React 18 with Vite
- SCSS for styling
- Socket.IO Client
- React Router
- Axios for API calls
- Context API for state management

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose (for backend only)
- MongoDB (included in Docker setup)

## 🚀 Quick Start

### Option 1: Backend with Docker, Frontend Locally (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mediconnect
   ```

2. Start backend services with Docker:
   ```bash
   docker-compose up --build
   ```

3. In a new terminal, start the frontend:
   ```bash
   cd admin-frontend
   npm install
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Full Local Development

#### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mediconnect
   JWT_SECRET=your_jwt_secret_here
   ```

4. Start MongoDB (if not using Docker):
   ```bash
   # Install MongoDB locally or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. Start the backend:
   ```bash
   npm run dev
   ```

#### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd admin-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## 📚 API Documentation

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/doctors/register` - Register doctor
- `POST /api/doctors/login` - Doctor login

### Doctor Management
- `GET /api/admin/online-doctors` - Get online doctors
- `PATCH /api/doctors/availability` - Toggle availability

### Device Management
- `POST /api/devices/register` - Register pharmacy device

### Session Management
- `POST /api/sessions/initiate` - Start new session
- `GET /api/admin/active-sessions` - Get active sessions
- `PATCH /api/sessions/:id/complete` - Complete session
- `PATCH /api/sessions/:id/cancel` - Cancel session

### WebSocket Events
- `doctorStatus` - Doctor online/offline updates
  - Payload: `{ doctorId, status, isOnline }` 
  - Emitted when doctors log in/out or change availability
  - Emitted when sessions are initiated/completed (affecting doctor status)
  - Includes delayed re-emission to ensure client synchronization
- `sessionUpdate` - Session lifecycle events
  - Payload: `{ type: 'initiated'|'completed'|'cancelled', session }` 
  - Includes complete session object with doctor and device details
  - Triggers automatic UI updates across all connected clients

## 🎯 Usage

### Admin Dashboard
1. Login with admin credentials
2. View online doctors in real-time
3. Monitor active sessions
4. Complete or cancel sessions
5. View device activity map

### Doctor Registration
1. Register doctors via API
2. Doctors can log in and toggle availability
3. Real-time status updates in admin dashboard

### Device Registration
1. Register pharmacy devices with GPS coordinates
2. View device activity on the map
3. Monitor device usage

### Session Management
1. Initiate sessions from pharmacy devices
   - Automatically assigns available doctors
   - Updates doctor status to 'busy' in real-time
   - Updates device status to 'busy' in real-time
2. Match patients with available doctors
   - Smart matching algorithm based on doctor availability
   - Prevents double-booking through real-time status tracking
3. Monitor session progress in real-time
   - Live updates across all connected admin dashboards
   - Consistent state management through Socket.IO events
4. Complete or cancel sessions as needed
   - Automatically updates doctor status back to 'available'
   - Automatically updates device status back to 'available'
   - Broadcasts status changes to all connected clients

## 📁 Project Structure

```
mediconnect/
├── backend/                 # Node.js/Express API
│   ├── controllers/        # API controllers
│   │   ├── adminController.js    # Admin-related endpoints
│   │   ├── doctorController.js   # Doctor management and status updates
│   │   ├── deviceController.js   # Device registration and management
│   │   └── sessionController.js  # Session lifecycle management
│   ├── models/             # Mongoose models
│   │   ├── Admin.js        # Admin user schema
│   │   ├── Doctor.js       # Doctor schema with status tracking
│   │   ├── Device.js       # Pharmacy device schema
│   │   └── Session.js      # Session schema with lifecycle states
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Express and Socket.IO setup
│   ├── socket.js           # Socket.IO event handlers
│   ├── utils/              # Utilities and logging
│   ├── Dockerfile
│   └── README.md
├── admin-frontend/          # React admin dashboard
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── DoctorsTable.jsx  # Real-time doctor status display
│   │   │   ├── SessionsTable.jsx # Real-time session management
│   │   │   └── DeviceMap.jsx     # Device location display
│   │   ├── pages/          # Page components
│   │   │   ├── LoginPage.jsx     # Admin authentication
│   │   │   └── DashboardPage.jsx # Main dashboard view
│   │   ├── services/       # API services
│   │   │   ├── api.js           # API communication
│   │   │   └── socket.js        # Socket.IO client setup
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useSocket.js     # Socket event management hook
│   │   ├── context/        # React context
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   └── styles/         # SCSS styles
│   └── README.md
├── docker-compose.yml       # Backend and MongoDB setup
└── README.md               # This file
```

## 🔧 Development

### Backend Development
- API endpoints in `backend/src/routes/`
- Controllers in `backend/src/controllers/`
- Models in `backend/src/models/`
- Middleware in `backend/src/middleware/`

### Frontend Development
- Components in `admin-frontend/src/components/`
- Pages in `admin-frontend/src/pages/`
- Styles in `admin-frontend/src/styles/`
- Services in `admin-frontend/src/services/`

### Testing
- Use the provided Postman collection for API testing
- Test real-time features with multiple browser tabs
- Verify WebSocket connections in browser console

## 🚀 Deployment

### Backend Deployment
```bash
# Using Docker
cd backend
docker build -t mediconnect-backend .
docker run -p 5000:5000 -e MONGO_URI=your_mongo_uri -e JWT_SECRET=your_secret mediconnect-backend
```

### Frontend Deployment
```bash
# Build for production
cd admin-frontend
npm run build

# Deploy dist/ folder to any static hosting service:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3
# - Any web server
```

### Environment Variables
- Backend: `PORT`, `MONGO_URI`, `JWT_SECRET`
- Frontend: `VITE_API_URL`

## 📝 License

This project is created for evaluation purposes as a Full Stack Developer assignment.

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive logging for new features
3. Include real-time updates where appropriate
4. Test thoroughly with the provided Postman collection
5. Update documentation for new features
