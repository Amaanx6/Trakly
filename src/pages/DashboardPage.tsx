import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTasks, TaskInput } from '../hooks/useTasks';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsCard from '../components/Dashboard/StatsCard';
import TaskList from '../components/Dashboard/TaskList';
import AddTaskModal from '../components/Task/AddTaskModal';
import Button from '../components/Common/Button';

const DashboardPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { 
    tasks, 
    loading, 
    fetchTasks, 
    addTask, 
    markTaskComplete,
    deleteTask,
    upcomingTasks
  } = useTasks();

  const handleAddTask = async (taskData: TaskInput) => {
    await addTask(taskData);
  };

  const handleMarkComplete = async (id: string) => {
    await markTaskComplete(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader upcomingTasks={upcomingTasks} />
      
      <div className="flex justify-end">
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
        onMarkComplete={handleMarkComplete}
        onDelete={handleDeleteTask}
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