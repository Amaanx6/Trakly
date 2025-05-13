// In server/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    type: {
      type: String,
      required: [true, 'Task type is required'],
      enum: ['Assignment', 'Surprise Test'],
    },
    subject: {
      subjectCode: {
        type: String,
        required: [true, 'Subject code is required'],
        trim: true,
      },
      subjectName: {
        type: String,
        required: [true, 'Subject name is required'],
        trim: true,
      },
    },
    taskNumber: {
      type: Number,
      required: [true, 'Task number is required'],
      min: 1,
      max: 5,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide a deadline'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      default: '1', // Adjust based on logic
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ user: 1, type: 1, 'subject.subjectCode': 1, semester: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;