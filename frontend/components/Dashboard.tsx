import React, { useMemo } from 'react';
import { LearningPath, UserMetrics } from '../types';

type View = 'landing' | 'login' | 'dashboard' | 'create' | 'metrics';

interface DashboardProps {
  learningPaths: LearningPath[];
  onViewPath: (path: LearningPath) => void;
  onDeletePath: (pathId: string) => void;
  onNavigate: (view: View, params?: { mode?: 'login' | 'register' }) => void;
  userMetrics?: UserMetrics;
}

const PathCard: React.FC<{ path: LearningPath; onView: () => void; onDelete: () => void }> = ({ path, onView, onDelete }) => {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const { totalModules, completedModules, progressPercentage } = useMemo(() => {
    let total = 0;
    let completed = 0;
    path.levels.forEach(level => {
      level.modules.forEach(module => {
        total++;
        if (module.isCompleted) {
          completed++;
        }
      });
    });
    return {
      totalModules: total,
      completedModules: completed,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [path]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-2 truncate" title={path.topic}>
          {path.topic}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Created: {formatDate(path.createdAt)}
        </p>
        
        {totalModules > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-600 dark:text-gray-300">Progress</span>
              <span className="font-medium text-gray-600 dark:text-gray-300">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{completedModules} / {totalModules} modules</p>
          </div>
        )}
         {totalModules === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic">No modules in this path yet.</p>
        )}
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onView}
            className="px-4 py-2 text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 dark:focus:ring-offset-gray-800"
          >
            View Details
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-700 dark:hover:bg-red-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ learningPaths, onViewPath, onDeletePath, onNavigate }) => {
  if (learningPaths.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Learning Paths Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start your learning journey by creating a personalized path.
        </p>
        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Learning Path
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Learning Dashboard</h1>
        <button
          onClick={() => onNavigate('create')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-gray-800"
        >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Path
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths.map((path) => (
          <PathCard
            key={path.id}
            path={path}
            onView={() => onViewPath(path)}
            onDelete={() => {
              if (window.confirm(`Are you sure you want to delete the path "${path.topic}"? This action cannot be undone.`)) {
                onDeletePath(path.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
