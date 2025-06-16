
import React, { useState, useEffect } from 'react';
import { Module } from '../types';
import { ResourceLink } from './ResourceLink';

interface ModuleCardProps {
  module: Module;
  moduleNumber: number;
  onToggleComplete: () => void;
  onUpdateNotes: (newNotes: string) => void;
}

const NotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, moduleNumber, onToggleComplete, onUpdateNotes }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [editText, setEditText] = useState(module.notes || '');

  useEffect(() => {
    setEditText(module.notes || '');
  }, [module.notes]);

  const handleResourceAccess = () => {
    if (!module.isCompleted) {
      onToggleComplete(); 
    }
  };

  const handleManualToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); 
    onToggleComplete(); 
  };

  const handleSaveNotes = () => {
    onUpdateNotes(editText);
    setShowNotes(false);
  };

  const handleCancelNotes = () => {
    setEditText(module.notes || '');
    setShowNotes(false);
  };
  
  const cardBgClass = module.isCompleted 
    ? 'bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 border-l-4 border-green-500' 
    : 'bg-white dark:bg-gray-800 hover:shadow-xl dark:hover:bg-gray-700';
  
  return (
    <div className={`shadow-lg rounded-xl p-5 transition-all duration-300 flex flex-col h-full ${cardBgClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-primary-600 dark:text-primary-400">Module {moduleNumber}</h4>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={module.isCompleted}
            onChange={handleManualToggle}
            className="form-checkbox h-5 w-5 text-green-600 dark:text-green-500 rounded border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-600 dark:bg-gray-700 dark:checked:bg-green-500"
            aria-label={`Mark module ${module.title} as ${module.isCompleted ? 'incomplete' : 'complete'}`}
          />
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{module.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {module.description}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Resource Links */}
        <div className="space-y-2">
          {module.youtubeUrl && (
            <div onClick={handleResourceAccess} className="cursor-pointer" role="button" tabIndex={0} 
                 onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleResourceAccess(); }}>
              <ResourceLink type="youtube" url={module.youtubeUrl} />
            </div>
          )}
          {module.githubUrl && (
             <div onClick={handleResourceAccess} className="cursor-pointer" role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleResourceAccess(); }}>
              <ResourceLink type="github" url={module.githubUrl} />
            </div>
          )}
           {(!module.youtubeUrl && !module.githubUrl) && (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No external resources linked for this module.</p>
          )}
        </div>
        
        {/* Notes Section */}
        <div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center w-full text-left text-xs font-medium py-2 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showNotes ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-600 dark:text-secondary-400'}`}
            aria-expanded={showNotes}
            aria-controls={`notes-section-${module.title.replace(/\s+/g, '-')}-${moduleNumber}`}
          >
            <NotesIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="flex-grow">{showNotes ? 'Hide Notes' : (module.notes && module.notes.trim() !== '' ? 'Edit Notes' : 'Add Notes')}</span>
            {module.notes && module.notes.trim() !== '' && !showNotes && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 truncate italic overflow-hidden whitespace-nowrap" style={{maxWidth: 'calc(100% - 100px)'}}>
                "{module.notes.substring(0, 20)}{module.notes.length > 20 ? '...' : ''}"
              </span>
            )}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ml-auto flex-shrink-0 transform transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {showNotes && (
            <div id={`notes-section-${module.title.replace(/\s+/g, '-')}-${moduleNumber}`} className="mt-2 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Your personal notes for this module..."
                className="w-full h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                aria-label="Module notes"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelNotes}
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
