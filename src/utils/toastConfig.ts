import { toast } from 'react-hot-toast';

// Configurações padrão para toasts
export const toastConfig = {
  position: 'top-right' as const,
  duration: 4000,
  style: {
    background: '#363636',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 16px',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
  loading: {
    duration: 2000,
    iconTheme: {
      primary: '#3b82f6',
      secondary: '#fff',
    },
  },
};

// Funções helper para tipos específicos de toast
export const showSuccess = (message: string) => toast.success(message, toastConfig.success);
export const showError = (message: string) => toast.error(message, toastConfig.error);
export const showLoading = (message: string) => toast.loading(message, toastConfig.loading);
export const showInfo = (message: string) => toast(message, toastConfig);

export default toastConfig;
