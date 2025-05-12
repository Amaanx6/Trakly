import React, { useState } from 'react';
import { Calendar, CheckSquare, Filter, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config/constants';
import { Task, QuestionAnswer } from '../../hooks/useTasks';
import TaskItem from './TaskItem';
import GlassContainer from '../Common/GlassContainer';
import Loader from '../Common/Loader';
import Button from '../Common/Button';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error?: string;
  onMarkComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  refetchTasks?: () => Promise<void>;
}

type FilterType = 'all' | 'pending' | 'completed';
type SortType = 'deadline' | 'priority' | 'title' | 'createdAt';

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  loading, 
  error,
  onMarkComplete, 
  onDelete,
  refetchTasks
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer[]>>({});
  const [answerLoading, setAnswerLoading] = useState<Record<string, boolean>>({});
  const [answerError, setAnswerError] = useState<string>('');

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Sort tasks based on selected criteria
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case 'deadline':
        comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Fetch answers for a specific task
  const handleGetAnswers = async (taskId: string) => {
    setAnswerLoading(prev => ({ ...prev, [taskId]: true }));
    setAnswerError('');

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/answers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch answers');
      }

      const data = await response.json();
      setAnswers(prev => ({ ...prev, [taskId]: data.questions }));
    } catch (err) {
      setAnswerError((err as Error).message);
    } finally {
      setAnswerLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

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
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary-500" />
            <span>Your Tasks</span>
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {refetchTasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchTasks}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                aria-label="Refresh tasks"
              />
            )}

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
                <option value="createdAt">By Created Date</option>
              </select>
              <button 
                onClick={toggleSortDirection}
                className="text-dark-400 hover:text-dark-300"
                aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-error-500/10 text-error-500 p-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            {refetchTasks && (
              <button 
                onClick={refetchTasks}
                className="text-error-600 hover:underline text-sm"
              >
                Try again
              </button>
            )}
          </div>
        )}
        
        {answerError && (
          <div className="bg-warning-500/10 text-warning-500 p-3 rounded-lg">
            {answerError}
          </div>
        )}
      </div>
      
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12 text-dark-400">
          <CheckSquare className="h-12 w-12 mx-auto mb-4 text-dark-600 opacity-50" />
          <p className="text-lg font-medium mb-2">No tasks found</p>
          <p className="text-sm">
            {filter === 'all' 
              ? 'Start by adding your first task!' 
              : filter === 'pending' 
                ? 'No pending tasks. Great work!' 
                : 'No completed tasks yet.'}
          </p>
          {refetchTasks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refetchTasks}
              className="mt-4"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onMarkComplete={onMarkComplete}
              onDelete={onDelete}
              onGetAnswers={() => handleGetAnswers(task._id)}
              answers={answers[task._id]}
              answerLoading={answerLoading[task._id] || false}
            />
          ))}
        </div>
      )}
    </GlassContainer>
  );
};

export default TaskList;