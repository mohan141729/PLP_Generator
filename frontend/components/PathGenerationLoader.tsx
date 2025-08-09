import React from 'react';

export const PathGenerationLoader: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Generating Your Learning Path
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our AI is crafting a personalized learning journey for you...
            </p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              This usually takes 10-30 seconds
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Please don't close this window
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
