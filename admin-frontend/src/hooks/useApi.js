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
  const del = useCallback((url) => callApi('delete', url), [callApi]);

  return {
    loading,
    error,
    get,
    post,
    patch,
    delete: del,
    clearError: () => setError(null),
  };
}; 