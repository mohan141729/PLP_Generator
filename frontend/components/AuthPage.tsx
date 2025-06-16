import React, { useState, FormEvent, useEffect } from 'react';

type View = 'landing' | 'login' | 'dashboard' | 'create' | 'viewing' | 'metrics';

interface AuthPageProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (email: string, password?: string) => Promise<void>;
  onNavigate: (view: View, params?: { mode?: 'login' | 'register' }) => void;
  error: string | null;
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, onNavigate, error: externalError, mode }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(mode === 'register');
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    setIsRegisterMode(mode === 'register');
  }, [mode]);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setInternalError(null);
  };

  const handleModeToggle = () => {
    onNavigate('login', { mode: isRegisterMode ? 'login' : 'register' });
    clearForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInternalError(null);

    if (!email.trim()) {
      setInternalError('Please enter an email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInternalError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setInternalError('Password is required.');
      return;
    }

    if (isRegisterMode) {
      if (password.length < 6) {
        setInternalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setInternalError('Passwords do not match.');
        return;
      }
      try {
        await onRegister(email, password);
      } catch (err) {
        setInternalError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    } else {
      try {
        await onLogin(email, password);
      } catch (err) {
        setInternalError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      }
    }
  };

  const error = externalError || internalError;

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 shadow-xl rounded-xl">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-700 dark:text-primary-400">
              {isRegisterMode ? 'Create Your Account' : 'Access Your Learning Paths'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={handleModeToggle}
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
              >
                {isRegisterMode ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="p-3 my-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-200 dark:border-red-700" role="alert">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-3">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address (e.g., user@example.com)"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setInternalError(null); }}
                  aria-describedby={error ? "email-error" : undefined}
                  aria-invalid={!!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('user not found'))}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={isRegisterMode ? "Password (min. 6 characters)" : "Password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setInternalError(null); }}
                  aria-describedby={error ? "password-error" : undefined}
                  aria-invalid={!!error && error.toLowerCase().includes('password')}
                />
              </div>
              {isRegisterMode && (
                <div>
                  <label htmlFor="confirm-password" className="sr-only">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setInternalError(null); }}
                    aria-describedby={error ? "confirm-password-error" : undefined}
                    aria-invalid={!!error && error.toLowerCase().includes('match')}
                  />
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out"
              >
                {isRegisterMode ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            This is a simulated authentication system for demo purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
