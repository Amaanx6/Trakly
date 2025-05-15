import React, { useState } from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsCard from '../components/Dashboard/StatsCard';
import TaskList from '../components/Dashboard/TaskList';
import TaskForm from '../components/Task/TaskForm';
import SubjectForm from '../components/Dashboard/SubjectForm';
import Button from '../components/Common/Button';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { 
    tasks, 
    loading, 
    error,
    fetchTasks, 
    // @ts-ignore
    addTask, 
    markTaskComplete,
    deleteTask,
    upcomingTasks
  } = useTasks();
  
  const { refreshUserData } = useAuth();

  // Handler for when a task is added
  const handleTaskAdded = async () => {
    await fetchTasks();
    setIsAddModalOpen(false);
  };

  // Handler for when a subject is added
  const handleSubjectAdded = async () => {
    // Refresh user data to get updated subjects list
    await refreshUserData();
    await fetchTasks();
  };

  const handleMarkComplete = async (id: string) => {
    await markTaskComplete(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleRefresh = async () => {
    await fetchTasks();
    await refreshUserData();
  };

  return (
    <div className="space-y-6">
      <DashboardHeader upcomingTasks={upcomingTasks} />
      
      {error && (
        <div className="bg-error-500/10 text-error-500 p-3 rounded-lg">
          {error}
          <button 
            onClick={handleRefresh}
            className="ml-2 text-error-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Button 
          onClick={handleRefresh}
          variant="ghost"
          leftIcon={<RefreshCw className="h-5 w-5" />}
          isLoading={loading}
        >
          Refresh
        </Button>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<PlusCircle className="h-5 w-5" />}
        >
          Add New Task
        </Button>
      </div>
      
      <SubjectForm onSubjectAdded={handleSubjectAdded} />
      <StatsCard tasks={tasks} />
      
      <TaskList 
        tasks={tasks} 
        loading={loading} 
        error={error ?? undefined}
        onMarkComplete={handleMarkComplete}
        onDelete={handleDeleteTask}
        refetchTasks={handleRefresh}
      />
      
      <TaskForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleTaskAdded}
      />
    </div>
  );
};

export default DashboardPage;