import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '../../hooks/useTasks';
import TaskItem from './TaskItem';
import GlassContainer from '../Common/GlassContainer';
import Loader from '../Common/Loader';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onMarkComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type FilterType = 'all' | 'pending' | 'completed';
type SortType = 'deadline' | 'priority' | 'title';

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  loading, 
  onMarkComplete, 
  onDelete 
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('deadline');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sort === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <GlassContainer className="p-6 rounded-lg">
        <div className="flex items-center justify-center py-12">
          <Loader size="lg" />
        </div>
      </GlassContainer>
    );
  }

  return (
    <GlassContainer className="p-6 rounded-lg">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary-500" />
          <span>Your Tasks</span>
        </h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="glass px-3 py-1.5 rounded-md flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-dark-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-transparent border-none focus:ring-0 text-dark-300 p-0 pr-6"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="glass px-3 py-1.5 rounded-md flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-dark-400" />
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="bg-transparent border-none focus:ring-0 text-dark-300 p-0 pr-6"
            >
              <option value="deadline">By Deadline</option>
              <option value="priority">By Priority</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12 text-dark-400">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-dark-600" />
          <p className="text-lg font-medium mb-2">No tasks found</p>
          <p className="text-sm">
            {filter === 'all' 
              ? 'Start by adding your first task!' 
              : filter === 'pending' 
                ? 'No pending tasks. Good job!' 
                : 'No completed tasks yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onMarkComplete={onMarkComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </GlassContainer>
  );
};

export default TaskList;