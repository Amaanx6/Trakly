import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  axios.defaults.baseURL = API_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await axios.get<AuthResponse>('/api/auth/me');
        setUser(res.data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post<AuthResponse>('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post<AuthResponse>('/api/auth/signup', { email, password, name });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (token: string) => {
    setError(null);
    setIsLoading(true);
    try {
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axios.get<AuthResponse>('/api/auth/me');
      setUser(res.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      const message = err.response?.data?.message || 'Google authentication failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;