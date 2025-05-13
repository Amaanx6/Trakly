import React, { useState, useMemo } from 'react';
import { Calendar, CheckSquare, Filter, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config/constants';
import { Task, QuestionAnswer } from '../../types';
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
  const [answersCache, setAnswersCache] = useState<Record<string, { questions: QuestionAnswer[], message?: string }>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    });
  }, [tasks, filter]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
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
  }, [filteredTasks, sort, sortDirection]);

  const handleGetAnswers = async (taskId: string) => {
    if (answersCache[taskId]) {
      return answersCache[taskId];
    }

    try {
      console.log('TaskList fetching answers for taskId:', taskId);
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/answers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch answers');
      }
      
      const data = await response.json();
      console.log('TaskList answers received:', data);
      const result = { questions: data.questions || [], message: data.message };
      setAnswersCache(prev => ({ ...prev, [taskId]: result }));
      return result;
    } catch (err: any) {
      console.error('TaskList error fetching answers:', err);
      const errorResult = { questions: [], message: err.message || 'Failed to fetch answers' };
      setAnswersCache(prev => ({ ...prev, [taskId]: errorResult }));
      throw err;
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRefresh = async () => {
    if (!refetchTasks) return;
    try {
      setIsRefreshing(true);
      await refetchTasks();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getGlowClass = (deadline: string) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return 'red-glow';
    if (diffHours < 72) return 'yellow-glow';
    return 'green-glow';
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
      <style>
        {`
          .red-glow {
            position: relative;
          }
          .red-glow::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, transparent 70%);
            animation: glow 2s ease-in-out infinite;
            z-index: -1;
            border-radius: 8px;
          }
          .yellow-glow {
            position: relative;
          }
          .yellow-glow::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: radial-gradient(circle, rgba(255, 255, 0, 0.3) 0%, transparent 70%);
            animation: glow 2s ease-in-out infinite;
            z-index: -1;
            border-radius: 8px;
          }
          .green-glow {
            position: relative;
          }
          .green-glow::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%);
            animation: glow 2s ease-in-out infinite;
            z-index: -1;
            border-radius: 8px;
          }
          @keyframes glow {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
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
                onClick={handleRefresh}
                isLoading={isRefreshing}
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
                onClick={handleRefresh}
                className="text-error-600 hover:underline text-sm"
              >
                Try again
              </button>
            )}
          </div>
        )}
        
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
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div key={task._id} className={getGlowClass(task.deadline)}>
                <TaskItem 
                  task={task} 
                  onMarkComplete={onMarkComplete}
                  onDelete={onDelete}
                  onGetAnswers={handleGetAnswers}
                  initialAnswers={answersCache[task._id]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassContainer>
  );
};

export default TaskList;