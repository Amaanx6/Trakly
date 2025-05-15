import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDown } from 'lucide-react';

// Define Subject interface
interface Subject {
  subjectCode: string;
  subjectName: string;
  _id: string;
}

const TaskForm = ({ isOpen, onClose, onAddTask }: { isOpen: boolean; onClose: () => void; onAddTask: () => void }) => {
  const [type, setType] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [semester] = useState('1');
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();

  // Use subjects from the authenticated user instead of making a separate API call
  useEffect(() => {
    if (user?.subjects) {
      // Ensure each subject has an _id property
      setSubjects(
        user.subjects.map((subject: any, idx: number) => ({
          ...subject,
          _id: subject._id ?? subject.subjectCode ?? String(idx),
        }))
      );
    }
  }, [user]);

  useEffect(() => {
    if (type && subjectCode && semester && token) {
      setIsLoading(true);
      axios
        .get('/api/tasks/available-task-numbers', {
          params: { type, subjectCode, semester },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const numbers = res.data as number[];
          setAvailableNumbers(numbers);
          setTaskNumber(numbers[0]?.toString() || '');
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Failed to fetch task numbers');
          setIsLoading(false);
        });
    }
  }, [type, subjectCode, semester, token]);

  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    if (!type) errors.type = 'Task type is required';
    if (!subjectCode) errors.subjectCode = 'Subject is required';
    if (!taskNumber) errors.taskNumber = 'Task number is required';
    if (!deadline) errors.deadline = 'Deadline is required';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('subjectCode', subjectCode);
    formData.append('taskNumber', taskNumber);
    formData.append('deadline', deadline);
    formData.append('description', description);
    formData.append('semester', semester);
    if (pdf) formData.append('pdf', pdf);

    setIsSubmitting(true);
    try {
      await axios.post('/api/tasks', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset form fields
      setType('');
      setSubjectCode('');
      setTaskNumber('');
      setDeadline('');
      setDescription('');
      setPdf(null);
      
      // Notify parent component about successful task creation
      onAddTask();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setType('');
      setSubjectCode('');
      setTaskNumber('');
      setDeadline('');
      setDescription('');
      setPdf(null);
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-6">
      <div className="glass-card rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1e293b]/95 backdrop-blur-sm p-4 border-b border-slate-700 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white">Create Task</h3>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400 rounded-md">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <div className="relative">
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field appearance-none w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500 text-base"
                  aria-label="Task Type"
                  required
                >
                  <option value="" disabled>
                    Select Type
                  </option>
                  <option value="Assignment">Assignment</option>
                  <option value="Surprise Test">Surprise Test</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.type && <p className="text-red-400 text-xs mt-1">{fieldErrors.type}</p>}
            </div>

            <div>
              <label htmlFor="subjectCode" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <div className="relative">
                <select
                  id="subjectCode"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="input-field appearance-none w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500 text-base"
                  aria-label="Subject"
                  required
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    {isLoading ? "Loading subjects..." : "Select Subject"}
                  </option>
                  {subjects?.map((subject) => (
                    <option key={subject._id || subject.subjectCode} value={subject.subjectCode}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.subjectCode && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.subjectCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="taskNumber" className="block text-sm font-medium text-slate-300 mb-2">
                Task Number
              </label>
              <div className="relative">
                <select
                  id="taskNumber"
                  value={taskNumber}
                  onChange={(e) => setTaskNumber(e.target.value)}
                  className="input-field appearance-none w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-500 text-base"
                  aria-label="Task Number"
                  required
                  disabled={isLoading || !subjectCode || !type}
                >
                  <option value="" disabled>
                    {isLoading ? "Loading numbers..." : "Select Task Number"}
                  </option>
                  {availableNumbers.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.taskNumber && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.taskNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-2">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                aria-label="Deadline"
                required
              />
              {fieldErrors.deadline && <p className="text-red-400 text-xs mt-1">{fieldErrors.deadline}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base"
                rows={3}
                aria-label="Description"
              />
            </div>

            <div>
              <label htmlFor="pdf" className="block text-sm font-medium text-slate-300 mb-2">
                PDF Upload
              </label>
              <input
                type="file"
                id="pdf"
                accept=".pdf"
                onChange={(e) => setPdf(e.target.files?.[0] || null)}
                className="input-field w-full p-2 rounded-md bg-[#2d3748] text-white border border-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all text-sm"
                aria-label="PDF Upload"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto mt-2 sm:mt-0 hover:bg-slate-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full sm:w-auto hover:bg-blue-600 transition-colors"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;