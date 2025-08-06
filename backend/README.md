# MediConnect Backend API

## Setup Instructions

### Local Development
1. Clone the repository and navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mediconnect
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Docker Development
1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
   This will start both the backend API and MongoDB.

### Production Deployment
1. Build the Docker image:
   ```bash
   docker build -t mediconnect-backend .
   ```
2. Run the container:
   ```bash
   docker run -p 5000:5000 -e MONGO_URI=your_mongo_uri -e JWT_SECRET=your_secret mediconnect-backend
   ```

## API Endpoints

### Auth & Doctor
- **POST /api/doctors/register**
  - Register a new doctor
  - Body: `{ "name": "Dr. Smith", "email": "dr@med.com", "password": "pass", "specialization": "Cardiology" }`
- **POST /api/doctors/login**
  - Login as doctor
  - Body: `{ "email": "dr@med.com", "password": "pass" }`
  - Response: `{ token, doctor }`
- **POST /api/doctors/logout** _(auth required)_
- **PATCH /api/doctors/availability** _(auth required)_
  - Toggle online/offline

### Pharmacy Device
- **POST /api/devices/register**
  - Register or update a device
  - Body: `{ "deviceId": "pharma-001", "gps": { "lat": 12.34, "lng": 56.78 } }`

### Session Management
- **POST /api/sessions/initiate**
  - Initiate a session from a device (matches available doctor)
  - Body: `{ "deviceId": "pharma-001", "patientName": "John Doe" }`
- **GET /api/sessions/active**
  - List all active sessions
- **PATCH /api/sessions/:sessionId/complete**
  - Complete a session
- **PATCH /api/sessions/:sessionId/cancel**
  - Cancel a session

### Admin APIs _(admin JWT required)_
- **GET /api/admin/online-doctors**
- **GET /api/admin/active-sessions**
- **GET /api/admin/devices**

## Authentication
- Use JWT in `Authorization: Bearer <token>` header for all protected routes.
- Admin and doctor tokens are separate (see models).

## WebSocket Events (Socket.IO)
- Connect to the backend server at the same port as HTTP (e.g., `ws://localhost:5000`)
- **doctorStatus**: `{ doctorId, isOnline }` — Emitted on doctor login/logout/availability change
- **sessionUpdate**: `{ type: 'initiated'|'completed'|'cancelled', session }` — Emitted on session lifecycle changes

## Logging & Audit
- All key actions are logged to `logs/combined.log` and `logs/error.log`.

## Environment Variables
- See `.env.example` for required variables.

## Postman Collection
- Import `postman_collection.json` into Postman for sample requests and automated token handling.

## Testing
- Use the provided Postman collection to test all endpoints
- The collection includes automatic token extraction for authenticated requests
