import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const SignupForm: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>();

  const password = watch('password');

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

  return (
    <GlassContainer className="p-8 rounded-lg max-w-md w-full mx-auto">
      <div className="flex justify-center mb-6">
        <UserPlus className="h-12 w-12 text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
      
      {error && (
        <div className="bg-error-900 bg-opacity-50 text-error-200 p-3 rounded-md mb-6 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label htmlFor="name" className="form-label flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Name</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            {...register('name', {
              required: 'Name is required',
            })}
            className={errors.name ? 'border-error-500' : ''}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
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
        
        <div className="form-control">
          <label htmlFor="passwordConfirm" className="form-label flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Confirm Password</span>
          </label>
          <input
            id="passwordConfirm"
            type="password"
            placeholder="••••••••"
            {...register('passwordConfirm', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            })}
            className={errors.passwordConfirm ? 'border-error-500' : ''}
          />
          {errors.passwordConfirm && <p className="form-error">{errors.passwordConfirm.message}</p>}
        </div>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center text-dark-400 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 hover:underline">
          Sign in
        </Link>
      </div>
    </GlassContainer>
  );
};

export default SignupForm;