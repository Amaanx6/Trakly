import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  reminderTime?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  pdfUrl?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  deadline: string;
  priority?: 'low' | 'medium' | 'high';
  pdf?: File;
  reminder?: '1hour' | '1day' | '';
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Task[]>('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      const upcoming = res.data.filter(task => {
        const deadline = new Date(task.deadline);
        const now = new Date();
        return deadline > now && task.status === 'pending';
      });
      setUpcomingTasks(upcoming);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: TaskInput) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', taskData.title);
      if (taskData.description) formData.append('description', taskData.description);
      formData.append('deadline', taskData.deadline);
      if (taskData.priority) formData.append('priority', taskData.priority);
      if (taskData.pdf) formData.append('pdf', taskData.pdf);
      if (taskData.reminder) formData.append('reminder', taskData.reminder);

      const res = await axios.post<Task>('/api/tasks', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTasks(prev => [...prev, res.data]);
      if (new Date(res.data.deadline) > new Date() && res.data.status === 'pending') {
        setUpcomingTasks(prev => [...prev, res.data]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.put<Task>(`/api/tasks/${id}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(prev => prev.map(task => (task._id === id ? res.data : task)));
      setUpcomingTasks(prev => prev.filter(task => task._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark task as complete');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(prev => prev.filter(task => task._id !== id));
      setUpcomingTasks(prev => prev.filter(task => task._id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  return {
    tasks,
    upcomingTasks,
    loading,
    error,
    fetchTasks,
    addTask,
    markTaskComplete,
    deleteTask,
  };
};