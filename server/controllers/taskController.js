import { validationResult } from 'express-validator';
import Task from '../models/Task.js';

// Get all tasks for a user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, deadline, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      priority,
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status, priority } = req.body;

    // Find the task
    let task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update task
    task = await Task.findByIdAndUpdate(
      id,
      { title, description, deadline, status, priority },
      { new: true, runValidators: true }
    );

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the task
    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Delete task
    await Task.findByIdAndDelete(id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};