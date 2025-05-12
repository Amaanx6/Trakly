import React from 'react';
import { useForm } from 'react-hook-form';
import { TaskInput } from '../../hooks/useTasks';
import Button from '../Common/Button';

interface TaskFormProps {
  initialData?: Partial<TaskInput>;
  onSubmit: (data: TaskInput) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  initialData = {}, 
  onSubmit, 
  isLoading,
  onCancel
}) => {
  // Get tomorrow's date as default deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);
  
  const defaultDeadline = initialData.deadline || tomorrow.toISOString().slice(0, 16);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskInput>({
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      deadline: defaultDeadline,
      priority: initialData.priority || 'medium',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label htmlFor="title" className="form-label">Task Title</label>
        <input
          id="title"
          type="text"
          placeholder="e.g., Physics Assignment"
          {...register('title', {
            required: 'Task title is required',
          })}
          className={errors.title ? 'border-error-500' : ''}
        />
        {errors.title && <p className="form-error">{errors.title.message}</p>}
      </div>
      
      <div className="form-control">
        <label htmlFor="description" className="form-label">Description (Optional)</label>
        <textarea
          id="description"
          rows={3}
          placeholder="Describe the task details..."
          {...register('description')}
          className="glass p-3 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:outline-none"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label htmlFor="deadline" className="form-label">Deadline</label>
          <input
            id="deadline"
            type="datetime-local"
            {...register('deadline', {
              required: 'Deadline is required',
            })}
            className={errors.deadline ? 'border-error-500' : ''}
          />
          {errors.deadline && <p className="form-error">{errors.deadline.message}</p>}
        </div>
        
        <div className="form-control">
          <label htmlFor="priority" className="form-label">Priority</label>
          <select
            id="priority"
            {...register('priority')}
            className="glass p-3 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-3 justify-end mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Save Task
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;