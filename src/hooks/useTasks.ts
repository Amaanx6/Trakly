import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { Task, TaskInput, AnswersResponse } from '../types';

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
  getAnswers: (taskId: string) => Promise<AnswersResponse>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new task
  const addTask = async (taskData: TaskInput) => {
    try {
      const formData = new FormData();
      formData.append('title', taskData.title);
      formData.append('description', taskData.description);
      formData.append('deadline', taskData.deadline);
      formData.append('priority', taskData.priority);
      if (taskData.status) {
        formData.append('status', taskData.status);
      }
      if (taskData.pdf) {
        formData.append('pdf', taskData.pdf);
      }

      const res = await axios.post(`${API_URL}/api/tasks`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prevTasks) => [...prevTasks, res.data]);
      return res.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to add task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update a task
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
      setError(err.response?.data?.message || 'Failed to update task');
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  // Mark task as complete
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
      setError(err.response?.data?.message || 'Failed to update task status');
      throw err;
    }
  };

  // Get answers from PDF
  const getAnswers = async (taskId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/${taskId}/answers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch answers');
      throw err;
    }
  };

  // Get upcoming tasks
  const upcomingTasks = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Fetch tasks on component mount
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

export type { TaskInput, Task };
