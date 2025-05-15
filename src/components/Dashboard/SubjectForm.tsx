import { useState } from 'react';
import axios from 'axios';
import Button from '../Common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';

const SubjectForm = ({ onSubjectAdded }: { onSubjectAdded: () => void }) => {
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { showToast } = useToast();

  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    if (!subjectCode.trim()) errors.subjectCode = 'Subject code is required';
    if (!subjectName.trim()) errors.subjectName = 'Subject name is required';
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

    setIsSubmitting(true);
    
    try {
      await axios.post(
        '/api/users/subjects',
        { subjectCode, subjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show success toast notification
      showToast(`Subject "${subjectName}" added successfully!`, 'success');
      
      // Reset form fields
      setSubjectCode('');
      setSubjectName('');
      
      // Notify parent component about successful subject addition
      if (onSubjectAdded) {
        await onSubjectAdded();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add subject';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-4">Add Subject</h3>
      {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subjectCode" className="block text-sm font-medium text-slate-300 mb-1">
            Subject Code
          </label>
          <input
            type="text"
            id="subjectCode"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g., CS301"
            aria-label="Subject Code"
            required
            disabled={isSubmitting}
          />
          {fieldErrors.subjectCode && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.subjectCode}</p>
          )}
        </div>
        <div>
          <label htmlFor="subjectName" className="block text-sm font-medium text-slate-300 mb-1">
            Subject Name
          </label>
          <input
            type="text"
            id="subjectName"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="input-field w-full p-3 rounded-md bg-[#2d3748] text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g., Operating Systems"
            aria-label="Subject Name"
            required
            disabled={isSubmitting}
          />
          {fieldErrors.subjectName && (
            <p className="text-red-400 text-xs mt-1">{fieldErrors.subjectName}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full hover:bg-blue-600 transition-colors"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Subject'}
        </Button>
      </form>
    </div>
  );
};

export default SubjectForm;