import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Task } from '../../hooks/useTasks';
import { Calendar, Clock } from 'lucide-react';
import GlassContainer from '../Common/GlassContainer';

interface DashboardHeaderProps {
  upcomingTasks: Task[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ upcomingTasks }) => {
  const { user } = useAuth();
  const today = new Date();
  const upcomingTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;
  
  // Get greeting based on time of day
  const hour = today.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">{greeting}, {user?.name || 'Student'}</h1>
          <p className="text-dark-400">
            Today is {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center mt-3 sm:mt-0 glass rounded-full px-4 py-2 text-sm">
          <Calendar className="h-4 w-4 mr-2 text-primary-500" />
          <span className="text-dark-300">{format(today, 'MMMM yyyy')}</span>
        </div>
      </div>
      
      {upcomingTask && (
        <GlassContainer className="p-5 rounded-lg border-l-4 border-primary-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-primary-400 text-sm mb-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>Next upcoming deadline</span>
              </div>
              <h3 className="font-semibold text-lg">{upcomingTask.title}</h3>
            </div>
            <div className="glass px-4 py-2 rounded-full text-sm">
              <span className="text-dark-300">Due {format(new Date(upcomingTask.deadline), 'MMM d, h:mm a')}</span>
            </div>
          </div>
        </GlassContainer>
      )}
    </div>
  );
};

export default DashboardHeader;