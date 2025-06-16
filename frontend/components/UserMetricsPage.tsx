
import React from 'react';
import { UserMetrics } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface UserMetricsPageProps {
  metrics: UserMetrics | null;
  isLoading: boolean;
}

const MetricCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode, description?: string }> = ({ title, value, icon, description }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="flex items-center mb-3">
      {icon && <div className="mr-3 text-primary-500 dark:text-primary-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{title}</h3>
    </div>
    <p className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-1">{value}</p>
    {description && <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
  </div>
);

const UserMetricsPage: React.FC<UserMetricsPageProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center h-96">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Calculating your metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Metrics Available</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Start creating and completing learning paths to see your progress here.
        </p>
      </div>
    );
  }

  const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>;
  const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  const ListBulletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
  const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>;


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-10">
        Your Learning Metrics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Paths Created" 
          value={metrics.totalPaths} 
          icon={<FolderIcon />}
          description="Number of learning paths you've initiated."
        />
        <MetricCard 
          title="Fully Completed Paths" 
          value={metrics.completedPaths} 
          icon={<CheckBadgeIcon />}
          description="Paths where all modules are marked complete."
        />
        <MetricCard 
          title="Total Modules Engaged" 
          value={metrics.totalModules} 
          icon={<ListBulletIcon />}
          description="Total number of modules across all your paths."
        />
        <MetricCard 
          title="Completed Modules" 
          value={metrics.completedModules} 
          icon={<SparklesIcon />}
          description="Modules you've marked as complete."
        />
      </div>

      {metrics.totalModules > 0 && (
        <div className="mt-12 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-center text-primary-700 dark:text-primary-400 mb-6">
            Overall Progress
          </h2>
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-secondary-700 dark:text-secondary-400">Average Completion Rate</span>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-400">{metrics.averageCompletionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div 
                className="bg-secondary-600 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-500 ease-out" 
                style={{ width: `${metrics.averageCompletionRate}%` }}
                aria-valuenow={metrics.averageCompletionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
               {metrics.averageCompletionRate > 10 ? `${metrics.averageCompletionRate}%` : ''}
              </div>
            </div>
             <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                This shows the average percentage of modules completed across all your paths.
            </p>
          </div>
        </div>
      )}
       <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Keep learning and watch your progress grow!
      </p>
    </div>
  );
};

export default UserMetricsPage;
