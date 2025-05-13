import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Chrome } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Common/Button';
import { API_URL } from '../config/constants';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = () => {
    console.log('SignupPage: Initiating Google OAuth');
    window.location.href = `${API_URL}/api/auth/google?action=signup`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-white">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">Trakly</span>
        </Link>
      </div>
      
      <div className="glass-card w-full max-w-md p-8 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="border-2 border-primary-500 w-48"
            >
              Sign Up
            </Button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-slate-400 bg-[#1e293b]">or</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2"
          >
            <Chrome className="h-5 w-5" />
            Sign Up with Google
          </Button>
        </div>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;