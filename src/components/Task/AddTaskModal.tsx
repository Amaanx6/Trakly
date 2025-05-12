import React, { useState, FormEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { TaskInput } from '../../hooks/useTasks';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: TaskInput) => Promise<void>;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdf(file);
      setError('');
    } else {
      setError('Please upload a valid PDF file');
      setPdf(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onAddTask({ ...formData, pdf: pdf || undefined });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-dark-900 bg-opacity-50 flex items-center justify-center z-50">
      <GlassContainer className="p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-dark-200">Add New Task</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5 text-dark-400" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              maxLength={100}
            />
          </div>
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={500}
            />
          </div>
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Deadline</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-dark-300 mb-1">Upload Assignment PDF</label>
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-dark-600 text-dark-200 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {error && <p className="text-error-500 mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Task
            </Button>
          </div>
        </form>
      </GlassContainer>
    </div>
  );
};

export default AddTaskModal;