import React, { useState } from 'react';

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

export const Navbar: React.FC<NavbarProps> = ({ navigateTo, isAuthenticated, onLogout, currentView }) => {
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const navButtonBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

  const navLinkClass = (viewName: string) => 
    `${navButtonBaseClass} ${
      currentView === viewName 
        ? 'bg-white/20 text-white font-semibold' 
        : 'text-white/90 hover:text-white hover:bg-white/10'
    }`;

  const renderNavItems = () => (
    <>
      <button
        onClick={() => {
          navigateTo('landing');
          setIsMobileMenuOpen(false);
        }}
        className={`${navLinkClass('landing')} w-full sm:w-auto text-left`}
        aria-current={currentView === 'landing' ? 'page' : undefined}
      >
        Home
      </button>
      {isAuthenticated ? (
        <>
          <button
            onClick={() => {
              navigateTo('dashboard');
              setIsMobileMenuOpen(false);
            }}
            className={`${navLinkClass('dashboard')} w-full sm:w-auto text-left`}
            aria-current={currentView === 'dashboard' ? 'page' : undefined}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              navigateTo('create');
              setIsMobileMenuOpen(false);
            }}
            className={`${navLinkClass('create')} w-full sm:w-auto text-left`}
            aria-current={currentView === 'create' ? 'page' : undefined}
          >
            Create New
          </button>
          <button
            onClick={() => {
              navigateTo('metrics');
              setIsMobileMenuOpen(false);
            }}
            className={`${navLinkClass('metrics')} w-full sm:w-auto text-left`}
            aria-current={currentView === 'metrics' ? 'page' : undefined}
          >
            Metrics
          </button>
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className={`${navButtonBaseClass} text-white bg-secondary-500 hover:bg-secondary-600 dark:bg-secondary-600 dark:hover:bg-secondary-700 focus:ring-secondary-500 w-full sm:w-auto text-left`}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              navigateTo('login', { mode: 'login' });
              setIsMobileMenuOpen(false);
            }}
            className={`${navButtonBaseClass} text-primary-200 dark:text-primary-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white dark:hover:text-white w-full sm:w-auto text-left`}
          >
            Login
          </button>
          <button
            onClick={() => {
              navigateTo('login', { mode: 'register' });
              setIsMobileMenuOpen(false);
            }}
            className={`${navButtonBaseClass} text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:ring-primary-500 w-full sm:w-auto text-left`}
          >
            Sign Up
          </button>
        </>
      )}
      <button
        onClick={toggleDarkMode}
        className={`${navButtonBaseClass} text-primary-200 dark:text-primary-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-white dark:hover:text-white w-full sm:w-auto text-left`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
      </button>
    </>
  );

  return (
    <nav className="bg-gradient-to-br from-indigo-600/80 to-blue-700/80 dark:from-indigo-700/80 dark:to-blue-800/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={() => {
                navigateTo('landing');
                setIsMobileMenuOpen(false);
              }} 
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg p-1 -ml-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <span className="ml-2 font-semibold text-xl text-white tracking-tight">
                PLP Generator
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2">
            {renderNavItems()}
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 rounded-lg border border-white/10">
            {renderNavItems()}
          </div>
        </div>
      </div>
    </nav>
  );
};
