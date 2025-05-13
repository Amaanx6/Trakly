import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReminderEmail = async (to, task) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Reminder: ${task.title} Due Soon`,
    text: `Hi,\n\nYour task "${task.title}" is due on ${new Date(task.deadline).toLocaleString()}.\n\nBest,\nTrakly Team`,
  };
  await transporter.sendMail(mailOptions);
};