import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';
import { Clock, Trash2, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import { Task } from '../../hooks/useTasks';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';

interface TaskItemProps {
  task: Task;
  onMarkComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onMarkComplete, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await onMarkComplete(task._id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const deadlineDate = new Date(task.deadline);
  const isPastDeadline = isPast(deadlineDate) && task.status === 'pending';
  
  // Format deadline for display
  let deadlineText = format(deadlineDate, 'MMM d, yyyy');
  if (isToday(deadlineDate)) deadlineText = `Today, ${format(deadlineDate, 'h:mm a')}`;
  if (isTomorrow(deadlineDate)) deadlineText = `Tomorrow, ${format(deadlineDate, 'h:mm a')}`;
  
  // Time remaining
  const timeRemaining = deadlineDate > new Date() 
    ? formatDistanceToNow(deadlineDate, { addSuffix: true })
    : 'Overdue';

  // Priority color
  const priorityColor = {
    high: 'bg-error-900/50 text-error-300',
    medium: 'bg-warning-900/50 text-warning-300',
    low: 'bg-success-900/50 text-success-300',
  };

  return (
    <GlassContainer 
      className={`
        rounded-lg transition-all duration-200
        ${task.status === 'completed' ? 'opacity-70' : ''} 
        ${isPastDeadline ? 'border-error-700 border-opacity-50' : ''}
      `}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className={`font-medium text-lg ${task.status === 'completed' ? 'line-through text-dark-400' : ''}`}
                role="button"
                onClick={() => setIsExpanded(!isExpanded)}
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
            
            {isExpanded && (
              <div className="mt-2 mb-3 text-dark-300">
                <p>{task.description || 'No description provided.'}</p>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-dark-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{deadlineText}</span>
              </div>
              
              {task.status === 'pending' && (
                <div className={`flex items-center gap-1 ${isPastDeadline ? 'text-error-400' : ''}`}>
                  {isPastDeadline && <AlertTriangle className="h-3.5 w-3.5" />}
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                isLoading={isCompleting}
                aria-label="Mark as completed"
                title="Mark as completed"
              >
                <CheckCircle className="h-5 w-5 text-success-500" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              aria-label="Delete task"
              title="Delete task"
            >
              <Trash2 className="h-5 w-5 text-error-500" />
            </Button>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

export default TaskItem;