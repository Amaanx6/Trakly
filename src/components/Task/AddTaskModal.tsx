import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../Common/Button';
import { TaskInput } from '../../hooks/useTasks';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: TaskInput) => Promise<void>;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tempDeadline, setTempDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [pdf, setPdf] = useState<File | null>(null);
  const [reminder, setReminder] = useState<'1hour' | '1day' | ''>('');
  const [type, setType] = useState<'assignment' | 'surprise test'>('assignment');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadline) {
      alert('Please confirm the deadline by clicking OK.');
      return;
    }
    await onAddTask({ title, description, deadline, priority, pdf: pdf || undefined, reminder, type });
    setTitle('');
    setDescription('');
    setDeadline('');
    setTempDeadline('');
    setPriority('medium');
    setPdf(null);
    setReminder('');
    setType('assignment');
    onClose();
  };

  const handleDeadlineConfirm = () => {
    if (tempDeadline) {
      setDeadline(tempDeadline);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Task</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6 text-dark-300" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-dark-300 mb-2">
              Title <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-dark-300 mb-2">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'assignment' | 'surprise test')}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
            >
              <option value="assignment">Assignment</option>
              <option value="surprise test">Surprise Test</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-dark-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="deadline" className="block text-dark-300 mb-2">
              Deadline <span className="text-error-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                id="deadline"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                className="w-full p-2 rounded bg-dark-700 text-dark-100"
                required
              />
              <Button type="button" onClick={handleDeadlineConfirm}>
                OK
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="priority" className="block text-dark-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="reminder" className="block text-dark-300 mb-2">
              Reminder
            </label>
            <select
              id="reminder"
              value={reminder}
              onChange={(e) => setReminder(e.target.value as '1hour' | '1day' | '')}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
            >
              <option value="">None</option>
              <option value="1hour">1 Hour Before</option>
              <option value="1day">1 Day Before</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="pdf" className="block text-dark-300 mb-2">
              PDF (Optional)
            </label>
            <input
              type="file"
              id="pdf"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files?.[0] || null)}
              className="w-full p-2 rounded bg-dark-700 text-dark-100"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;