import React from 'react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

// Icons (using Heroicons v2 for consistency)
const FeatureIcon: React.FC<{ icon: JSX.Element; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-transform duration-300 hover:shadow-primary-500/20 dark:hover:shadow-primary-400/20 hover:-translate-y-1">
    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full text-primary-600 dark:text-primary-300 mb-5 mx-auto">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{ step: string, title: string, description: string, icon: JSX.Element}> = ({ step, title, description, icon }) => (
 <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg transform hover:shadow-secondary-500/20 dark:hover:shadow-secondary-400/20 hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-secondary-500 dark:bg-secondary-600 rounded-full text-white flex items-center justify-center text-lg sm:text-xl font-bold mr-4">
        {step}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
    </div>
    <div className="ml-0 sm:ml-16 mb-4 text-secondary-600 dark:text-secondary-400">
        {React.cloneElement(icon, { className: "w-8 h-8 sm:w-10 sm:h-10"})}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed ml-0 sm:ml-16">{description}</p>
  </div>
);


const TestimonialCard: React.FC<{ quote: string; author: string; role: string; avatar?: JSX.Element }> = ({ quote, author, role, avatar }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
    {avatar ? <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-primary-500 mb-4">{avatar}</div> : 
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-semibold mb-4">
                {author.substring(0,1)}
             </div>
    }
    <p className="text-gray-600 dark:text-gray-300 italic mb-4">"{quote}"</p>
    <p className="font-semibold text-primary-700 dark:text-primary-400">{author}</p>
    <p className="text-sm text-gray-500 dark:text-gray-500">{role}</p>
  </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="dark:text-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-br from-sky-500 to-indigo-600 dark:from-sky-600 dark:to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Unlock Your Learning Potential with AI
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-sky-100 dark:text-sky-200 max-w-3xl mx-auto mb-10">
            Generate personalized, multi-level learning paths for any topic in minutes. Structured, resourceful, and tailored for you.
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 dark:text-indigo-500 font-semibold text-lg rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 dark:focus:ring-sky-500"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline-block mr-2 align-text-bottom">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.812a6 6 0 0 1 2.57-5.84Z" />
            </svg>
            Get Started Now
          </button>
        </div>
      </section>

      {/* Why Choose LearnPath AI? Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-850">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Why Choose LearnPath AI?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureIcon
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>}
              title="AI-Powered Paths"
              description="Tailored learning journeys designed by Gemini to match your specific goals."
            />
            <FeatureIcon
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h14.25m-14.25 4.5h14.25m0 0L21 12m-2.25 1.5V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v7.5" /></svg>}
              title="Structured Learning"
              description="Beginner, Intermediate, and Advanced levels ensure a gradual, effective curve."
            />
            <FeatureIcon
             icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>}
              title="Rich Resources"
              description="Modules packed with YouTube search links and GitHub repositories for hands-on experience."
            />
            <FeatureIcon
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
              title="Track Your Progress"
              description="Save paths, mark modules complete, add notes, and visualize your achievements."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Simple Steps to Mastery
          </h2>
          <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
             <StepCard
                step="1"
                title="Enter Your Topic"
                description="Tell us what you want to learn. Be as specific or broad as you like. The more detail, the better the path!"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>}
            />
            <StepCard
                step="2"
                title="AI Generates Path"
                description="Our AI, powered by Gemini, crafts a structured learning path with Beginner, Intermediate, and Advanced modules."
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>}
            />
            <StepCard
                step="3"
                title="Start Learning"
                description="Explore modules with curated YouTube and GitHub resources. Save paths, track progress, and add notes."
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>}
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-850">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Loved by Learners
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <TestimonialCard
              quote="This app transformed how I approach learning new skills. The AI-generated paths are spot on and save me so much time!"
              author="Alex P."
              role="Software Developer"
            />
            <TestimonialCard
              quote="Finally, a tool that organizes learning material so effectively. The progress tracking is super motivating. Highly recommend!"
              author="Jamie L."
              role="University Student"
            />
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-700 dark:to-secondary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-lg text-primary-100 dark:text-primary-200 max-w-xl mx-auto mb-8">
            Take the first step towards mastering new skills. Generate your first personalized learning path today.
          </p>
          <button
            onClick={() => onNavigate('create')}
            className="px-8 py-3 bg-white hover:bg-gray-100 text-secondary-600 font-semibold text-md rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-500"
          >
            Create My First Path
          </button>
           <p className="mt-8 text-sm text-primary-200 dark:text-primary-300">
            Questions or feedback? Reach out at <a href="mailto:info@learnpath.ai" className="underline hover:text-white">info@learnpath.ai</a> (simulated).
          </p>
        </div>
      </section>

      {/* Footer has been moved to App.tsx for global presence, this is just a placeholder if needed per-page */}
      <div className="py-8 text-center bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
         <p className="text-xs text-gray-500 dark:text-gray-400">
            Login is simulated. No actual user data is stored persistently on a server. Paths are saved in local storage.
        </p>
      </div>

    </div>
  );
};

export default LandingPage;
