import { useState, FormEvent, ChangeEvent } from 'react';
import { API_URL } from './../../config/constants';

interface FormData {
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const TaskForm = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    deadline: '',
    status: 'pending',
    priority: 'medium',
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

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
    setSuccess('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('deadline', formData.deadline);
    data.append('status', formData.status);
    data.append('priority', formData.priority);
    if (pdf) {
      data.append('pdf', pdf);
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      setSuccess('Task created successfully');
      setFormData({
        title: '',
        description: '',
        deadline: '',
        status: 'pending',
        priority: 'medium',
      });
      setPdf(null);
      (document.getElementById('pdf-input') as HTMLInputElement).value = '';
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Task</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            maxLength={100}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            maxLength={500}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Upload Assignment PDF</label>
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;