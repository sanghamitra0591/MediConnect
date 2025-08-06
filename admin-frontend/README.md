# MediConnect Admin Frontend

A modern React admin dashboard for the MediConnect telemedicine platform, featuring real-time updates and session management.

## Features

- **Real-time Dashboard**: Live updates for doctor status and session changes
- **Session Management**: Complete and cancel active sessions
- **Device Activity Map**: View registered pharmacy devices with GPS coordinates
- **Modern UI**: Beautiful SCSS-styled interface with responsive design
- **Authentication**: Secure admin login with JWT token management
- **WebSocket Integration**: Real-time updates via Socket.IO

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
│   ├── DoctorsTable.jsx
│   ├── SessionsTable.jsx
│   └── DeviceMap.jsx
├── context/            # React Context providers
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── LoginPage.jsx
│   └── DashboardPage.jsx
├── services/           # API and Socket.IO services
│   ├── api.js
│   └── socket.js
├── styles/             # SCSS stylesheets
│   └── main.scss
└── App.jsx            # Main app component
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
- `sessionUpdate`: Updates when sessions are initiated, completed, or cancelled

### Live Updates
- Doctor status changes appear instantly
- New sessions appear automatically
- Completed/cancelled sessions are removed in real-time

## Components

### DoctorsTable
- Displays online doctors with real-time status updates
- Shows name, email, specialization, and online status
- Updates automatically when doctors log in/out

### SessionsTable
- Lists active sessions with patient and doctor information
- Provides complete/cancel session actions
- Real-time updates for session lifecycle events

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

### Debug Mode
Enable debug logging in the browser console to see WebSocket events and API calls.

## Contributing

1. Follow the existing code structure
2. Use SCSS for styling
3. Add real-time updates where appropriate
4. Test with the backend API 