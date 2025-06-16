import React, { useState, useEffect, useCallback } from 'react';
import { LearningPath, LearningPathCreationRequest, User, Module, UserMetrics, Project, Level } from './types';
import LearningPathForm from './components/LearningPathForm';
import LearningPathDisplay from './components/LearningPathDisplay';
import Dashboard from './components/Dashboard';
import { generateLearningPath as fetchLearningPathFromAPI } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Navbar } from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage'; 
import * as authService from './services/authService';
import UserMetricsPage from './components/UserMetricsPage';

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
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [authPageMode, setAuthPageMode] = useState<'login' | 'register'>('login');


  const calculateAndSetUserMetrics = useCallback((paths: LearningPath[]) => {
    if (!isAuthenticated || !currentUser) {
      setUserMetrics(null);
      return;
    }
    let totalModules = 0;
    let completedModules = 0;
    let completedPaths = 0;

    paths.forEach(path => {
      let pathModules = 0;
      let pathCompletedModules = 0;
      path.levels.forEach(level => {
        level.modules.forEach(module => {
          totalModules++;
          pathModules++;
          if (module.isCompleted) {
            completedModules++;
            pathCompletedModules++;
          }
        });
      });
      if (pathModules > 0 && pathModules === pathCompletedModules) {
        completedPaths++;
      }
    });

    const averageCompletionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    setUserMetrics({
      totalPaths: paths.length,
      completedPaths,
      totalModules,
      completedModules,
      averageCompletionRate,
    });
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setIsLoading(true);
          const user = await authService.getCurrentUser();
          setIsAuthenticated(true);
          setCurrentUser(user);
          setCurrentView('dashboard');
        } catch (error) {
          console.error("Auth check failed:", error);
          authService.logout();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentView('landing');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('landing');
      }
    };
    checkAuth();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      try {
        const storedPaths = localStorage.getItem(`learningPathsApp_savedPaths_${currentUser.id}`);
        const loadedPaths: any[] = storedPaths ? JSON.parse(storedPaths) : [];
        
        const validatedPaths: LearningPath[] = loadedPaths.map((path, index) => {
          const newId = (path.id && typeof path.id === 'string') ? path.id : `recovered-${Date.now()}-${index}`;
          const newTopic = (path.topic && typeof path.topic === 'string') ? path.topic : `Untitled Path ${index + 1}`;
          const newCreatedAt = (path.createdAt && typeof path.createdAt === 'string') ? path.createdAt : new Date().toISOString();

          return {
            id: newId,
            topic: newTopic,
            createdAt: newCreatedAt,
            levels: (path.levels || []).map((level: any): Level => ({
              name: (level.name && typeof level.name === 'string') ? level.name : "Unnamed Level",
              modules: (level.modules || []).map((module: any): Module => ({
                title: (module.title && typeof module.title === 'string') ? module.title : "Untitled Module",
                description: (module.description && typeof module.description === 'string') ? module.description : "No description provided.",
                youtubeUrl: (module.youtubeUrl && typeof module.youtubeUrl === 'string') ? module.youtubeUrl : undefined,
                githubUrl: (module.githubUrl && typeof module.githubUrl === 'string') ? module.githubUrl : undefined,
                isCompleted: !!module.isCompleted,
                notes: (module.notes && typeof module.notes === 'string') ? module.notes : '',
              })),
              projects: (level.projects || []).map((project: any): Project => ({
                title: (project.title && typeof project.title === 'string') ? project.title : "Untitled Project",
                description: (project.description && typeof project.description === 'string') ? project.description : "No description provided.",
                githubUrl: (project.githubUrl && typeof project.githubUrl === 'string' && project.githubUrl.trim() !== "") ? project.githubUrl : "#",
              })),
            })),
          };
        });

        setLearningPaths(validatedPaths);
        calculateAndSetUserMetrics(validatedPaths);
      } catch (e) {
        console.error("Failed to load or validate paths from localStorage:", e);
        setError("Could not load saved paths. Data might be corrupted, or local storage is inaccessible.");
        // Optionally clear corrupted storage: localStorage.removeItem(`learningPathsApp_savedPaths_${currentUser.id}`);
      }
    } else {
      setLearningPaths([]);
      calculateAndSetUserMetrics([]);
    }
  }, [isAuthenticated, currentUser, calculateAndSetUserMetrics]);

  const savePathsToLocalStorage = useCallback((pathsToSave: LearningPath[]) => {
    if (isAuthenticated && currentUser) {
      try {
        localStorage.setItem(`learningPathsApp_savedPaths_${currentUser.id}`, JSON.stringify(pathsToSave));
        calculateAndSetUserMetrics(pathsToSave);
      } catch (e) {
        console.error("Failed to save paths to localStorage:", e);
        setError("Could not save path. Your browser's local storage might be disabled or full.");
      }
    }
  }, [isAuthenticated, currentUser, calculateAndSetUserMetrics]);

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


  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPath(null);
    setLearningPaths([]);
    setUserMetrics(null);
    setCurrentView('landing');
    setError(null);
    setIntendedView(null);
    setAuthPageMode('login'); // Reset auth page mode on logout
  };

  const navigateTo = (view: View, params?: { mode?: 'login' | 'register' }) => {
    setError(null);

    if (view === 'login') {
      setAuthPageMode(params?.mode || 'login');
    }

    const protectedViews: View[] = ['dashboard', 'create', 'viewing', 'metrics'];
    if (protectedViews.includes(view) && !isAuthenticated) {
      setIntendedView(view);
      setCurrentView('login');
      // If navigating to login due to protected route, ensure login form is shown
      if (view !== 'login') setAuthPageMode('login'); 
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

  const handleSavePath = (path: LearningPath) => {
    if (!isAuthenticated) return;
    if (!learningPaths.find(p => p.id === path.id)) {
      const updatedPaths = [...learningPaths, path];
      setLearningPaths(updatedPaths);
      savePathsToLocalStorage(updatedPaths);
      navigateTo('dashboard');
    } else {
      navigateTo('dashboard');
    }
  };

  const handleDeletePath = (pathId: string) => {
    if (!isAuthenticated) {
      console.warn('[App.tsx] handleDeletePath: User not authenticated.');
      return;
    }

    console.log('[App.tsx] handleDeletePath: Called with pathId:', pathId);
    // Using try-catch for JSON.stringify in case learningPaths contains complex objects not serializable (though unlikely for this structure)
    try {
      console.log('[App.tsx] handleDeletePath: Current learningPaths (before delete):', JSON.parse(JSON.stringify(learningPaths)));
    } catch (e) {
      console.warn('[App.tsx] handleDeletePath: Could not stringify learningPaths for logging.', e);
      console.log('[App.tsx] handleDeletePath: Current learningPaths (raw):', learningPaths);
    }


    if (typeof pathId !== 'string' || !pathId) {
        console.error("[App.tsx] handleDeletePath: Invalid pathId type or empty. pathId:", pathId, "Type:", typeof pathId);
        setError("Could not delete path due to an internal error (invalid ID).");
        return;
    }
    
    const pathExists = learningPaths.some(p => p.id === pathId);
    if (!pathExists) {
        console.warn(`[App.tsx] handleDeletePath: Path ID "${pathId}" not found in current learningPaths. No action taken.`);
        return;
    }

    const updatedPaths = learningPaths.filter(p => p.id !== pathId);
    
    try {
      console.log('[App.tsx] handleDeletePath: Updated learningPaths (after filter):', JSON.parse(JSON.stringify(updatedPaths)));
    } catch (e) {
       console.warn('[App.tsx] handleDeletePath: Could not stringify updatedPaths for logging.', e);
       console.log('[App.tsx] handleDeletePath: Updated learningPaths (raw):', updatedPaths);
    }

    if (updatedPaths.length === learningPaths.length) {
        console.warn(`[App.tsx] handleDeletePath: Filter did not remove any paths. Path ID "${pathId}" might not have matched, or an unexpected issue occurred. Original length: ${learningPaths.length}, New length: ${updatedPaths.length}`);
    }
    
    setLearningPaths(updatedPaths);
    savePathsToLocalStorage(updatedPaths); 

    if (currentPath?.id === pathId) {
      console.log(`[App.tsx] handleDeletePath: Current viewed path (ID: ${currentPath.id}) was deleted. Clearing currentPath.`);
      setCurrentPath(null);
      if (currentView === 'viewing') {
        console.log('[App.tsx] handleDeletePath: Navigating to dashboard after deleting currently viewed path.');
        navigateTo('dashboard'); 
      }
    }
    console.log(`[App.tsx] handleDeletePath: Process completed for pathId: "${pathId}".`);
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

  const handleToggleModuleCompletion = (pathId: string, levelName: string, moduleTitle: string) => {
    if (!isAuthenticated) return;
    const updatedPaths = learningPaths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          levels: p.levels.map(l => {
            if (l.name === levelName) {
              return {
                ...l,
                modules: l.modules.map(m => {
                  if (m.title === moduleTitle) {
                    return { ...m, isCompleted: !m.isCompleted };
                  }
                  return m;
                }),
              };
            }
            return l;
          }),
        };
      }
      return p;
    });
    setLearningPaths(updatedPaths);
    savePathsToLocalStorage(updatedPaths);

    if (currentPath && currentPath.id === pathId) {
        const updatedCurrentPath = updatedPaths.find(p => p.id === pathId);
        if (updatedCurrentPath) setCurrentPath(updatedCurrentPath);
    }
  };

  const handleUpdateModuleNotes = (pathId: string, levelName: string, moduleTitle: string, notes: string) => {
    if (!isAuthenticated) return;
    const updatedPaths = learningPaths.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          levels: p.levels.map(l => {
            if (l.name === levelName) {
              return {
                ...l,
                modules: l.modules.map(m => {
                  if (m.title === moduleTitle) {
                    return { ...m, notes: notes };
                  }
                  return m;
                }),
              };
            }
            return l;
          }),
        };
      }
      return p;
    });
    setLearningPaths(updatedPaths);
    savePathsToLocalStorage(updatedPaths);

    if (currentPath && currentPath.id === pathId) {
        const updatedCurrentPath = updatedPaths.find(p => p.id === pathId);
        if (updatedCurrentPath) setCurrentPath(updatedCurrentPath);
    }
  };


  const renderContent = () => {
    if (isLoading && currentView !== 'metrics') { 
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
            userMetrics={userMetrics}
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
        return <UserMetricsPage metrics={userMetrics} isLoading={isLoading && !userMetrics} />; 
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
