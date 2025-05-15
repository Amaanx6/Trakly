// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { Task } from '../types';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const allTasks: Task[] = Array.isArray(response.data) ? response.data : [];
      setTasks(allTasks);
      
      // Set upcoming tasks (due in the next 7 days)
      const now = new Date();
      const next7Days = new Date(now);
      next7Days.setDate(now.getDate() + 7);
      
      const upcoming = allTasks.filter(
        (task: Task) => 
          task.status !== 'completed' && 
          new Date(task.deadline) >= now && 
          new Date(task.deadline) <= next7Days
      ).sort((a: Task, b: Task) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
      
      setUpcomingTasks(upcoming);
      return allTasks;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addTask = useCallback(async (taskData: Partial<Task>) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch all tasks again to ensure everything is up to date
      await fetchTasks();
      
      showToast('Task added successfully!', 'success');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error adding task:', err);
      throw err;
    }
  }, [token, fetchTasks, showToast]);

  const markTaskComplete = useCallback(async (id: string) => {
    setError(null);
    try {
      await axios.patch(
        `${API_URL}/api/tasks/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state without refetching
      setTasks(prev => prev.map(task => 
        task._id === id ? { ...task, status: 'completed' } : task
      ));
      
      setUpcomingTasks(prev => prev.filter(task => task._id !== id));
      
      showToast('Task marked as complete!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error marking task complete:', err);
    }
  }, [token, showToast]);

  const deleteTask = useCallback(async (id: string) => {
    setError(null);
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state without refetching
      setTasks(prev => prev.filter(task => task._id !== id));
      setUpcomingTasks(prev => prev.filter(task => task._id !== id));
      
      showToast('Task deleted successfully!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Error deleting task:', err);
    }
  }, [token, showToast]);

  // Load tasks on initial render
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token, fetchTasks]);

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