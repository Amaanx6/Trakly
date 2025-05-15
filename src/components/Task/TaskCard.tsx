import React from 'react';
import { format } from 'date-fns';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Task } from '../../hooks/useTasks';
import GlassContainer from '../Common/GlassContainer';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const deadlineDate = new Date(task.deadline);
  const isPastDeadline = new Date() > deadlineDate && task.status === 'pending';
  
  // Priority badge color
  const priorityColor = {
    high: 'bg-error-900/50 text-error-300',
    medium: 'bg-warning-900/50 text-warning-300',
    low: 'bg-success-900/50 text-success-300',
  };

  // Status badge
  const statusBadge = task.status === 'completed' 
    ? { bg: 'bg-success-900/50', text: 'text-success-300', icon: <CheckCircle className="h-3.5 w-3.5 mr-1" /> }
    : isPastDeadline
      ? { bg: 'bg-error-900/50', text: 'text-error-300', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> }
      : { bg: 'bg-primary-900/50', text: 'text-primary-300', icon: <Clock className="h-3.5 w-3.5 mr-1" /> };

  return (
    <GlassContainer className="p-4 rounded-lg h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className={`font-medium ${task.status === 'completed' ? 'line-through text-dark-400' : ''}`}
          >
            {task.title}
          </h3>
          <span 
            className={`
              text-xs px-2 py-0.5 rounded-full
              ${priorityColor[task.priority]}
            `}
          >
            {task.priority}
          </span>
        </div>
        
        {task.description && (
          <p className="text-dark-400 text-sm mb-3 flex-grow truncate-2">
            {task.description}
          </p>
        )}
        
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 text-dark-400 mr-1" />
              <span className="text-dark-400">
                {format(deadlineDate, 'MMM d, h:mm a')}
              </span>
            </div>
            
            <div className={`flex items-center ${statusBadge.bg} ${statusBadge.text} px-2 py-0.5 rounded-full`}>
              {statusBadge.icon}
              <span>
                {task.status === 'completed' 
                  ? 'Completed' 
                  : isPastDeadline 
                    ? 'Overdue' 
                    : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

export default TaskCard;

