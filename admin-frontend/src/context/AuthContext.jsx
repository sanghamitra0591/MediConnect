import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and userType on app load
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    if (storedToken && storedUserType) {
      setToken(storedToken);
      setUserType(storedUserType);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (newToken, newUserType) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userType', newUserType);
    setToken(newToken);
    setUserType(newUserType);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setToken(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    token,
    userType,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 