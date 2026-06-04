import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <Inbox className="w-12 h-12 text-gray-300 dark:text-zinc-600" />, 
  message, 
  actionText, 
  onActionClick,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800 shadow-sm max-w-md mx-auto my-6 animate-page-enter ${className}`}>
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 mb-4 font-tiro leading-relaxed">
        {message}
      </p>
      {actionText && onActionClick && (
        <button 
          onClick={onActionClick}
          className="px-5 py-2.5 bg-[#ff5200] hover:bg-[#ff5200]/90 text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all w-full max-w-xs font-tiro"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
