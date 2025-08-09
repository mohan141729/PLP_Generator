import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SharedProgressData {
  overallMetrics: {
    totalPaths: number;
    completedPaths: number;
    totalModules: number;
    completedModules: number;
    averageCompletionRate: number;
  };
  pathMetrics: Array<{
    topic: string;
    completion_rate: number;
    is_completed: boolean;
    total_modules: number;
    completed_modules: number;
  }>;
  recentActivity?: {
    moduleActivity: Array<{
      module_title: string;
      level_name: string;
      path_topic: string;
      completed_at: string;
    }>;
    pathActivity: Array<{
      topic: string;
      created_at: string;
      total_modules: number;
      completed_modules: number;
    }>;
  };
  sharedAt: string;
}

const SharedProgressPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [progressData, setProgressData] = useState<SharedProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('No progress data found in the link');
      setLoading(false);
      return;
    }

    try {
      const decodedData = atob(dataParam);
      const parsedData = JSON.parse(decodedData);
      setProgressData(parsedData);
    } catch (err) {
      setError('Invalid or corrupted progress data');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared progress...</p>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Unable to load progress data'}</div>
          <p className="text-gray-600">The shared link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const { overallMetrics, pathMetrics, recentActivity, sharedAt } = progressData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Learning Progress</h1>
          <p className="text-gray-600">
            Progress shared on {new Date(sharedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Learning Paths</p>
                <p className="text-2xl font-semibold text-gray-900">{overallMetrics.totalPaths}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Paths</p>
                <p className="text-2xl font-semibold text-gray-900">{overallMetrics.completedPaths}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Modules</p>
                <p className="text-2xl font-semibold text-gray-900">{overallMetrics.totalModules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Modules</p>
                <p className="text-2xl font-semibold text-gray-900">{overallMetrics.completedModules}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Module Completion</span>
                <span>{overallMetrics.totalModules > 0 ? Math.round((overallMetrics.completedModules / overallMetrics.totalModules) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallMetrics.totalModules > 0 ? (overallMetrics.completedModules / overallMetrics.totalModules) * 100 : 0, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Path Completion Rate</span>
                <span>{overallMetrics.averageCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallMetrics.averageCompletionRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Path Progress */}
        {pathMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Path Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pathMetrics.map((path, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{path.topic}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      path.is_completed 
                        ? 'bg-green-100 text-green-800' 
                        : path.completion_rate >= 50 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {path.is_completed ? 'Completed' : `${path.completion_rate}%`}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{path.completed_modules}/{path.total_modules} modules</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          path.is_completed 
                            ? 'bg-green-500' 
                            : path.completion_rate >= 50 
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(path.completion_rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && recentActivity.moduleActivity.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.moduleActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.module_title}</p>
                    <p className="text-sm text-gray-600">
                      {activity.level_name} • {activity.path_topic}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Generated with LearnPath AI</p>
          <p className="text-sm">This progress was shared on {new Date(sharedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SharedProgressPage; 