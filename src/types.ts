export interface User {
  id: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  branch?: string;
  subjects?: { subjectCode: string; subjectName: string }[];
  semester?: string;
}

export interface UserEdit {
  name: string;
  college: string;
  year: string;
  branch: string;
}

export interface Task {
  _id: string;
  user: string;
  type: string;
  subject: { subjectCode: string; subjectName: string };
  taskNumber: number;
  deadline: string;
  description: string;
  pdfUrl?: string;
  semester: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}