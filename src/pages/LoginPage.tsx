import React, { useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/Auth/LoginForm';
import Button from '../components/Common/Button';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      loginWithGoogle(token)
        .then(() => navigate('/dashboard'))
        .catch(err => console.error('Google login error:', err));
    }
  }, [location, loginWithGoogle, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-4 px-4">
        <div className="container-xl">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-xl">Trakly</span>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;