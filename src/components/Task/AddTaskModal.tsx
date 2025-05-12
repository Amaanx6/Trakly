import React, { useState } from 'react';
import { X } from 'lucide-react';
import TaskForm from './TaskForm';
import { TaskInput } from '../../hooks/useTasks';
import GlassContainer from '../Common/GlassContainer';
import Button from '../Common/Button';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: TaskInput) => Promise<void>;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTask = async (taskData: TaskInput) => {
    try {
      setIsLoading(true);
      await onAddTask(taskData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950 bg-opacity-80 backdrop-blur-sm fadeIn">
      <div className="w-full max-w-md">
        <GlassContainer className="rounded-lg" darker>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Task</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="p-1.5 hover:bg-dark-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <TaskForm 
              onSubmit={handleAddTask} 
              isLoading={isLoading} 
              onCancel={onClose}
            />
          </div>
        </GlassContainer>
      </div>
    </div>
  );
};

export default AddTaskModal;