import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Common/Loader';

const CTASection: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log('CTASection Auth State:', { isAuthenticated, user, isLoading, token: localStorage.getItem('token') });

  const handleDashboardClick = () => {
    console.log('Navigating to dashboard');
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container-lg">
          <GlassContainer darker className="rounded-xl overflow-hidden">
            <div className="relative p-8 md:p-12 flex justify-center items-center">
              <Loader />
            </div>
          </GlassContainer>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container-lg">
        <GlassContainer darker className="rounded-xl overflow-hidden">
          <div className="relative p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-secondary-900/30 -z-10"></div>
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isAuthenticated
                  ? `Welcome back${user?.name ? `, ${user.name}` : ''}!`
                  : 'Ready to take control of your academic life?'}
              </h2>
              <p className="text-dark-300 text-lg mb-8">
                {isAuthenticated
                  ? 'Continue managing your assignments and stay on top of your tasks.'
                  : 'Join thousands of students who have improved their productivity and reduced stress by using our assignment tracking system.'}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                    onClick={handleDashboardClick}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button
                        size="lg"
                        rightIcon={<ArrowRight className="h-5 w-5" />}
                      >
                        Get Started for Free
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="ghost" size="lg">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              {!isAuthenticated && (
                <p className="mt-6 text-dark-400 text-sm">
                  No credit card required. Set up in minutes.
                </p>
              )}
            </div>
          </div>
        </GlassContainer>
      </div>
    </section>
  );
};

export default CTASection;