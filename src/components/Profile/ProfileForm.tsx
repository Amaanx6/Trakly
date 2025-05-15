import React, { useState, useEffect } from 'react';
import { UserEdit } from '../../types';
// @ts-ignore
import { SaveIcon, XIcon, CheckIcon, AlertCircle } from 'lucide-react';
import Button from '../Common/Button';

type ProfileFormProps = {
  initialData: UserEdit;
  onSave: (userData: UserEdit) => Promise<void>;
  onCancel: () => void;
};

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserEdit>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof UserEdit, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof UserEdit]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserEdit, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
    } else if (formData.college.length > 100) {
      newErrors.college = 'College must be 100 characters or less';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!['1', '2', '3', '4', '5'].includes(formData.year)) {
      newErrors.year = 'Year must be between 1 and 5';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required';
    } else if (formData.branch.length > 50) {
      newErrors.branch = 'Branch must be 50 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSave(formData);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // @ts-ignore
  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setSubmitStatus('idle');
  };

  return (
    <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          id="name"
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter your full name"
        />

        <FormField
          id="college"
          name="college"
          label="College"
          value={formData.college}
          onChange={handleChange}
          error={errors.college}
          placeholder="Enter your college name"
        />

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-dark-300 mb-2">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`form-input w-full ${errors.year ? 'border-error-500 focus:ring-error-500' : ''}`}
          >
            <option value="">Select year</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Fourth Year</option>
            <option value="5">Fifth Year</option>
          </select>
          {errors.year && (
            <p className="mt-2 text-sm text-error-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
              {errors.year}
            </p>
          )}
        </div>

        <FormField
          id="branch"
          name="branch"
          label="Branch"
          value={formData.branch}
          onChange={handleChange}
          error={errors.branch}
          placeholder="Enter your branch"
        />
      </div>

      {submitStatus === 'success' && (
        <div className="p-3 bg-success-900/20 border border-success-700/50 rounded-xl text-success-300 flex items-center text-sm shadow-md backdrop-blur-sm animate-fadeIn">
          <CheckIcon className="w-5 h-5 mr-2.5 text-success-400" />
          Profile updated successfully!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-3 bg-error-900/20 border border-error-700/50 rounded-xl text-error-300 flex items-center text-sm shadow-md backdrop-blur-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 mr-2.5 text-error-400" />
          Failed to update profile. Please try again.
        </div>
      )}

      <div className="flex gap-4 mt-8">
        <Button
          type="button"
          variant="secondary"
          className="flex-1 py-3 text-base hover-glow bg-dark-700/50"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1 py-3 text-base bg-gradient-to-r from-primary-600 to-primary-500 hover-glow"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({ id, name, label, value, onChange, error, placeholder }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-dark-300 mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input w-full ${error ? 'border-error-500 focus:ring-error-500' : ''}`}
      />
      {error && (
        <p className="mt-2 text-sm text-error-400 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfileForm;