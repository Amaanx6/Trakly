export interface Task {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface AnswersResponse {
  questions: QuestionAnswer[];
}