import React from 'react';
import { Task } from '../../hooks/useTasks';
import { isPast } from 'date-fns';
import { Clock, CheckSquare, AlertTriangle, Calendar } from 'lucide-react';
import GlassContainer from '../Common/GlassContainer';

interface StatsCardProps {
  tasks: Task[];
}

const StatsCard: React.FC<StatsCardProps> = ({ tasks }) => {
  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(
    t => t.status === 'pending' && isPast(new Date(t.deadline))
  ).length;
  
  // Completion rate
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <GlassContainer className="p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary-900/50 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Total Tasks</p>
              <p className="text-xl font-semibold">{totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-success-900/50 p-2 rounded-lg">
              <CheckSquare className="h-5 w-5 text-success-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Completed</p>
              <p className="text-xl font-semibold">{completedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-warning-900/50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-warning-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Pending</p>
              <p className="text-xl font-semibold">{pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-error-900/50 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-error-400" />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Overdue</p>
              <p className="text-xl font-semibold">{overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>
      
      {totalTasks > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-dark-400 text-sm">Task Completion</p>
            <p className="font-medium">{completionRate}%</p>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 rounded-full"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </GlassContainer>
  );
};

export default StatsCard;