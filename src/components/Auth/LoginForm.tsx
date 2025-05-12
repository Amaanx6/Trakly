import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassContainer className="p-8 rounded-lg max-w-md w-full mx-auto">
      <div className="flex justify-center mb-6">
        <LogIn className="h-12 w-12 text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      
      {error && (
        <div className="bg-error-900 bg-opacity-50 text-error-200 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            className={errors.email ? 'border-error-500' : ''}
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
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
            className={errors.password ? 'border-error-500' : ''}
          />
          {errors.password && <p className="form-error">{errors.password.message}</p>}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center text-dark-400 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-400 hover:text-primary-300 hover:underline">
          Sign up
        </Link>
      </div>
    </GlassContainer>
  );
};

export default LoginForm;