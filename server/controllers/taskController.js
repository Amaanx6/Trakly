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
      console.log('PDF text (first 2000 chars):', pdfText.substring(0, 2000));
    } catch (err) {
      console.error('Error parsing PDF:', err);
      console.error('Error stack:', err.stack);
      return res.status(500).json({ message: 'Failed to parse PDF', error: err.message });
    }

    if (!pdfText.trim()) {
      console.log('No text extracted from PDF');
      return res.status(200).json({ questions: [], message: 'No text extracted from PDF' });
    }

    // Step 1: Extract questions
    const questionPrompt = `You are an expert at extracting questions from text. Analyze the following PDF text and identify all questions. Questions may be:
- Numbered (e.g., "1.", "1)").
- Bulleted (e.g., "•", "-").
- Plain text ending with "?" or implying a query.
- In headings, paragraphs, or lists.
Format the output as a JSON array of strings, each string being a question. If no questions are found, return an empty array. Example output: ["What is the capital of France?", "What is 2 + 2?"]:\n\n${pdfText}`;

    console.log('Sending question extraction prompt to Google Generative AI, prompt length:', questionPrompt.length);
    let questionResult;
    try {
      questionResult = await model.generateContent(questionPrompt);
    } catch (err) {
      console.error('Error calling Google Generative AI for question extraction:', err);
      console.error('Error stack:', err.stack);
      return res.status(500).json({ message: 'Failed to extract questions with AI', error: err.message });
    }

    let extractedQuestions = [];
    try {
      const questionText = (await questionResult.response.text()).replace(/```json\n|\n```/g, '').trim();
      console.log('Question extraction AI response:', questionText);
      extractedQuestions = JSON.parse(questionText);
      if (!Array.isArray(extractedQuestions)) {
        throw new Error('Question extraction AI response is not an array');
      }
    } catch (err) {
      console.error('Error parsing question extraction AI response:', err);
      console.log('Raw question AI response:', (await questionResult.response.text()).substring(0, 1000));
      extractedQuestions = [];
    }

    console.log('Extracted questions:', extractedQuestions);

    if (!extractedQuestions.length) {
      console.log('No questions found in PDF text');
      return res.status(200).json({ questions: [], message: 'No questions found in the PDF text' });
    }

    // Step 2: Generate answers for each question
    const questionsWithAnswers = [];
    for (const question of extractedQuestions) {
      const answerPrompt = `Provide a concise and accurate answer to the following question. Return the answer as plain text:\n\n${question}`;
      console.log('Sending answer generation prompt for question:', question);
      try {
        const answerResult = await model.generateContent(answerPrompt);
        const answerText = (await answerResult.response.text()).trim();
        console.log('Answer generated for question:', { question, answer: answerText });
        questionsWithAnswers.push({ question, answer: answerText });
      } catch (err) {
        console.error('Error generating answer for question:', question, err);
        questionsWithAnswers.push({ question, answer: 'Failed to generate answer' });
      }
    }

    console.log('Returning questions with answers:', questionsWithAnswers);
    res.status(200).json({ 
      questions: questionsWithAnswers, 
      message: questionsWithAnswers.length ? undefined : 'No questions found in the PDF text' 
    });
  } catch (err) {
    console.error('Error processing PDF:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ message: 'Server error while processing PDF', error: err.message });
  }
};