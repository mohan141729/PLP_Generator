import React from 'react';

type View = 'landing' | 'login' | 'dashboard' | 'create' | 'metrics';

interface LandingPageProps {
  onNavigate: (view: View, params?: { mode?: 'login' | 'register' }) => void;
  isAuthenticated?: boolean;
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


const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isAuthenticated = false }) => {
  return (
    <div className="dark:text-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-600 to-fuchsia-600 dark:from-sky-600 dark:via-indigo-700 dark:to-fuchsia-700" />
        <div className="relative min-h-screen flex items-center py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left: Messaging */}
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-sky-100/90 bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/20">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-300" /> Personalized Learning Path Generator
                </span>
                <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                    Learn Faster, Smarter, with AI
                  </span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl md:text-2xl text-sky-50/90 max-w-2xl mx-auto lg:mx-0">
                  Instantly generate Beginner → Advanced learning paths for any topic, complete with curated YouTube and GitHub resources.
                </p>
                <ul className="mt-6 space-y-3 max-w-2xl mx-auto lg:mx-0 text-sky-50/90">
                  <li className="flex items-start gap-3 justify-center lg:justify-start">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-emerald-900 text-xs font-bold">✓</span>
                    <span>AI-crafted levels and modules tailored to your topic</span>
                  </li>
                  <li className="flex items-start gap-3 justify-center lg:justify-start">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-emerald-900 text-xs font-bold">✓</span>
                    <span>Track completion, add notes, and save your paths</span>
                  </li>
                  <li className="flex items-start gap-3 justify-center lg:justify-start">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-emerald-900 text-xs font-bold">✓</span>
                    <span>Powered by Google Gemini</span>
                  </li>
                </ul>
                <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'create')}
                    className="px-6 sm:px-7 py-3.5 bg-white hover:bg-gray-100 text-indigo-600 font-semibold rounded-lg shadow-lg transform hover:scale-[1.02] transition duration-200 focus:outline-none focus:ring-4 focus:ring-sky-300"
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Create a Path'}
                  </button>
                  {!isAuthenticated && (
                    <button
                      onClick={() => onNavigate('login', { mode: 'login' })}
                      className="px-6 sm:px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg ring-1 ring-white/30 backdrop-blur-sm transform hover:scale-[1.02] transition duration-200 focus:outline-none focus:ring-4 focus:ring-white/40"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Preview */}
              <div className="hidden lg:block">
                <div className="rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md p-5 md:p-6 shadow-xl">
                  <div className="rounded-xl bg-white/70 backdrop-blur-md p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm md:text-base font-semibold text-gray-800">Your AI Learning Path</h3>
                      <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Preview</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[{name:'Beginner', color:'emerald'},{name:'Intermediate', color:'amber'},{name:'Advanced', color:'rose'}].map((lvl) => (
                        <div key={lvl.name} className="rounded-lg border border-gray-200 p-3 bg-white/90">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex h-2.5 w-2.5 rounded-full bg-${'{'}lvl.color{'}'}-500`}></span>
                              <span className="text-sm font-semibold text-gray-800">{lvl.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">6 modules</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {['Intro', 'Core', 'Project', 'Practice'].map((m) => (
                              <div key={m} className="flex items-center gap-2 text-xs text-gray-700">
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-emerald-100 text-emerald-700">✓</span>
                                <span>{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-600">Progress</div>
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Stats ribbon */}
        <div className="relative bg-white dark:bg-gray-900 mt-[-100px]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow-xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-800">
                {/* Paths Created */}
                <div className="flex items-center justify-center gap-3 py-4 sm:py-5 px-4">
                  <div className="p-2 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M8 3a1 1 0 0 0-1 1v5a5 5 0 0 0 4 4.9V17H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.1A5 5 0 0 0 17 9V4a1 1 0 0 0-1-1H8Zm1 2h6v4a3 3 0 1 1-6 0V5Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">1,200+</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Paths Created</div>
                  </div>
                </div>
                {/* Modules Curated */}
                <div className="flex items-center justify-center gap-3 py-4 sm:py-5 px-4">
                  <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M3 5a2 2 0 0 1 2-2h4v6H3V5Zm0 6h6v6H5a2 2 0 0 1-2-2v-4Zm10-8h4a2 2 0 0 1 2 2v4h-6V3Zm6 8v4a2 2 0 0 1-2 2h-4v-6h6Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">20k+</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Modules Curated</div>
                  </div>
                </div>
                {/* Active Learners */}
                <div className="flex items-center justify-center gap-3 py-4 sm:py-5 px-4">
                  <div className="p-2 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M7.5 6a3.5 3.5 0 1 1 6.221 2.087A5.5 5.5 0 0 1 19 13.5V15a1 1 0 0 1-1 1h-1.035A4.5 4.5 0 1 1 7.5 6Zm0 0a4.5 4.5 0 0 0-4.5 4.5V15a1 1 0 0 0 1 1h2.035A4.5 4.5 0 0 1 7.5 6Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400">3,500+</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Active Learners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose LearnPath AI? Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Why Choose LearnPath AI?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
          <div className="grid md:grid-cols-1 gap-6 sm:gap-8 max-w-3xl mx-auto">
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
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            Loved by Learners
          </h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
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

      {/* Per-page footer removed since global footer is present */}

    </div>
  );
};

export default LandingPage;
