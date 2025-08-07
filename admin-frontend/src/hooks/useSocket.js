import { useEffect, useRef } from 'react';
import socketService from '../services/socket';

/**
 * Custom hook to handle socket events with enhanced logging
 * @param {string} event - The socket event to listen for
 * @param {function} callback - The callback function to execute when the event is received
 */
export const useSocket = (event, callback) => {
  const callbackRef = useRef(callback);
  // Use a ref to track component identity for logging
  const componentId = useRef(`component-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    console.log(`[${componentId.current}] Setting up socket listener for event: ${event}`);
    // Connect to Socket.IO
    socketService.connect();

    // Add event listener with logging
    const handleEvent = (data) => {
      console.log(`[${componentId.current}] Received ${event} event:`, data);
      callbackRef.current(data);
    };

    socketService.addListener(event, handleEvent);

    // Cleanup on unmount
    return () => {
      console.log(`[${componentId.current}] Cleaning up socket listener for event: ${event}`);
      socketService.removeListener(event, handleEvent);
    };
  }, [event]);

  return socketService;
};