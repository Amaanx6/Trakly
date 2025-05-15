import React, { useState, useEffect, Component } from 'react';
import { User, UserEdit } from '../../types';
import { fetchUserProfile, updateUserProfile } from '../../services/authService';
import ProfileForm from './ProfileForm';
import GlassContainer from '../Common/GlassContainer';
import Loader from '../Common/Loader';
import { UserIcon, AlertTriangle, Pencil, Shield, Mail, School, CalendarClock, Book } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../Common/Button';

// Error Boundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserProfile();
        setUser(userData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        const errorMessage = err.message || 'Failed to load user profile.';
        setError(errorMessage);
        if (errorMessage) {
          showToast(errorMessage, 'error', 4000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [showToast]);

  const handleProfileUpdate = async (updatedData: UserEdit) => {
    try {
      const updatedUser = await updateUserProfile(updatedData);
      setUser(updatedUser);
      setError(null);
      setIsEditing(false);
      showToast('Profile updated successfully', 'success', 4000);
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.message || 'Failed to update profile.';
      setError(errorMessage);
      if (errorMessage) {
        showToast(errorMessage, 'error', 4000);
      }
      return Promise.reject(err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <GlassContainer className="w-full max-w-4xl mx-auto p-6 md:p-8 glass-effect">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader size="lg" />
        </div>
      </GlassContainer>
    );
  }

  if (error) {
    return (
      <GlassContainer className="w-full max-w-4xl mx-auto p-6 md:p-8 glass-effect">
        <div className="bg-error-900/20 border border-error-700/50 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-error-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-error-300">{error}</p>
          </div>
        </div>
      </GlassContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={
        <GlassContainer className="w-full max-w-4xl mx-auto p-6 md:p-8 glass-effect">
          <div className="bg-error-900/20 border border-error-700/50 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-error-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-error-300">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            </div>
          </div>
        </GlassContainer>
      }
    >
      <GlassContainer className="w-full max-w-4xl mx-auto p-6 md:p-8 glass-effect">
        <div className="mb-10 text-center relative">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-500 text-white mb-6 shadow-lg shadow-primary-900/30 transition-transform duration-300 hover:scale-105">
            <UserIcon size={38} className="opacity-90" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">{user.name || 'User'}</h1>
          <p className="text-primary-300 text-lg flex items-center justify-center gap-2">
            <Mail size={16} className="opacity-75" />
            {user.email}
          </p>
        </div>

        {isEditing ? (
          <div className="w-full transition-all duration-300 ease-in-out transform">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Pencil size={18} className="text-primary-400" />
                Edit Profile
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full"></div>
            </div>
            <ProfileForm
              initialData={{
                name: user.name || '',
                college: user.college || '',
                year: user.year || '',
                branch: user.branch || '',
              }}
              onSave={handleProfileUpdate}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          <div className="w-full transition-opacity duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Shield size={18} className="text-primary-400" />
                Profile Information
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileInfoItem 
                label="Name" 
                value={user.name} 
                icon={<UserIcon size={18} className="text-primary-400" />} 
              />
              <ProfileInfoItem 
                label="Email" 
                value={user.email} 
                icon={<Mail size={18} className="text-primary-400" />} 
              />
              <ProfileInfoItem 
                label="College" 
                value={user.college} 
                icon={<School size={18} className="text-primary-400" />} 
              />
              <ProfileInfoItem 
                label="Year" 
                value={user.year} 
                icon={<CalendarClock size={18} className="text-primary-400" />} 
              />
              <ProfileInfoItem 
                label="Branch" 
                value={user.branch} 
                icon={<Book size={18} className="text-primary-400" />} 
                className="md:col-span-2"
              />
            </div>
            <Button
              variant="primary"
              className="mt-8 w-full py-3.5 text-base flex items-center justify-center gap-2 
                bg-gradient-to-r from-primary-600 to-primary-500 hover-glow rounded-xl"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={18} />
              Edit Profile
            </Button>
          </div>
        )}
      </GlassContainer>
    </ErrorBoundary>
  );
};

interface ProfileInfoItemProps {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  className?: string;
}

const ProfileInfoItem: React.FC<ProfileInfoItemProps> = ({ label, value, icon, className = '' }) => {
  return (
    <div className={`bg-dark-700/40 rounded-xl p-4 backdrop-blur-sm border border-dark-600/50 transition-all duration-200 hover:bg-dark-600/50 ${className}`}>
      <span className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
        {icon}
        {label}
      </span>
      <p className="text-lg font-medium text-white">{value || '—'}</p>
    </div>
  );
};

export default Profile;