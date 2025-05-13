import { validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

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
    console.log('Raw request body:', req.body);
    console.log('Received file:', req.file);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, deadline, priority, status } = req.body;
    const userId = req.user?.id;

    console.log('Parsed request body:', { title, description, deadline, priority, status });

    if (!userId) {
      console.error('User ID missing in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
  let PDFParser;
  try {
    console.log('Loading pdf2json module');
    PDFParser = (await import('pdf2json')).default;
    console.log('pdf2json loaded successfully');
  } catch (err) {
    console.error('Error loading pdf2json:', err);
    return res.status(500).json({ message: 'Failed to load PDF parser', error: err.message });
  }

  try {
    const { taskId } = req.params;
    const userId = req.user?.id;
    console.log('Fetching task:', { taskId, userId });

    if (!userId) {
      console.error('User ID missing in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      console.error('Task not found for user:', { taskId, userId });
      return res.status(404).json({ message: 'Task not found' });
    }
    if (!task.pdfUrl) {
      console.error('No PDF associated with task:', taskId);
      return res.status(404).json({ message: 'PDF not found for this task' });
    }

    const pdfPath = path.resolve(process.cwd(), task.pdfUrl.replace(/^\//, ''));
    console.log('Resolved PDF path:', pdfPath);

    try {
      await fs.access(pdfPath, fs.constants.R_OK);
      console.log('PDF file exists and is readable:', pdfPath);
      const stats = await fs.stat(pdfPath);
      console.log('PDF file stats:', { size: stats.size, isFile: stats.isFile() });
    } catch (err) {
      console.error('PDF file not found or inaccessible:', pdfPath, err);
      return res.status(500).json({ message: 'PDF file not found or inaccessible', error: err.message });
    }

    let pdfText = '';
    try {
      console.log('Parsing PDF:', pdfPath);
      const pdfParser = new PDFParser();
      pdfText = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData) => {
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });
        pdfParser.on('pdfParser_dataReady', (pdfData) => {
          const text = pdfData.Pages.map((page) =>
            page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(' ')
          ).join('\n');
          resolve(text);
        });
        pdfParser.loadPDF(pdfPath);
      });
      console.log('PDF parsed successfully, text length:', pdfText.length);
      console.log('PDF text (first 500 chars):', pdfText.substring(0, 500));
    } catch (err) {
      console.error('Error parsing PDF:', err);
      console.error('Error stack:', err.stack);
      return res.status(500).json({ message: 'Failed to parse PDF', error: err.message });
    }

    if (!pdfText.trim()) {
      console.log('No text extracted from PDF');
      return res.status(200).json({ questions: [], message: 'No text extracted from PDF' });
    }

    const prompt = `You are an expert at extracting structured data from text. Analyze the following PDF text and identify question-answer pairs. A question is typically followed by an answer, which may be in a sentence, paragraph, or list format. Questions may be numbered (e.g., "1."), bulleted, or in plain text. Format the output as a JSON array of objects, each with "question" and "answer" fields. If no question-answer pairs are found, return an empty array. Example output: [{"question": "What is the capital of France?", "answer": "Paris"}]:\n\n${pdfText}`;

    console.log('Sending prompt to Google Generative AI, prompt length:', prompt.length);
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error('Error calling Google Generative AI:', err);
      console.error('Error stack:', err.stack);
      return res.status(500).json({ message: 'Failed to process PDF content with AI', error: err.message });
    }

    const response = await result.response;
    let questions;

    try {
      const text = response.text();
      console.log('AI response received, full text:', text);
      questions = JSON.parse(text);
      if (!Array.isArray(questions)) {
        throw new Error('AI response is not an array');
      }
    } catch (err) {
      console.error('Error parsing AI response:', err);
      console.log('Raw AI response:', response.text().substring(0, 1000));
      questions = [];
    }

    console.log('Returning questions:', questions);
    res.status(200).json({ 
      questions, 
      message: questions.length ? undefined : pdfText.trim() ? 'No question-answer pairs found in the PDF text' : 'No text extracted from PDF' 
    });
  } catch (err) {
    console.error('Error processing PDF:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ message: 'Server error while processing PDF', error: err.message });
  }
};