import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    college: {
      type: String,
      required: [true, 'Please provide a college'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Please provide a year'],
      enum: ['1st', '2nd', '3rd', '4th'],
    },
    branch: {
      type: String,
      required: [true, 'Please provide a branch'],
      enum: ['IT', 'CSE', 'CSE AIML', 'CSD', 'EEE', 'ECE', 'ME'],
    },
    subjects: [{
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
    }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;