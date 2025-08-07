# MediConnect Admin Frontend

A modern React admin dashboard for the MediConnect telemedicine platform, featuring real-time updates and session management. The dashboard provides robust real-time tracking of doctor status and session lifecycle events, ensuring administrators always have the most up-to-date information.

## Features

- **Real-time Dashboard**: Live updates for doctor status and session changes
  - Instant visual feedback when doctors go online/offline
  - Automatic status updates during session initiation/completion
  - Reliable status synchronization across all clients
- **Enhanced Session Management**: 
  - Complete and cancel active sessions with real-time status propagation
  - Automatic doctor availability updates during session lifecycle
  - Delayed refresh mechanism to ensure data consistency
- **Device Activity Map**: View registered pharmacy devices with GPS coordinates
- **Modern UI**: Beautiful SCSS-styled interface with responsive design
- **Authentication**: Secure admin login with JWT token management
- **Advanced WebSocket Integration**: 
  - Robust Socket.IO implementation with error handling
  - Component-specific socket event listeners with unique IDs
  - Comprehensive logging for debugging and monitoring
  - Automatic reconnection and state recovery

## Tech Stack

- **React 18** with Vite
- **SCSS** for styling
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Backend API running (see backend README)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd admin-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DoctorsTable.jsx   # Real-time doctor status display
│   │                      # - Uses useSocket for real-time updates
│   │                      # - Implements status refresh mechanism
│   │                      # - Includes detailed logging
│   ├── SessionsTable.jsx  # Real-time session management
│   │                      # - Handles session lifecycle events
│   │                      # - Updates doctor status automatically
│   │                      # - Implements delayed refresh for consistency
│   └── DeviceMap.jsx      # Device location display
├── context/            # React Context providers
│   └── AuthContext.jsx    # Authentication state management
├── hooks/              # Custom React hooks
│   └── useSocket.js       # Socket event management
│                          # - Component-specific event listeners
│                          # - Unique component IDs for tracking
│                          # - Comprehensive event logging
│                          # - Automatic cleanup on unmount
├── pages/              # Page components
│   ├── LoginPage.jsx      # Admin authentication
│   └── DashboardPage.jsx  # Main dashboard with real-time updates
├── services/           # API and Socket.IO services
│   ├── api.js             # API communication with Axios
│   └── socket.js          # Socket.IO client setup
│                          # - Connection/disconnection handling
│                          # - Detailed event logging
│                          # - Error handling and reconnection
├── utils/              # Utility functions
│   └── constants.js       # API endpoints and Socket events
├── styles/             # SCSS stylesheets
│   └── main.scss          # Global styles and variables
└── App.jsx              # Main app component with routing
```

## API Integration

The frontend connects to the backend API endpoints:

- **Authentication**: `/api/admin/login`
- **Doctors**: `/api/admin/online-doctors`
- **Sessions**: `/api/admin/active-sessions`
- **Devices**: `/api/admin/devices`

## Real-time Features

### WebSocket Events
- `doctorStatus`: Updates when doctors log in/out or toggle availability
  - Payload: `{ doctorId, status, isOnline }` 
  - Emitted during doctor login/logout, availability toggle, and session lifecycle changes
  - Includes delayed re-emission to ensure client synchronization
  - Comprehensive logging for troubleshooting
- `sessionUpdate`: Updates when sessions are initiated, completed, or cancelled
  - Payload: `{ type: 'initiated'|'completed'|'cancelled', session }` 
  - Includes complete session object with doctor and device details
  - Triggers automatic UI updates across all connected clients
  - Logs detailed information about session changes

### Live Updates
- Doctor status changes appear instantly
  - Color-coded status indicators (available/busy/offline)
  - Automatic refresh mechanism with setTimeout to ensure consistency
  - Component-specific socket listeners with unique IDs for tracking
- New sessions appear automatically
  - Real-time addition to the sessions table
  - Includes all relevant session details (patient, doctor, device, timestamp)
- Completed/cancelled sessions are removed in real-time
  - Automatic removal from the active sessions list
  - Updates doctor and device status accordingly

## Components

### DoctorsTable
- Displays online doctors with real-time status updates
- Shows name, email, specialization, and online status
- Updates automatically when doctors log in/out
- Features enhanced real-time status tracking:
  - Socket.IO integration with useSocket hook
  - Detailed logging of doctor status changes
  - Automatic data refresh with setTimeout to ensure consistency
  - Visual indicators for different doctor statuses (available/busy/offline)

### SessionsTable
- Lists active sessions with patient and doctor information
- Provides complete/cancel session actions
- Real-time updates for session lifecycle events
- Enhanced session management features:
  - Comprehensive logging for session updates
  - Automatic doctor status synchronization during session lifecycle
  - Delayed data refresh to ensure all related data is updated
  - Real-time addition/removal of sessions from the table

### DeviceMap
- Shows registered pharmacy devices with GPS coordinates
- Displays device activity and last active timestamps
- Mocked map interface (can be extended with Google Maps)

## Styling

The app uses SCSS with:
- CSS variables for consistent theming
- Mixins for reusable styles
- Responsive design principles
- Modern card-based layout

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update styles in `src/styles/main.scss`
4. Add API calls in `src/services/api.js`

## Deployment

### Build for Production
```bash
npm run build
```

### Docker (Optional)
```bash
docker build -t mediconnect-frontend .
docker run -p 3000:3000 mediconnect-frontend
```

## Troubleshooting

### Common Issues
1. **API Connection Error**: Ensure backend is running on the correct port
2. **WebSocket Connection**: Check if Socket.IO server is accessible
3. **Authentication**: Verify JWT token is being sent correctly
4. **Doctor Status Not Updating**: 
   - Check browser console for socket event logs
   - Verify the backend is emitting doctorStatus events
   - Check for any errors in the socket connection
   - Ensure the component has the correct doctorId
5. **Session Updates Not Appearing**:
   - Verify sessionUpdate events are being emitted
   - Check if the session data includes all required fields
   - Look for any errors in the socket event handlers

### Debug Mode
Enable debug logging in the browser console to see WebSocket events and API calls.

### Socket Event Logging
The application includes comprehensive logging for Socket.IO events:
- Connection/disconnection events
- Doctor status updates with doctorId, status, and isOnline
- Session updates with type and sessionId
- Component-specific listeners with unique IDs
- Error handling and reconnection attempts

## Contributing

1. Follow the existing code structure
2. Use SCSS for styling
3. Add real-time updates where appropriate
4. Test with the backend API