import React, { useState, useEffect } from 'react';
import { UserMetrics, LearningPathMetrics } from '../types';
import { userMetricsService } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';

interface ActivityData {
  moduleActivity: Array<{
    module_title: string;
    level_name: string;
    path_topic: string;
    completed_at: string;
    notes?: string;
  }>;
  pathActivity: Array<{
    topic: string;
    created_at: string;
    total_modules: number;
    completed_modules: number;
  }>;
  dailyActivity: Array<{
    activity_date: string;
    modules_completed: number;
  }>;
}

const UserMetricsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [pathMetrics, setPathMetrics] = useState<LearningPathMetrics[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'paths'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPathMetrics | null>(null);
  const [showPathAnalytics, setShowPathAnalytics] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [metricsResponse, pathMetricsResponse, activityResponse] = await Promise.all([
        userMetricsService.getMetrics(),
        userMetricsService.getPathMetrics(),
        userMetricsService.getActivityHistory(20).catch(err => {
          console.warn('Activity data not available:', err);
          return { data: { moduleActivity: [], pathActivity: [], dailyActivity: [] } };
        })
      ]);
      
      setMetrics(metricsResponse.data);
      setPathMetrics(pathMetricsResponse.data);
      setActivityData(activityResponse.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportMetrics = () => {
    if (!metrics) return;
    
    const exportData = {
      // Overall metrics
      overallMetrics: {
        ...metrics,
        exportedAt: new Date().toISOString()
      },
      // Individual path metrics
      pathMetrics: pathMetrics.map(path => ({
        id: path.id,
        topic: path.topic,
        created_at: path.created_at,
        total_levels: path.total_levels,
        total_modules: path.total_modules,
        completed_modules: path.completed_modules,
        completion_rate: path.completion_rate,
        is_completed: path.is_completed,
        levels: path.levels.map(level => ({
          level_name: level.level_name,
          total_modules: level.total_modules,
          completed_modules: level.completed_modules,
          completion_rate: level.completion_rate
        }))
      })),
      // Activity data
      activityData: activityData ? {
        moduleActivity: activityData.moduleActivity,
        pathActivity: activityData.pathActivity,
        dailyActivity: activityData.dailyActivity
      } : null,
      // Export metadata
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        totalPaths: pathMetrics.length,
        completedPaths: pathMetrics.filter(p => p.is_completed).length,
        totalModules: pathMetrics.reduce((sum, p) => sum + p.total_modules, 0),
        completedModules: pathMetrics.reduce((sum, p) => sum + p.completed_modules, 0),
        averageCompletionRate: pathMetrics.length > 0 
          ? Math.round(pathMetrics.reduce((sum, p) => sum + p.completion_rate, 0) / pathMetrics.length)
          : 0
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const exportMetricsCSV = () => {
    if (!metrics || pathMetrics.length === 0) return;
    
    // Create CSV content for path metrics
    const csvHeaders = [
      'Path ID',
      'Topic',
      'Created Date',
      'Total Levels',
      'Total Modules',
      'Completed Modules',
      'Completion Rate (%)',
      'Status'
    ];
    
    const csvRows = pathMetrics.map(path => [
      path.id,
      `"${path.topic}"`,
      new Date(path.created_at).toLocaleDateString(),
      path.total_levels,
      path.total_modules,
      path.completed_modules,
      path.completion_rate,
      path.is_completed ? 'Completed' : 'In Progress'
    ]);
    
    // Add activity data if available
    let activityRows = [];
    if (activityData && activityData.moduleActivity.length > 0) {
      activityRows.push(['']); // Empty row for separation
      activityRows.push(['Recent Module Activity']);
      activityRows.push(['Module Title', 'Level', 'Path Topic', 'Completed Date']);
      
      activityData.moduleActivity.slice(0, 10).forEach(activity => {
        activityRows.push([
          `"${activity.module_title}"`,
          activity.level_name,
          `"${activity.path_topic}"`,
          new Date(activity.completed_at).toLocaleDateString()
        ]);
      });
    }
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(',')),
      ...activityRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const exportPathAnalytics = (path: LearningPathMetrics) => {
    const exportData = {
      pathInfo: {
        id: path.id,
        topic: path.topic,
        created_at: path.created_at,
        total_levels: path.total_levels,
        total_modules: path.total_modules,
        completed_modules: path.completed_modules,
        completion_rate: path.completion_rate,
        is_completed: path.is_completed
      },
      levelBreakdown: path.levels.map(level => ({
        level_name: level.level_name,
        total_modules: level.total_modules,
        completed_modules: level.completed_modules,
        completion_rate: level.completion_rate
      })),
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        pathTopic: path.topic
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-analytics-${path.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareMetrics = () => {
    if (!metrics) return;
    
    const shareText = `🎓 My Learning Progress:
📚 Total Paths: ${metrics.total_paths}
✅ Completed Paths: ${metrics.completed_paths}
📖 Total Modules: ${metrics.total_modules}
🎯 Completed Modules: ${metrics.completed_modules}
📈 Completion Rate: ${metrics.average_completion_rate}%

Generated with LearnPath AI`;

    if (navigator.share) {
      navigator.share({
        title: 'My Learning Progress',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  const shareDetailedProgress = () => {
    if (!metrics || !pathMetrics.length) return;
    
    // Add debugging to see what's in metrics
    console.log('Metrics object:', metrics);
    console.log('Path metrics:', pathMetrics);
    
    // Use snake_case property names that the backend returns
    const totalPaths = metrics.total_paths || 0;
    const completedPaths = metrics.completed_paths || 0;
    const totalModules = metrics.total_modules || 0;
    const completedModules = metrics.completed_modules || 0;
    const averageCompletionRate = metrics.average_completion_rate || 0;
    
    const detailedText = `🎓 My Detailed Learning Progress:

📊 OVERALL PROGRESS:
• Total Learning Paths: ${totalPaths}
• Completed Paths: ${completedPaths}
• Total Modules: ${totalModules}
• Completed Modules: ${completedModules}
• Overall Completion Rate: ${averageCompletionRate}%

📚 INDIVIDUAL PATH PROGRESS:
${pathMetrics.map(path => `• ${path.topic}: ${path.completion_rate}% (${path.completed_modules}/${path.total_modules} modules)`).join('\n')}

${activityData && activityData.moduleActivity.length > 0 ? `
📈 RECENT ACTIVITY:
${activityData.moduleActivity.slice(0, 3).map(activity => `• Completed: ${activity.module_title} (${activity.path_topic})`).join('\n')}` : ''}

Generated with LearnPath AI - ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      navigator.share({
        title: 'My Detailed Learning Progress',
        text: detailedText
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(detailedText).then(() => {
        alert('Detailed progress copied to clipboard!');
      });
    }
  };

  const handlePathClick = (path: LearningPathMetrics) => {
    setSelectedPath(path);
    setShowPathAnalytics(true);
  };

  const closePathAnalytics = () => {
    setShowPathAnalytics(false);
    setSelectedPath(null);
  };

  // Refresh metrics when component mounts
  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 dark:text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={fetchMetrics}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-xl">No metrics available</div>
        </div>
      </div>
    );
  }

  const completionRate = metrics.average_completion_rate || 0;
  const progressPercentage = metrics.total_modules > 0 ? (metrics.completed_modules / metrics.total_modules) * 100 : 0;

  // Debug logging to help identify issues
  console.log('Metrics data:', {
    totalModules: metrics.total_modules,
    completedModules: metrics.completed_modules,
    progressPercentage,
    completionRate
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent Progress!';
    if (percentage >= 60) return 'Good Progress!';
    if (percentage >= 40) return 'Keep Going!';
    return 'Getting Started';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Learning Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track your progress and discover insights about your learning journey
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={shareDetailedProgress}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'paths', label: 'Paths', icon: '📚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Learning Paths</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metrics.total_paths}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed Paths</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metrics.completed_paths}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2M7 7h10" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Modules</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metrics.total_modules}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed Modules</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{metrics.completed_modules}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Overall Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Overall Progress</h3>
                {metrics.total_modules === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No learning paths created yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Create your first learning path to start tracking progress!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Module Completion</span>
                        <span>{isNaN(progressPercentage) ? '0.0' : progressPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progressPercentage)}`}
                          style={{ width: `${Math.min(isNaN(progressPercentage) ? 0 : progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{getProgressText(progressPercentage)}</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Path Completion Rate</span>
                        <span>{isNaN(completionRate) ? '0.0' : completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(completionRate)}`}
                          style={{ width: `${Math.min(isNaN(completionRate) ? 0 : completionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {metrics.recentActivity?.lastCompletedModule && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="p-2 bg-green-100 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last completed module</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{metrics.recentActivity.lastCompletedModule}</p>
                      </div>
                    </div>
                  )}
                  
                  {metrics.recentActivity?.lastCompletedPath && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Last completed path</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{metrics.recentActivity.lastCompletedPath}</p>
                      </div>
                    </div>
                  )}
                  
                  {metrics.recentActivity?.streakDays && (
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Learning streak</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{metrics.recentActivity.streakDays} days</p>
                      </div>
                    </div>
                  )}
                  
                  {!metrics.recentActivity?.lastCompletedModule && 
                   !metrics.recentActivity?.lastCompletedPath && 
                   !metrics.recentActivity?.streakDays && (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 dark:text-gray-400">No recent activity to display</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Start learning to see your activity here!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress by Level */}
            {metrics.progressByLevel && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Difficulty Level</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(metrics.progressByLevel).map(([level, data]) => {
                    const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
                    const levelColors = {
                      beginner: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
                      intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
                      advanced: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' }
                    };
                    const colors = levelColors[level as keyof typeof levelColors] || levelColors.beginner;
                    
                    return (
                      <div key={level} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {data.completed}/{data.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500">{percentage.toFixed(1)}% complete</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Insights and Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
              <div className="space-y-4">
                {progressPercentage < 30 && (
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Getting Started</p>
                      <p className="text-sm text-blue-700 mt-1">
                        You're just beginning your learning journey! Try completing a few modules to build momentum.
                      </p>
                    </div>
                  </div>
                )}
                
                {progressPercentage >= 30 && progressPercentage < 70 && (
                  <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Great Progress!</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        You're making steady progress. Consider tackling more challenging modules to accelerate your learning.
                      </p>
                    </div>
                  </div>
                )}
                
                {progressPercentage >= 70 && (
                  <div className="flex items-start p-4 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-900">Excellent Work!</p>
                      <p className="text-sm text-green-700 mt-1">
                        You're doing fantastic! Consider exploring advanced topics or helping others with their learning.
                      </p>
                    </div>
                  </div>
                )}
                
                {metrics.total_paths > 0 && metrics.completed_paths === 0 && (
                  <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Complete Your First Path</p>
                      <p className="text-sm text-purple-700 mt-1">
                        You have {metrics.total_paths} learning path{metrics.total_paths !== 1 ? 's' : ''} started. 
                        Try completing one to see your progress!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && activityData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">📈 Recent Activity History</h3>
            
            {/* Recent Module Completions */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Recently Completed Modules</h4>
              {activityData.moduleActivity.length > 0 ? (
                <div className="space-y-3">
                  {activityData.moduleActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="p-2 bg-green-100 rounded-full mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.module_title}</p>
                        <p className="text-sm text-gray-600">
                          {activity.level_name} • {activity.path_topic}
                        </p>
                        <p className="text-xs text-gray-500">
                          Completed {new Date(activity.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No modules completed yet. Start learning to see your activity here!</p>
                </div>
              )}
            </div>

            {/* Learning Paths Progress */}
            <div className="mb-8">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Learning Paths Progress</h4>
              {activityData.pathActivity.length > 0 ? (
                <div className="space-y-3">
                  {activityData.pathActivity.slice(0, 5).map((path, index) => {
                    const progressPercentage = path.total_modules > 0 ? (path.completed_modules / path.total_modules) * 100 : 0;
                    return (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900">{path.topic}</h5>
                          <span className="text-sm text-gray-600">
                            {path.completed_modules}/{path.total_modules} modules
                          </span>
                        </div>
                       <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(path.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No learning paths created yet.</p>
                </div>
              )}
            </div>

            {/* Daily Activity Chart */}
            {activityData.dailyActivity.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-4">Daily Activity (Last 30 Days)</h4>
                <div className="grid grid-cols-7 gap-2">
                  {activityData.dailyActivity.slice(0, 7).map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        {new Date(day.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div 
                        className={`h-8 rounded-sm ${
                          day.modules_completed > 0 
                            ? day.modules_completed >= 3 
                              ? 'bg-green-500' 
                              : day.modules_completed >= 2 
                                ? 'bg-yellow-500' 
                                : 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}
                        title={`${day.modules_completed} modules completed`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">{day.modules_completed}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Green: 3+ modules, Yellow: 2 modules, Blue: 1 module, Gray: No activity
                </p>
              </div>
            )}
          </div>
        )}

        {/* Paths Tab Content */}
        {activeTab === 'paths' && (
          <div className="space-y-6">
            {pathMetrics.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No learning paths created yet</p>
                  <p className="text-sm text-gray-400">Create your first learning path to see detailed metrics!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pathMetrics.map((path) => (
                  <div 
                    key={path.id} 
                    className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 h-48 flex flex-col justify-between"
                    onClick={() => handlePathClick(path)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{path.topic}</h3>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            path.is_completed 
                              ? 'bg-green-100 text-green-800' 
                              : path.completion_rate >= 50 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {path.is_completed ? 'Completed' : `${path.completion_rate}%`}
                          </div>
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{path.total_modules}</div>
                          <div className="text-xs text-gray-600">Total Modules</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{path.completed_modules}</div>
                          <div className="text-xs text-gray-600">Completed</div>
                        </div>
                      </div>
                    </div>

                    {/* Click indicator */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center text-blue-600 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Analytics
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Export & Share</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Export comprehensive learning data including:
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Overall metrics and progress
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Individual path analytics
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recent activity history
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Level-by-level breakdown
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={exportMetrics}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download JSON (Complete Data)
              </button>
              <button
                onClick={exportMetricsCSV}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV (Spreadsheet)
              </button>
              <button
                onClick={shareMetrics}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Progress Summary
              </button>
              <button
                onClick={shareDetailedProgress}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Detailed Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Path Analytics Modal */}
      {showPathAnalytics && selectedPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedPath.topic}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Created {new Date(selectedPath.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => exportPathAnalytics(selectedPath)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={closePathAnalytics}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedPath.total_levels}</div>
                  <div className="text-sm text-blue-600">Total Levels</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedPath.completed_modules}</div>
                  <div className="text-sm text-green-600">Completed Modules</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedPath.total_modules - selectedPath.completed_modules}</div>
                  <div className="text-sm text-purple-600">Remaining Modules</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedPath.completion_rate}%</div>
                  <div className="text-sm text-orange-600">Completion Rate</div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Overall Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span>Module Completion</span>
                      <span>{selectedPath.completed_modules}/{selectedPath.total_modules} modules</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          selectedPath.is_completed 
                            ? 'bg-green-500' 
                            : selectedPath.completion_rate >= 50 
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(selectedPath.completion_rate, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {selectedPath.is_completed 
                        ? '🎉 Congratulations! You have completed this learning path!' 
                        : `You're ${selectedPath.completion_rate}% of the way through this path.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Level Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Progress by Level</h3>
                <div className="space-y-6">
                  {selectedPath.levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">{level.level_name}</h4>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          level.completion_rate === 100 
                            ? 'bg-green-100 text-green-800' 
                            : level.completion_rate >= 50 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {level.completion_rate}% Complete
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>Modules Progress</span>
                          <span>{level.completed_modules}/{level.total_modules} modules</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              level.completion_rate === 100 
                                ? 'bg-green-500' 
                                : level.completion_rate >= 50 
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(level.completion_rate, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{level.completed_modules}</div>
                            <div className="text-gray-600 dark:text-gray-300">Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{level.total_modules - level.completed_modules}</div>
                            <div className="text-gray-600 dark:text-gray-300">Remaining</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights and Recommendations */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Insights & Recommendations</h3>
                <div className="space-y-4">
                  {selectedPath.completion_rate === 0 && (
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Getting Started</p>
                        <p className="text-sm text-blue-700 mt-1">
                          You haven't started this learning path yet. Begin with the first module to build momentum!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedPath.completion_rate > 0 && selectedPath.completion_rate < 30 && (
                    <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Early Progress</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Great start! You've completed {selectedPath.completed_modules} modules. Keep going to build momentum!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedPath.completion_rate >= 30 && selectedPath.completion_rate < 70 && (
                    <div className="flex items-start p-4 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-900">Steady Progress</p>
                        <p className="text-sm text-green-700 mt-1">
                          Excellent work! You're {selectedPath.completion_rate}% through this path. You're on track to complete it soon!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedPath.completion_rate >= 70 && !selectedPath.is_completed && (
                    <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Almost There!</p>
                        <p className="text-sm text-purple-700 mt-1">
                          You're so close! Only {selectedPath.total_modules - selectedPath.completed_modules} more modules to complete this path.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedPath.is_completed && (
                    <div className="flex items-start p-4 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-900">Path Completed!</p>
                        <p className="text-sm text-green-700 mt-1">
                          🎉 Congratulations! You have successfully completed this learning path. Consider exploring more advanced topics or helping others!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMetricsPage; 