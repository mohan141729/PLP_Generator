
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-8">
      <div className="w-12 h-12 border-4 border-t-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Generating Learning Path...</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments. Please wait.</p>
    </div>
  );
};
