import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error while fetching tasks', error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, deadline, priority, status } = req.body;
    const userId = req.user?.id;

    // Verify user authentication
    if (!userId) {
      console.error('User ID missing in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Ensure required fields
    if (!title || !deadline) {
      console.error('Missing required fields:', { title, deadline });
      return res.status(400).json({ message: 'Title and deadline are required' });
    }

    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const task = await Task.create({
      title,
      description,
      deadline,
      priority: priority || 'medium',
      status: status || 'pending',
      user: userId,
      pdfUrl,
    });

    console.log('Task created:', task._id);
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error while creating task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, status, priority } = req.body;

    let task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task = await Task.findByIdAndUpdate(
      id,
      { title, description, deadline, status, priority },
      { new: true, runValidators: true }
    );

    res.status(200).json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error while deleting task', error: err.message });
  }
};

export const getAnswersFromPDF = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task || !task.pdfUrl) {
      return res.status(404).json({ message: 'Task or PDF not found' });
    }

    const file = await genAI.fileManager.uploadFile(task.pdfUrl, {
      mimeType: 'application/pdf',
      displayName: `Task-${taskId}.pdf`,
    });

    const prompt = 'Extract key questions and their answers from the uploaded PDF. Return in JSON format with keys "questions" (array of objects with "question" and "answer").';
    const result = await model.generateContent([
      { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
      { text: prompt },
    ]);
    const answers = JSON.parse(result.response.text());

    res.status(200).json(answers);
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).json({ message: 'Error processing PDF', error: err.message });
  }
};