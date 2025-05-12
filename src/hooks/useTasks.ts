import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

export interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

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
      const res = await axios.get(`${API_URL}/api/tasks`);
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
      const res = await axios.post(`${API_URL}/api/tasks`, taskData);
      setTasks((prevTasks) => [...prevTasks, res.data]);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add task');
      throw err;
    }
  };

  // Update a task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${id}`, updates);
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
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete task');
      throw err;
    }
  };

  // Mark task as complete
  const markTaskComplete = async (id: string) => {
    try {
      const res = await axios.put(`${API_URL}/api/tasks/${id}`, {
        status: 'completed',
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? res.data : task))
      );
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update task status');
      throw err;
    }
  };

  // Get upcoming tasks (pending tasks ordered by deadline)
  const upcomingTasks = tasks
    .filter((task) => task.status === 'pending')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5); // Get only 5 nearest deadline tasks

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
  };
};