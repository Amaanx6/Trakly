import React, { useState } from 'react';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';
import { Clock, Trash2, CheckCircle, AlertTriangle, FileText, HelpCircle } from 'lucide-react';
import { Task, QuestionAnswer } from '../../types';
import Button from '../Common/Button';
import GlassContainer from '../Common/GlassContainer';
import { API_URL } from '../../config/constants';

interface TaskItemProps {
  task: Task;
  onMarkComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onGetAnswers?: (taskId: string) => Promise<{ questions: QuestionAnswer[], message?: string }>;
  initialAnswers?: { questions: QuestionAnswer[], message?: string };
}

const getUrgencyLevel = (deadline: string | Date): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  if (isPast(deadlineDate)) {
    return 3; // Very urgent (overdue)
  }
  
  const hoursRemaining = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hoursRemaining < 24) {
    return 2; // Urgent (due within 24 hours)
  } else if (hoursRemaining < 72) {
    return 1; // Approaching (due within 3 days)
  }
  
  return 0; // Not urgent
};

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onMarkComplete, 
  onDelete, 
  onGetAnswers,
  initialAnswers = { questions: [], message: undefined }
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>(initialAnswers.questions);
  const [answerMessage, setAnswerMessage] = useState<string | undefined>(initialAnswers.message);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState<string>('');

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await onMarkComplete(task._id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(task._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetAnswers = async () => {
    if (!onGetAnswers) return;
    
    setAnswerLoading(true);
    setAnswerError('');
    setAnswerMessage(undefined);
    
    try {
      const response = await onGetAnswers(task._id);
      console.log('TaskItem received answers:', response);
      setAnswers(response.questions);
      setAnswerMessage(response.message);
      setIsExpanded(true);
    } catch (err: any) {
      console.error('TaskItem error:', err);
      setAnswerError(err.message || 'Failed to fetch answers');
      setIsExpanded(true);
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleShowPDF = () => {
    if (task.pdfUrl) {
      const pdfUrl = `${API_URL}${task.pdfUrl}`;
      window.open(pdfUrl, '_blank');
    } else {
      alert('No PDF uploaded for this task');
    }
  };

  const deadlineDate = new Date(task.deadline);
  const isPastDeadline = isPast(deadlineDate) && task.status === 'pending';
  const urgencyLevel = getUrgencyLevel(task.deadline);

  let deadlineText = format(deadlineDate, 'MMM d, yyyy');
  if (isToday(deadlineDate)) deadlineText = `Today, ${format(deadlineDate, 'h:mm a')}`;
  if (isTomorrow(deadlineDate)) deadlineText = `Tomorrow, ${format(deadlineDate, 'h:mm a')}`;

  const timeRemaining =
    deadlineDate > new Date() ? formatDistanceToNow(deadlineDate, { addSuffix: true }) : 'Overdue';

  const priorityColor = {
    high: 'bg-error-900/50 text-error-300',
    medium: 'bg-warning-900/50 text-warning-300',
    low: 'bg-success-900/50 text-success-300',
  };

  const urgencyGlow = {
    3: 'bg-error-500 animate-pulse',
    2: 'bg-error-400',
    1: 'bg-warning-400',
    0: '',
  };

  return (
    <GlassContainer
      className={`
        rounded-lg transition-all duration-200 relative overflow-hidden
        ${task.status === 'completed' ? 'opacity-70' : ''} 
        ${isPastDeadline ? 'border-error-700 border-opacity-50' : ''}
      `}
    >
      {/* Ambient glow for task item */}
      {task.status === 'pending' && urgencyLevel > 0 && (
        <div className={`
          absolute inset-0 rounded-lg pointer-events-none
          ${urgencyGlow[urgencyLevel as keyof typeof urgencyGlow]}
          ${urgencyLevel === 3 ? 'opacity-15' : 'opacity-10'}
        `}></div>
      )}
      
      <div className="relative z-10 p-4">
        <div
          className="flex items-start justify-between gap-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className={`font-medium text-lg ${task.status === 'completed' ? 'line-through text-dark-400' : ''}`}
              >
                {task.subject.subjectName} - {task.type} {task.taskNumber}
                {/* @ts-ignore */}
                {task.title && ` - ${task.title}`}
              </h3>
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${priorityColor[task.priority]}
                `}
              >
                {task.priority}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-dark-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{deadlineText}</span>
              </div>

              {task.status === 'pending' && (
                <div className={`flex items-center gap-1 ${isPastDeadline ? 'text-error-400' : ''}`}>
                  {isPastDeadline && <AlertTriangle className="h-3.5 w-3.5" />}
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                isLoading={isCompleting}
                aria-label="Mark as completed"
                title="Mark as completed"
              >
                <CheckCircle className="h-5 w-5 text-success-500" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              isLoading={isDeleting}
              aria-label="Delete task"
              title="Delete task"
            >
              <Trash2 className="h-5 w-5 text-error-500" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 p-3 glass bg-dark-600/50 rounded-lg">
            <div className="flex flex-col gap-2 mb-3">
              <p className="text-dark-300 text-sm">
                {task.description || 'No description provided.'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowPDF}
                  leftIcon={<FileText className="h-4 w-4" />}
                  disabled={!task.pdfUrl}
                >
                  Show PDF
                </Button>
                {onGetAnswers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGetAnswers}
                    leftIcon={<HelpCircle className="h-4 w-4" />}
                    isLoading={answerLoading}
                    disabled={answerLoading}
                  >
                    Get Answers
                  </Button>
                )}
              </div>
            </div>

            {answerError && (
              <p className="text-error-500 text-sm">{answerError}</p>
            )}
            {answerMessage && (
              <p className="text-dark-300 text-sm">{answerMessage}</p>
            )}
            {answers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-md font-semibold text-dark-200">Answers</h4>
                {answers.map((qa, index) => (
                  <div key={index} className="text-sm text-dark-300">
                    <p><strong>Q: {qa.question}</strong></p>
                    <p>A: {qa.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassContainer>
  );
};

export default TaskItem;