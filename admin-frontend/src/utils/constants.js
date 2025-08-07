// API Endpoints
export const API_ENDPOINTS = {
  // Unified Authentication
  LOGIN: '/api/login',
  ADMIN_SIGNUP: '/api/admin/signup',
  DOCTOR_REGISTER: '/api/doctors/register',
  DOCTOR_LOGOUT: '/api/doctors/logout',
  DOCTOR_AVAILABILITY: '/api/doctors/availability',
  
  // Device Management
  DEVICE_REGISTER: '/api/devices/register',
  
  // Session Management
  SESSION_INITIATE: '/api/sessions/initiate',
  SESSION_ACTIVE: '/api/sessions/active',
  SESSION_COMPLETE: (id) => `/api/sessions/${id}/complete`,
  SESSION_CANCEL: (id) => `/api/sessions/${id}/cancel`,
  
  // Admin Dashboard
  ONLINE_DOCTORS: '/api/admin/online-doctors',
  ACTIVE_SESSIONS: '/api/admin/active-sessions',
  DEVICES: '/api/admin/devices',
  AVAILABLE_DOCTORS: '/api/doctors/available',
  AVAILABLE_DEVICES: '/api/devices/available',
  
  // Health Check
  HEALTH: '/api/health',
};

// WebSocket Events
export const SOCKET_EVENTS = {
  DOCTOR_STATUS: 'doctorStatus',
  SESSION_UPDATE: 'sessionUpdate',
};

// Session Status
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Doctor Status
export const DOCTOR_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  DOCTOR_TOKEN: 'doctorToken',
};

// Environment Variables
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
};