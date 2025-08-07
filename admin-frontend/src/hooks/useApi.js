import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api[method](url, data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url) => callApi('get', url), [callApi]);
  const post = useCallback((url, data) => callApi('post', url, data), [callApi]);
  const patch = useCallback((url, data) => callApi('patch', url, data), [callApi]);
  // Explicitly define the delete function to ensure it works correctly
  const deleteFunc = useCallback((url) => {
    console.log('Delete function called with URL:', url);
    return callApi('delete', url);
  }, [callApi]);

  return {
    loading,
    error,
    get,
    post,
    patch,
    del: deleteFunc, // Use the explicit delete function
    delete: deleteFunc, // Provide both del and delete for compatibility
    clearError: () => setError(null),
  };
};