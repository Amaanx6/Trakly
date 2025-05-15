import { useEffect, useState } from 'react';
import { CheckIcon, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!id || !message) {
      console.warn('Invalid toast props:', { id, message, type });
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, message, type, duration, onClose]);

  if (!id || !message) {
    return null; // Skip rendering if props are invalid
  }

  const bgClasses = {
    success: 'bg-success-900/50 border-success-700',
    error: 'bg-error-900/50 border-error-700',
    info: 'bg-primary-900/50 border-primary-700',
  }[type];

  const icons = {
    success: <CheckIcon className="w-5 h-5 text-success-400" />,
    error: <AlertCircle className="w-5 h-5 text-error-400" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
  }[type];

  return (
    <div
      className={`glass-dark p-4 rounded-md border flex items-center gap-2 max-w-sm transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${bgClasses}`}
      role="alert"
    >
      {icons}
      <span className="text-sm text-white">{message}</span>
      <button
        type="button"
        className="ml-auto text-dark-300 hover:text-white"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;