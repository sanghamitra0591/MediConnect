import { useEffect, useRef } from 'react';
import socketService from '../services/socket';

export const useSocket = (event, callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Add event listener
    const handleEvent = (data) => {
      callbackRef.current(data);
    };

    socketService.addListener(event, handleEvent);

    // Cleanup on unmount
    return () => {
      socketService.removeListener(event, handleEvent);
    };
  }, [event]);

  return socketService;
}; 