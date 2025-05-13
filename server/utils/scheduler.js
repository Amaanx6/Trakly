import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendReminderEmail } from './mailer.js';

export const scheduleReminders = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const tasks = await Task.find({
      reminderTime: { $lte: now },
      status: 'pending',
    }).populate('user');
    for (const task of tasks) {
      await sendReminderEmail(task.user.email, task);
      task.reminderTime = null; // Prevent re-sending
      await task.save();
    }
  });
};