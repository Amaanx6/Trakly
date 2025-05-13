import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';

const HeroSection: React.FC = () => {
  return (
    <div className="py-16 md:py-24 px-4">
      <div className="container-xl grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-primary-400">Never miss</span> another college assignment deadline
          </h1>
          <p className="text-lg text-dark-300">
            Track your assignments, manage surprise tests, and stay ahead of your academic schedule with our intuitive tracking system designed specifically for students.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Log In
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -z-10 inset-0 bg-gradient-radial from-primary-500/20 to-transparent opacity-70"></div>
          <GlassContainer className="p-6 rounded-lg backdrop-blur-2xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Upcoming Deadlines</h3>
              <span className="text-xs text-dark-400">Demo View</span>
            </div>
            <div className="space-y-4">
              {[
                { id: 1, title: 'Physics Assignment', days: 2, priority: 'high' },
                { id: 2, title: 'Math Quiz Preparation', days: 3, priority: 'medium' },
                { id: 3, title: 'Literature Essay', days: 5, priority: 'low' },
              ].map((task) => (
                <div key={task.id} className="glass p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span 
                      className={`
                        text-xs px-2 py-1 rounded-full
                        ${task.priority === 'high' 
                          ? 'bg-error-900/50 text-error-300' 
                          : task.priority === 'medium' 
                            ? 'bg-warning-900/50 text-warning-300' 
                            : 'bg-success-900/50 text-success-300'
                        }
                      `}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center text-dark-400 text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{task.days} days remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;