import { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from '../components/Common/Toast';

type ToastType = 'success' | 'error' | 'info';

type ToastContextType = {
  showToast: (message: string, type: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    if (!message || !['success', 'error', 'info'].includes(type)) {
      console.warn('Invalid toast:', { message, type, duration });
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const toast = {
      id,
      message,
      type,
      duration,
      onClose: (toastId: string) => {
        console.log('Closing toast:', toastId);
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
      },
    };

    console.log('Showing toast:', toast);
    setToasts((prevToasts) => [...prevToasts, toast]);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-4 flex flex-col items-end">
        {toasts.map((toast, index) => {
          if (!toast?.id || !toast?.message) {
            console.warn('Skipping invalid toast at index:', index, toast);
            return null;
          }
          return <Toast key={toast.id} {...toast} />;
        })}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;