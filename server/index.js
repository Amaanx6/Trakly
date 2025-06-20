import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userSubjects from './routes/userSubjects.js';
import path from 'path';
import { scheduleReminders } from './utils/scheduler.js';
import './middleware/passport.js'; // Import Passport configuration

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// const corsOptions = {
//   origin: ['https://trakly.vercel.app', 'http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// };

app.use(cors());
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/Uploads', express.static(path.join('/tmp', 'Uploads')));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/get', userSubjects);

app.get('/', (req, res) => {
  res.send('Assignment Tracker API is running');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});
const VITE_MONGO_URI = String(process.env.VITE_MONGO_URI);
mongoose.connect(VITE_MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    scheduleReminders();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
  

  