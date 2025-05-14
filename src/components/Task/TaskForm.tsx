import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { API_URL } from './../../config/constants';

interface FormData {
  title: string;  // Title is required by backend validation
  description: string;
  deadline: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  // Your new field can be added here
}

const TaskForm = () => {
  const [formData, setFormData] = useState<FormData>({
    title: 'Auto-generated Task', // Default title to satisfy backend validation
    description: '',
    deadline: '',
    status: 'pending',
    priority: 'medium',
    // Initialize your new field here if needed
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
    
    if (!formData.deadline) {
      setError('Deadline is required');
      return;
    }

    try {
      // Create FormData object
      const data = new FormData();
      
      // Add title with default value to satisfy backend validation
      data.append('title', 'Auto-generated Task');
      data.append('deadline', formData.deadline);
      
      // Add optional fields
      data.append('description', formData.description.trim());
      data.append('status', formData.status);
      data.append('priority', formData.priority);
      
      // Add PDF if available
      if (pdf) {
        data.append('pdf', pdf);
      }

      // Debug log
      console.log('FormData contents:');
      for (const pair of data.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // Don't set Content-Type header when using FormData
        },
        body: data,
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server response:', responseData);
        if (responseData.errors && responseData.errors.length > 0) {
          // Format validation errors for display
          const errorMessages = responseData.errors.map((err: any) => 
            `${err.path}: ${err.msg}`
          ).join(', ');
          throw new Error(errorMessages || 'Failed to create task');
        } else {
          throw new Error(responseData.message || 'Failed to create task');
        }
      }

      setSuccess('Task created successfully');
      setFormData({
        title: 'Auto-generated Task', // Keep the default title
        description: '',
        deadline: '',
        status: 'pending',
        priority: 'medium',
        // Reset your new field here if needed
      });
      setPdf(null);
      (document.getElementById('pdf-input') as HTMLInputElement).value = '';
    } catch (err) {
      console.error('TaskForm submission failed:', err);
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Task</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Title is handled automatically in the background with a default value */}
        
        {/* Add your new field here */}
        
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            maxLength={500}
            placeholder="Enter task description"
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