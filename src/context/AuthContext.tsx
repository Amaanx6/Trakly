import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  axios.defaults.baseURL = API_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check URL query parameters for Google OAuth token
        const searchParams = new URLSearchParams(location.search);
        const googleToken = searchParams.get('token');
        const newUser = searchParams.get('newUser') === 'true';

        console.log('AuthContext: Checking query params:', { googleToken, newUser });

        if (googleToken) {
          try {
            await loginWithGoogle(googleToken);
            // Clear query parameters and navigate to dashboard
            navigate('/dashboard', { replace: true });
            if (newUser) {
              console.log('AuthContext: New user signed up');
            }
          } catch (err) {
            console.error('AuthContext: Google login failed:', err);
            navigate('/login', { replace: true });
          }
        } else if (token) {
          // Verify existing token
          try {
            const res = await axios.get<AuthResponse>('/api/auth/me');
            setUser(res.data.user);
            setIsAuthenticated(true);
            console.log('AuthContext: Token verified:', res.data.user);
          } catch (err) {
            console.error('AuthContext: Token verification failed:', err);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (err: any) {
        console.error('AuthContext: Initialization error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [location, navigate]);

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
      console.log('AuthContext: Login successful:', res.data.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      console.error('AuthContext: Login error:', message);
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
      console.log('AuthContext: Signup successful:', res.data.user);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      console.error('AuthContext: Signup error:', message);
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
      console.log('AuthContext: Google login successful:', res.data.user);
    } catch (err: any) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      const message = err.response?.data?.message || 'Google authentication failed';
      setError(message);
      console.error('AuthContext: Google login error:', message);
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
    navigate('/login', { replace: true });
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