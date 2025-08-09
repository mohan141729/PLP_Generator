
import React, { useState } from 'react';
import { LearningPathCreationRequest } from '../types';

interface LearningPathFormProps {
  onSubmit: (request: LearningPathCreationRequest) => void;
}

const LearningPathForm: React.FC<LearningPathFormProps> = ({ onSubmit }) => {
  const [topic, setTopic] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (topic.trim() === '') {
      // Basic validation, can be enhanced
      alert('Please enter a topic for your learning path.');
      return;
    }
    onSubmit({ topic });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-700 dark:text-primary-400 mb-6 sm:mb-8">
          Create Your Learning Path
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              What do you want to learn?
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Native Development, Quantum Computing Basics"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Be specific for better results. For example, instead of "Programming", try "Python for Data Analysis".
            </p>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12h-3.375a4.5 4.5 0 0 0-4.5 4.5v3.375c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-3.375a4.5 4.5 0 0 0-4.5-4.5h-3.375m0-3.375h3.375c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-3.375a4.5 4.5 0 0 1-4.5-4.5v-3.375c0-.621.504-1.125 1.125-1.125h3.375A4.5 4.5 0 0 1 18.25 12Z" />
              </svg>
              Generate Path with AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LearningPathForm;
