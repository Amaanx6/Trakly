import React, { useState } from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsCard from '../components/Dashboard/StatsCard';
import TaskList from '../components/Dashboard/TaskList';
import AddTaskModal from '../components/Task/AddTaskModal';
import Button from '../components/Common/Button';
import { TaskInput } from '../types';

const DashboardPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { 
    tasks, 
    loading, 
    error,
    fetchTasks, 
    addTask, 
    markTaskComplete,
    deleteTask,
    upcomingTasks
  } = useTasks();

  const handleAddTask = async (taskData: TaskInput) => {
    // Ensure priority is set (provide a default if undefined)
    const taskWithRequiredFields = {
      ...taskData,
      priority: taskData.priority || "medium" // Default to medium if undefined
    };
    
    await addTask(taskWithRequiredFields);
    setIsAddModalOpen(false);
  };

  const handleMarkComplete = async (id: string) => {
    await markTaskComplete(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleRefresh = async () => {
    await fetchTasks();
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
      
      <StatsCard tasks={tasks} />
      
      <TaskList 
        tasks={tasks} 
        loading={loading} 
        error={error ?? undefined}
        onMarkComplete={handleMarkComplete}
        onDelete={handleDeleteTask}
        refetchTasks={handleRefresh}
      />
      
      <AddTaskModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default DashboardPage;