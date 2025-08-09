
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-t-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};
