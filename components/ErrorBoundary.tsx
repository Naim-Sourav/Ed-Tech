import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-4 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 text-red-500">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            দুঃখিত, একটি সমস্যা হয়েছে!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            অ্যাপ্লিকেশনটি লোড করতে সমস্যা হচ্ছে। দয়া করে পেজটি রিফ্রেশ করুন অথবা কিছুক্ষণ পর আবার চেষ্টা করুন।
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-8 max-w-lg w-full overflow-auto text-left">
             <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {this.state.error?.toString()}
             </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all flex items-center gap-2"
          >
            <RefreshCw size={18} /> পেজ রিফ্রেশ করুন
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
