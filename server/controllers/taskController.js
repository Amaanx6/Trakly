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
    // Log raw request data before validation
    console.log('Raw request body:', req.body);
    console.log('Received file:', req.file);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, deadline, priority, status } = req.body;
    const userId = req.user?.id;

    // Log parsed body after validation
    console.log('Parsed request body:', { title, description, deadline, priority, status });

    // Verify user authentication
    if (!userId) {
      console.error('User ID missing in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Ensure required fields
    if (!title?.trim() || !deadline) {
      console.error('Missing required fields:', { title, deadline });
      return res.status(400).json({ message: 'Title is required' });
    }

    const pdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
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
    const userId = req.user.id;

    const task = await Task.findOne({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    const updates = req.body;
    Object.assign(task, updates);
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error while deleting task', error: err.message });
  }
};

export const getAnswersFromPDF = async (req, res) => {
  let pdfParse;
  try {
    // Lazy-load pdf-parse to avoid initialization errors
    pdfParse = (await import('pdf-parse')).default;
  } catch (err) {
    console.error('Error loading pdf-parse:', err);
    return res.status(500).json({ message: 'Failed to load PDF parser', error: err.message });
  }

  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task || !task.pdfUrl) {
      return res.status(404).json({ message: 'Task or PDF not found' });
    }

    const pdfPath = `./${task.pdfUrl}`;
    let dataBuffer;
    try {
      dataBuffer = await pdfParse(pdfPath);
    } catch (err) {
      console.error('Error parsing PDF:', err);
      return res.status(500).json({ message: 'Failed to parse PDF', error: err.message });
    }

    const pdfText = dataBuffer.text;

    const prompt = `Extract questions and their answers from the following PDF text. Format the output as a JSON array of objects, each with "question" and "answer" fields. If no clear question-answer pairs are found, return an empty array:\n\n${pdfText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questions;

    try {
      questions = JSON.parse(response.text());
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
    } catch (err) {
      console.error('Error parsing AI response:', err);
      questions = [];
    }

    res.status(200).json({ questions });
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).json({ message: 'Server error while processing PDF', error: err.message });
  }
};