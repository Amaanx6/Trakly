export interface Task {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  user: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed';
  pdf?: File;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface AnswersResponse {
  questions: QuestionAnswer[];
}