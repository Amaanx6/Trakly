import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { Task, TaskInput, QuestionAnswer } from '../types';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: TaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  markTaskComplete: (id: string) => Promise<Task>;
  upcomingTasks: Task[];
  getAnswers: (taskId: string) => Promise<QuestionAnswer[]>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = async (taskData: TaskInput) => {
    try {
      // Validate taskData
      if (!taskData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!taskData.deadline) {
        throw new Error('Deadline is required');
      }

      const formData = new FormData();
      formData.append('title', taskData.title.trim());
      formData.append('description', taskData.description?.trim() || '');
      formData.append('deadline', taskData.deadline);
      formData.append('priority', taskData.priority);
      if (taskData.status) {
        formData.append('status', taskData.status);
      }
      if (taskData.pdf) {
        formData.append('pdf', taskData.pdf);
      }

      // Log FormData entries
      const formDataEntries = Object.fromEntries(formData);
      console.log('useTasks addTask submitting FormData:', formDataEntries);

      const res = await axios.post(`${API_URL}/api/tasks`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTasks((prevTasks) => [...prevTasks, res.data]);
      return res.data;
    } catch (err: any) {
      console.error('useTasks addTask error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        err.message ||
        'Failed to add task';
      console.error('useTasks error details:', err.response?.data);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${id}`, updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? res.data : task))
      );
      return res.data;
    } catch (err: any) {
      console.error('Error updating task:', err);
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  const markTaskComplete = async (id: string) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/tasks/${id}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? res.data : task))
      );
      return res.data;
    } catch (err: any) {
      console.error('Error marking task complete:', err);
      setError(err.response?.data?.message || 'Failed to update task status');
      throw err;
    }
  };

  const getAnswers = async (taskId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/${taskId}/answers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.questions;
    } catch (err: any) {
      console.error('Error fetching answers:', err);
      setError(err.response?.data?.message || 'Failed to fetch answers');
      throw err;
    }
  };

  const upcomingTasks = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    markTaskComplete,
    upcomingTasks,
    getAnswers,
  };
};

export type { TaskInput };
  export type { Task };

