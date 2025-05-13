import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, Mail, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';
import { API_URL } from '../../config/constants';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

const SignupPage: React.FC = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>();

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const newUser = query.get('newUser');
    if (token && newUser === 'true') {
      loginWithGoogle(token)
        .then(() => navigate('/dashboard'))
        .catch((err) => {
          console.error('Error completing Google signup:', err);
          localStorage.removeItem('token');
          setError('Failed to complete Google signup');
        });
    }
  }, [location, navigate, loginWithGoogle]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(data.email, data.password, data.name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/auth/google?action=signup`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 to-dark-800 p-4">
      <GlassContainer className="p-8 rounded-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <User className="h-12 w-12 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <div className="bg-error-900 bg-opacity-50 text-error-200 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="form-control">
            <label htmlFor="name" className="form-label flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Name</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              className={`w-full p-2 rounded bg-dark-700 text-dark-100 ${errors.name ? 'border border-error-500' : ''}`}
            />
            {errors.name && <p className="form-error text-error-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="form-control">
            <label htmlFor="email" className="form-label flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`w-full p-2 rounded bg-dark-700 text-dark-100 ${errors.email ? 'border border-error-500' : ''}`}
            />
            {errors.email && <p className="form-error text-error-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="form-control">
            <label htmlFor="password" className="form-label flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={`w-full p-2 rounded bg-dark-700 text-dark-100 ${errors.password ? 'border border-error-500' : ''}`}
            />
            {errors.password && <p className="form-error text-error-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-6"
          >
            Sign Up
          </Button>
        </form>

        <div className="mt-6">
          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleSignup}
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Sign Up with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-dark-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 hover:underline">
            Sign in
          </Link>
        </div>
      </GlassContainer>
    </div>
  );
};

export default SignupPage;