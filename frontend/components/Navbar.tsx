
import React from 'react';

interface NavbarProps {
  currentView: string;
  navigateTo: (view: 'landing' | 'login' | 'dashboard' | 'create' | 'metrics', params?: { mode?: 'login' | 'register' }) => void; 
  isAuthenticated: boolean;
  onLogout: () => void;
}

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);


export const Navbar: React.FC<NavbarProps> = ({ navigateTo, isAuthenticated, onLogout, currentView }) => {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const navButtonBaseClass = "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#064df1] dark:focus:ring-offset-[#064df1]";

  const navLinkClass = (viewName: string) => 
    `${navButtonBaseClass} ${
      currentView === viewName 
        ? 'bg-white/20 dark:bg-white/20 text-white font-semibold dark:text-white' 
        : 'text-primary-200 dark:text-primary-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white dark:hover:text-white'
    }`;


  return (
    <nav className="bg-gradient-to-br from-primary-600/70 to-[#064df1]/70 dark:from-primary-700/80 dark:to-[#064df1]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-[#064df1]/40 dark:border-[#064df1]/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')} className={`flex items-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[#064df1] dark:focus:ring-offset-[#064df1] rounded-lg p-1 -ml-1`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-100 dark:text-primary-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="ml-2 font-semibold text-xl text-white tracking-tight">
                  LearnPath AI
                </span>
            </button>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className={navLinkClass('dashboard')}
                  aria-current={currentView === 'dashboard' ? 'page' : undefined}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo('create')}
                  className={navLinkClass('create')}
                  aria-current={currentView === 'create' ? 'page' : undefined}
                >
                  Create New
                </button>
                 <button
                  onClick={() => navigateTo('metrics')}
                  className={`${navLinkClass('metrics')} flex items-center`}
                  aria-current={currentView === 'metrics' ? 'page' : undefined}
                >
                  <ChartBarIcon className="w-4 h-4 mr-1.5" />
                  Metrics
                </button>
                <button
                  onClick={onLogout}
                  className={`${navButtonBaseClass} text-white bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700 focus:ring-secondary-500`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('login', { mode: 'login' })}
                  className={`${navButtonBaseClass} text-primary-200 dark:text-primary-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white dark:hover:text-white`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigateTo('login', { mode: 'register' })}
                  className={`${navButtonBaseClass} text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:ring-primary-500`}
                >
                  Sign Up
                </button>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className={`${navButtonBaseClass} text-primary-200 dark:text-primary-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white dark:hover:text-white`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
