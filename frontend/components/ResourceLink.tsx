import React from 'react';

interface ResourceLinkProps {
  type: 'youtube' | 'github';
  url: string;
  title?: string; // Optional custom title
}

const YouTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.01,4.78A5.22,5.22,0,0,0,6.79,10a5.22,5.22,0,0,0,5.22,5.22A5.22,5.22,0,0,0,17.23,10,5.22,5.22,0,0,0,12.01,4.78Zm3.6,5.51-4.7,2.35a.29.29,0,0,1-.43-.26V7.62a.29.29,0,0,1,.43-.26l4.7,2.35a.29.29,0,0,1,0,.52Z" />
    <path d="M21.58,6.18A2.78,2.78,0,0,0,19.6,4.2a67.58,67.58,0,0,0-7.6-.4A67.58,67.58,0,0,0,4.4,4.2A2.78,2.78,0,0,0,2.42,6.18a29,29,0,0,0-.42,3.82,29,29,0,0,0,.42,3.82A2.78,2.78,0,0,0,4.4,15.8a67.58,67.58,0,0,0,7.6.4,67.58,67.58,0,0,0,7.6-.4,2.78,2.78,0,0,0,1.98-1.98,29,29,0,0,0,.42-3.82A29,29,0,0,0,21.58,6.18Z" />
  </svg>
);

const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12,2A10,10,0,0,0,2,12c0,4.42,2.87,8.17,6.84,9.5.5.08.66-.21.66-.47s0-.82,0-1.61C6.73,20.45,6.14,18,6.14,18S5.66,16.8,5,16.55c-.53-.22-.09-.5,0-.5S6,16.14,6.38,16.58c.45.78,1.21,1.11,1.87.84.07-.54.28-.91.53-1.12-1.78-.2-3.64-.89-3.64-3.95,0-.88.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12,0,0,.67-.21,2.2.82A7.68,7.68,0,0,1,12,8.07a7.68,7.68,0,0,1,2.12.28c1.53-1,2.2-.82,2.2-.82.43,1.1.16,1.92.08,2.12.51.56.82,1.27.82,2.15,0,3.07-1.87,3.75-3.65,3.95.29.25.54.73.54,1.48,0,1.07,0,1.93,0,2.19s.16.55.67.47C19.14,20.16,22,16.42,22,12A10,10,0,0,0,12,2Z" />
  </svg>
);


export const ResourceLink: React.FC<ResourceLinkProps> = ({ type, url, title }) => {
  const Icon = type === 'youtube' ? YouTubeIcon : GitHubIcon;
  let defaultText = '';

  if (type === 'youtube') {
    defaultText = 'Search on YouTube';
  } else { // GitHub
    defaultText = 'View on GitHub';
  }
  
  const linkColor = type === 'youtube' ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100';
  const iconColor = type === 'youtube' ? 'text-red-500' : 'text-gray-600 dark:text-gray-400';

  // The 'displayUrl' logic previously here for creating a shortened version of the URL string
  // is not directly rendered in the link text itself. The link text uses `title || defaultText`.
  // So, no changes are needed for how the URL visually appears beyond the defaultText update.

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center space-x-2 text-sm font-medium ${linkColor} group transition-colors duration-150`}
      title={`Open ${url} in a new tab`}
    >
      <Icon className={`w-5 h-5 ${iconColor} group-hover:opacity-80`} />
      <span className="truncate group-hover:underline">{title || defaultText}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 opacity-60 group-hover:opacity-100 ml-auto">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  );
};