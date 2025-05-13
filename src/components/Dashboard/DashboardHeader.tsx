// DashboardHeader.tsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { format, isToday, isTomorrow } from 'date-fns';
import { Task } from '../../hooks/useTasks';
import { Clock } from 'lucide-react';
import GlassContainer from '../Common/GlassContainer';
import { getUrgencyLevel } from '../../utils/urgency';

interface DashboardHeaderProps {
  upcomingTasks: Task[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ upcomingTasks }) => {
  const { user } = useAuth();
  const today = new Date();
  const upcomingTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;
  
  const urgencyLevel = upcomingTask ? getUrgencyLevel(upcomingTask.deadline) : 0;
  
  const hour = today.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <div className="mb-6 relative">
      {/* Ambient glow */}
      <div className={`absolute -inset-4 rounded-xl opacity-10 pointer-events-none transition-all duration-1000 z-0 ${
        urgencyLevel === 3 ? 'bg-error-500 animate-pulse' :
        urgencyLevel === 2 ? 'bg-error-400' :
        urgencyLevel === 1 ? 'bg-warning-400' : ''
      }`}></div>

      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-1">{greeting}, {user?.name || 'Student'}</h1>
        <p className="text-dark-400 mb-4">
          Today is {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
        
        {upcomingTask && (
          <GlassContainer className="p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center text-primary-400 text-sm mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Next upcoming deadline</span>
                </div>
                <h3 className="font-semibold">{upcomingTask.title}</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                urgencyLevel === 3 ? 'bg-error-500/20 text-error-300' :
                urgencyLevel === 2 ? 'bg-error-500/15 text-error-200' :
                urgencyLevel === 1 ? 'bg-warning-500/15 text-warning-200' : 'bg-dark-800 text-dark-300'
              }`}>
                {isToday(new Date(upcomingTask.deadline)) 
                  ? `Today, ${format(new Date(upcomingTask.deadline), 'h:mm a')}`
                  : isTomorrow(new Date(upcomingTask.deadline))
                  ? `Tomorrow, ${format(new Date(upcomingTask.deadline), 'h:mm a')}`
                  : format(new Date(upcomingTask.deadline), 'MMM d, h:mm a')}
              </div>
            </div>
          </GlassContainer>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;