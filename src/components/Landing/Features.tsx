import React from 'react';
import { CheckSquare, Calendar, Bell, Clock, Award, BookOpen } from 'lucide-react';
import GlassContainer from '../Common/GlassContainer';

const features = [
  {
    icon: <CheckSquare className="h-6 w-6 text-primary-500" />,
    title: 'Task Management',
    description: 'Easily add and manage assignments with detailed descriptions, deadlines, and priority levels.',
  },
  {
    icon: <Calendar className="h-6 w-6 text-primary-500" />,
    title: 'Calendar View',
    description: 'Visualize your schedule with a calendar view that highlights upcoming deadlines at a glance.',
  },
  {
    icon: <Bell className="h-6 w-6 text-primary-500" />,
    title: 'Deadline Reminders',
    description: 'Never miss an important submission with built-in deadline reminders and countdowns.',
  },
  {
    icon: <Clock className="h-6 w-6 text-primary-500" />,
    title: 'Time Tracking',
    description: 'Track how much time you spend on each assignment to improve your time management skills.',
  },
  {
    icon: <Award className="h-6 w-6 text-primary-500" />,
    title: 'Priority System',
    description: 'Organize tasks by importance using a simple priority system to focus on what matters most.',
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary-500" />,
    title: 'Course Organization',
    description: 'Keep all your tasks organized by course for better academic planning and management.',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="container-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Features Designed for Students</h2>
          <p className="text-dark-300 max-w-2xl mx-auto">
            Our platform is built with the unique needs of college students in mind, 
            helping you stay organized and on top of your academic responsibilities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassContainer key={index} className="p-6 rounded-lg hover:translate-y-[-4px] transition-transform duration-300">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-dark-400">{feature.description}</p>
            </GlassContainer>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;