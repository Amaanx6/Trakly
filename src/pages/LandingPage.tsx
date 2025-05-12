import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen } from 'lucide-react';
import HeroSection from '../components/Landing/HeroSection';
import Features from '../components/Landing/Features';
import CTASection from '../components/Landing/CTASection';
import Footer from '../components/Landing/Footer';
import Button from '../components/Common/Button';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Navigation for Landing */}
      <nav className="glass-dark sticky top-0 z-50 px-4 py-3">
        <div className="container-xl flex items-center justify-between">
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-500" />
            <span className="font-bold text-xl">Trakly</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        <HeroSection />
        <Features />
        {!isAuthenticated && <CTASection />}
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;