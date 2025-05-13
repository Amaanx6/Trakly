// In src/types.ts
export interface Task {
  _id: string;
  type: 'Assignment' | 'Surprise Test';
  subject: { subjectCode: string; subjectName: string };
  taskNumber: number;
  deadline: string;
  description?: string;
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