import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'homeowner' | 'fixer';
  password?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  ratings?: {
    average: number;
    count: number;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  role: 'homeowner' | 'fixer' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserLocation: (coords: { lat: number; lng: number }) => void;
  setRole: (role: 'homeowner' | 'fixer' | null) => void;
  setError: (error: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'homeowner' | 'fixer' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('fixitlocal-user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Always use the role from the user object
        setRole(parsedUser.role);
        localStorage.setItem('fixitlocal-role', parsedUser.role);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('fixitlocal-user');
        localStorage.removeItem('fixitlocal-role');
      }
    }
    
    setLoading(false);
  }, []);

  const handleSetRole = (newRole: 'homeowner' | 'fixer' | null) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem('fixitlocal-role', newRole);
    } else {
      localStorage.removeItem('fixitlocal-role');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      handleSetRole(data.user.role);
      localStorage.setItem('fixitlocal-user', JSON.stringify(data.user));
      localStorage.setItem('fixitlocal-token', data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Handle detailed error messages
          if (typeof data.details === 'object') {
            const errorMessages = Object.entries(data.details)
              .filter(([_, message]) => message !== null)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(data.details);
        }
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user);
      handleSetRole(data.user.role);
      localStorage.setItem('fixitlocal-user', JSON.stringify(data.user));
      localStorage.setItem('fixitlocal-token', data.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    handleSetRole(null);
    localStorage.removeItem('fixitlocal-user');
    localStorage.removeItem('fixitlocal-token');
    navigate('/');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('fixitlocal-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data);
      if (data.role) {
        handleSetRole(data.role);
      }
      localStorage.setItem('fixitlocal-user', JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserLocation = (coords: { lat: number; lng: number }) => {
    if (user) {
      const updatedUser = {
        ...user,
        location: {
          latitude: coords.lat,
          longitude: coords.lng
        }
      };
      setUser(updatedUser);
      localStorage.setItem('fixitlocal-user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    error,
    role,
    login,
    register,
    logout,
    updateUser,
    updateUserLocation,
    setRole: handleSetRole,
    setError
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 