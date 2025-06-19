import React, { useState, useEffect } from 'react';
import { LearningPath, LearningPathCreationRequest, User, normalizeBackendData } from './types';
import LearningPathForm from './components/LearningPathForm';
import LearningPathDisplay from './components/LearningPathDisplay';
import Dashboard from './components/Dashboard';
import UserMetricsPage from './components/UserMetricsPage';
import { generateLearningPath as fetchLearningPathFromAPI } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navbar } from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage'; 
import * as authService from './services/authService';
import { learningPathService } from './services/api';

type View = 'landing' | 'login' | 'dashboard' | 'create' | 'viewing' | 'metrics';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [intendedView, setIntendedView] = useState<View | null>(null);
  const [authPageMode, setAuthPageMode] = useState<'login' | 'register'>('login');
  const [metricsRefreshTrigger, setMetricsRefreshTrigger] = useState<number>(0);

  // Check authentication status on app mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const user = await authService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          setCurrentView('dashboard');
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentView('landing');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('landing');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Load learning paths from backend
      loadLearningPaths();
    } else {
      setLearningPaths([]);
    }
  }, [isAuthenticated, currentUser]); // Removed calculateAndSetUserMetrics from dependencies

  const loadLearningPaths = async () => {
    try {
      console.log('Loading learning paths...');
      const response = await learningPathService.getAllPaths();
      console.log('Loaded paths:', response.data);
      const normalizedPaths = normalizeBackendData.toCamelCase(response.data);
      setLearningPaths(normalizedPaths);
    } catch (error) {
      console.error('Failed to load learning paths:', error);
      setLearningPaths([]);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      const user = await authService.login(email, password || '');
      setIsAuthenticated(true);
      setCurrentUser(user);
      setError(null);
      if (intendedView && intendedView !== 'login' && intendedView !== 'landing') {
        setCurrentView(intendedView);
        setIntendedView(null);
      } else {
        setCurrentView('dashboard');
      }
    } catch (authError) {
      console.error("Login failed:", authError);
      setError(authError instanceof Error ? authError.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      const user = await authService.register(email, password || '');
      setIsAuthenticated(true);
      setCurrentUser(user);
      setError(null);
      if (intendedView && intendedView !== 'login' && intendedView !== 'landing') {
        setCurrentView(intendedView);
        setIntendedView(null);
      } else {
        setCurrentView('dashboard');
      }
    } catch (authError) {
      console.error("Registration failed:", authError);
      setError(authError instanceof Error ? authError.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPath(null);
      setLearningPaths([]);
      setCurrentView('landing');
      setError(null);
      setIntendedView(null);
      setAuthPageMode('login'); // Reset auth page mode on logout
    }
  };

  const navigateTo = (view: View, params?: { mode?: 'login' | 'register' }) => {
    if (params?.mode) {
      setAuthPageMode(params.mode);
    }

    const protectedViews: View[] = ['dashboard', 'create', 'viewing', 'metrics'];
    if (protectedViews.includes(view) && !isAuthenticated) {
      setIntendedView(view);
      setCurrentView('login');
      return;
    }
    
    setCurrentView(view);
    if (view === 'create' || view === 'dashboard' || view === 'landing' || view === 'metrics') {
      setCurrentPath(null);
    }
  };

  const handleCreatePath = async (request: LearningPathCreationRequest) => {
    if (!isAuthenticated) { navigateTo('login'); return; }
    setIsLoading(true);
    setError(null);
    setCurrentPath(null);
    try {
      const newPathData = await fetchLearningPathFromAPI(request.topic);
      const newPathWithDetails: LearningPath = {
        ...newPathData,
        id: `${Date.now()}-${request.topic.replace(/\s+/g, '-')}`,
        topic: request.topic, // Ensure topic from request is used
        createdAt: new Date().toISOString(),
      };
      setCurrentPath(newPathWithDetails);
      setCurrentView('viewing');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to generate learning path. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePath = async (path: LearningPath) => {
    if (!isAuthenticated) return;
    
    console.log('Saving path:', path);
    console.log('Path levels:', path.levels);
    
    // Log detailed module information
    path.levels.forEach((level, levelIndex) => {
      console.log(`Level ${levelIndex} (${level.name}):`);
      level.modules.forEach((module, moduleIndex) => {
        console.log(`  Module ${moduleIndex}:`, {
          title: module.title,
          description: module.description,
          youtubeUrl: module.youtubeUrl,
          githubUrl: module.githubUrl,
          isCompleted: module.isCompleted,
          notes: module.notes
        });
      });
    });
    
    try {
      const requestBody = {
        topic: path.topic,
        levels: path.levels
      };
      
      console.log('Request body being sent:', JSON.stringify(requestBody, null, 2));
      
      const response = await learningPathService.createPath(requestBody);

      console.log('Save response status:', response.status);
      if (response.status === 201 || response.status === 200) {
        // Reload learning paths from backend
        await loadLearningPaths();
        
        // Trigger metrics refresh
        setMetricsRefreshTrigger(prev => prev + 1);
        
        navigateTo('dashboard');
      } else {
        console.error('Save error:', response.data);
        setError(response.data.error || 'Failed to save learning path');
      }
    } catch (error) {
      console.error('Error saving path:', error);
      setError('Failed to save learning path. Please try again.');
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!isAuthenticated) {
      console.warn('[App.tsx] handleDeletePath: User not authenticated.');
      return;
    }

    try {
      const response = await learningPathService.deletePath(pathId);

      if (response.status === 200 || response.status === 204) {
        // Reload learning paths from backend
        await loadLearningPaths();
        
        // Trigger metrics refresh
        setMetricsRefreshTrigger(prev => prev + 1);
        
        if (currentPath?.id === pathId) {
          setCurrentPath(null);
          if (currentView === 'viewing') {
            navigateTo('dashboard');
          }
        }
      } else {
        setError(response.data.error || 'Failed to delete learning path');
      }
    } catch (error) {
      console.error('Error deleting path:', error);
      setError('Failed to delete learning path. Please try again.');
    }
  };

  const handleViewPath = (path: LearningPath) => {
     if (!isAuthenticated) {
      setIntendedView('viewing'); 
      setCurrentPath(path);       
      navigateTo('login', { mode: 'login' }); // Ensure login form is shown if redirected      
      return;
    }
    setCurrentPath(path);
    setCurrentView('viewing');
  };

  const handleToggleModuleCompletion = async (pathId: string, levelName: string, moduleTitle: string) => {
    if (!isAuthenticated) return;
    
    try {
      // Find the module to get its ID
      const path = learningPaths.find(p => p.id === pathId);
      if (!path) return;

      const level = path.levels.find(l => l.name === levelName);
      if (!level) return;

      const module = level.modules.find(m => m.title === moduleTitle);
      if (!module) return;
      if (!module.id) {
        const debugInfo = {
          pathId,
          levelName,
          moduleTitle,
          module,
          level,
          path
        };
        console.error('Module ID not found for:', moduleTitle, debugInfo);
        setError('Module ID not found. Please refresh and try again. If this persists, contact support.');
        return;
      }

      const response = await learningPathService.toggleModuleCompletion(pathId, module.id.toString(), !module.isCompleted);

      if (response.status === 200) {
        // Reload learning paths from backend
        await loadLearningPaths();
        
        // Trigger metrics refresh
        setMetricsRefreshTrigger(prev => prev + 1);
        
        // Update current path if it's the one being viewed
        if (currentPath && currentPath.id === pathId) {
          const updatedPathsResponse = await learningPathService.getAllPaths();
          if (updatedPathsResponse.status === 200) {
            const normalizedPaths = normalizeBackendData.toCamelCase(updatedPathsResponse.data);
            const updatedPath = normalizedPaths.find((p: LearningPath) => p.id === pathId);
            if (updatedPath) setCurrentPath(updatedPath);
          }
        }
      } else {
        setError(response.data.error || 'Failed to update module completion');
      }
    } catch (error) {
      console.error('Error toggling module completion:', error);
      setError('Failed to update module completion. Please try again.');
    }
  };

  const handleUpdateModuleNotes = async (pathId: string, levelName: string, moduleTitle: string, notes: string) => {
    if (!isAuthenticated) return;
    
    try {
      // Find the module to get its ID
      const path = learningPaths.find(p => p.id === pathId);
      if (!path) return;

      const level = path.levels.find(l => l.name === levelName);
      if (!level) return;

      const module = level.modules.find(m => m.title === moduleTitle);
      if (!module) return;
      if (!module.id) {
        const debugInfo = {
          pathId,
          levelName,
          moduleTitle,
          module,
          level,
          path
        };
        console.error('Module ID not found for:', moduleTitle, debugInfo);
        setError('Module ID not found. Please refresh and try again. If this persists, contact support.');
        return;
      }

      const response = await learningPathService.updateModuleNotes(pathId, module.id.toString(), notes);

      if (response.status === 200) {
        // Reload learning paths from backend
        await loadLearningPaths();
        
        // Trigger metrics refresh
        setMetricsRefreshTrigger(prev => prev + 1);
        
        // Update current path if it's the one being viewed
        if (currentPath && currentPath.id === pathId) {
          const updatedPathsResponse = await learningPathService.getAllPaths();
          if (updatedPathsResponse.status === 200) {
            const normalizedPaths = normalizeBackendData.toCamelCase(updatedPathsResponse.data);
            const updatedPath = normalizedPaths.find((p: LearningPath) => p.id === pathId);
            if (updatedPath) setCurrentPath(updatedPath);
          }
        }
      } else {
        setError(response.data.error || 'Failed to update module notes');
      }
    } catch (error) {
      console.error('Error updating module notes:', error);
      setError('Failed to update module notes. Please try again.');
    }
  };

  const renderContent = () => {
    if (isLoading) { 
      return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    if (error && currentView !== 'login' && currentView !== 'viewing' && !error.toLowerCase().includes("pdf generation failed")) { 
      return <div className="p-4 my-4 text-center text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900 dark:text-red-200 dark:border-red-700">{error}</div>;
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={navigateTo} />;
      case 'login':
        return (
          <AuthPage
            mode={authPageMode}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onNavigate={navigateTo}
            error={error}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            learningPaths={learningPaths}
            onViewPath={handleViewPath}
            onDeletePath={handleDeletePath}
            onNavigate={navigateTo}
          />
        );
      case 'create':
        return <LearningPathForm onSubmit={handleCreatePath} />;
      case 'viewing':
        if (currentPath) {
          const isSaved = learningPaths.some(p => p.id === currentPath.id);
          return (
            <LearningPathDisplay
              path={currentPath}
              onSavePath={!isSaved ? handleSavePath : undefined}
              onBack={() => navigateTo(isSaved ? 'dashboard': 'create')}
              onToggleModuleCompletion={(levelName, moduleTitle) => handleToggleModuleCompletion(currentPath.id, levelName, moduleTitle)}
              onUpdateModuleNotes={(levelName, moduleTitle, notes) => handleUpdateModuleNotes(currentPath.id, levelName, moduleTitle, notes)}
            />
          );
        }
        navigateTo('dashboard'); 
        return <div className="text-center p-4">Redirecting to dashboard...</div>;
      case 'metrics':
        return <UserMetricsPage key={metricsRefreshTrigger} />;
      default:
        return <LandingPage onNavigate={navigateTo} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col">
      <Navbar currentView={currentView} navigateTo={navigateTo} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-400 dark:text-gray-500 py-8 text-center">
        <div className="container mx-auto px-4">
            <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-primary-400 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <p className="text-lg font-semibold text-gray-200 dark:text-gray-100">LearnPath AI</p>
            </div>
            <p className="text-sm mb-1">&copy; {new Date().getFullYear()} Personalized Learning Path Generator.</p>
            <p className="text-sm mb-3">Powered by <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-400">Google Gemini</a>.</p>
            <p className="text-xs">
            Disclaimer: Resource links are AI-generated. Module completion and notes are user-managed. 
            Authentication is simulated for demo purposes and all data is stored locally in your browser.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
