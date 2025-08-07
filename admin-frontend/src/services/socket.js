import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../utils/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    console.log('Attempting to connect to socket server');
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server. Reason:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for doctor status updates with enhanced logging
    this.socket.on('doctorStatus', (data) => {
      console.log('SOCKET DIRECT EVENT - Doctor status update received:', {
        doctorId: data.doctorId,
        status: data.status,
        isOnline: data.isOnline
      });
      this.notifyListeners('doctorStatus', data);
    });

    // Listen for session updates with enhanced logging
    this.socket.on('sessionUpdate', (data) => {
      console.log('SOCKET DIRECT EVENT - Session update received:', {
        type: data.type,
        sessionId: data.session?._id
      });
      this.notifyListeners('sessionUpdate', data);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  addListener(event, callback) {
    console.log(`Registering listener for event: ${event}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    console.log(`Removing listener for event: ${event}`);
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export default new SocketService();