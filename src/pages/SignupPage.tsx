import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/Auth/SignupForm';

const SignupPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-4 px-4">
        <div className="container-xl">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-xl">AssignTrack</span>
          </Link>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;