
import React, { useState, useMemo } from 'react';
import { LearningPath, Level, Module, Project } from '../types';
import { ModuleCard } from './ModuleCard';
import { ResourceLink } from './ResourceLink';
import { jsPDF } from "jspdf";

interface LearningPathDisplayProps {
  path: LearningPath;
  onSavePath?: (path: LearningPath) => void;
  onBack: () => void;
  onToggleModuleCompletion: (levelName: string, moduleTitle: string) => void;
  onUpdateModuleNotes: (levelName: string, moduleTitle: string, notes: string) => void;
}

const PdfFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
  </svg>
);

const FolderOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Z" />
  </svg>
);


const LearningPathDisplay: React.FC<LearningPathDisplayProps> = ({ path, onSavePath, onBack, onToggleModuleCompletion, onUpdateModuleNotes }) => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(path.levels[0]?.name || null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const toggleLevel = (levelName: string) => {
    setExpandedLevel(expandedLevel === levelName ? null : levelName);
  };
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const { totalModules, completedModules, progressPercentage } = useMemo(() => {
    let total = 0;
    let completed = 0;
    path.levels.forEach(level => {
      level.modules.forEach(module => {
        total++;
        if (module.isCompleted) {
          completed++;
        }
      });
    });
    return {
      totalModules: total,
      completedModules: completed,
      progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [path]);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });

      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 40;
      const maxLineWidth = pageWidth - margin * 2;
      let yPosition = margin;
      
      const titleFontSize = 20;
      const levelHeaderFontSize = 16;
      const subHeaderFontSize = 14;
      const itemTitleFontSize = 12; // For module/project titles
      const itemDescFontSize = 10;
      const resourceFontSize = 9;
      
      const titleLineHeight = titleFontSize * 1.2;
      const levelHeaderLineHeight = levelHeaderFontSize * 1.2;
      const subHeaderLineHeight = subHeaderFontSize * 1.2;
      const itemTitleLineHeight = itemTitleFontSize * 1.2;
      const itemDescLineHeight = itemDescFontSize * 1.2;
      const resourceLineHeight = resourceFontSize * 1.2;


      const addTextWithWrapAndPageBreak = (text: string, x: number, currentY: number, fontSize: number, fontStyle: 'normal' | 'bold', customLineHeight?: number, textColor: string = "#000000") => {
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, fontStyle);
        pdf.setTextColor(textColor);
        
        const lines = pdf.splitTextToSize(text, maxLineWidth - (x - margin)); 
        const effectiveLineHeight = customLineHeight || (fontSize * 1.2);

        let newY = currentY;
        lines.forEach((line: string) => {
          if (newY + effectiveLineHeight > pageHeight - margin) {
            pdf.addPage();
            newY = margin;
            const newPageCount = pdf.internal.pages.length -1;
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150); 
            pdf.text(`Page ${newPageCount} of ...`, pageWidth - margin, pageHeight - margin + 15, { align: 'right' }); 
          }
          pdf.text(line, x, newY);
          newY += effectiveLineHeight;
        });
        return newY;
      };
      
      yPosition = addTextWithWrapAndPageBreak(`Learning Road Map: ${path.topic}`, margin, yPosition, titleFontSize, 'bold', titleLineHeight);
      yPosition += titleLineHeight * 0.5; 

      path.levels.forEach((level: Level) => {
        if (yPosition + levelHeaderLineHeight * 2 > pageHeight - margin) { 
            pdf.addPage();
            yPosition = margin;
        }
        yPosition += levelHeaderLineHeight * 0.75; 
        yPosition = addTextWithWrapAndPageBreak(level.name, margin, yPosition, levelHeaderFontSize, 'bold', levelHeaderLineHeight);
        
        // Modules Section
        yPosition += subHeaderLineHeight * 0.25;
        yPosition = addTextWithWrapAndPageBreak("Modules:", margin + 10, yPosition, subHeaderFontSize, 'bold', subHeaderLineHeight);

        if (!level.modules || level.modules.length === 0) {
            yPosition = addTextWithWrapAndPageBreak("- No modules defined for this level.", margin + 20, yPosition, itemDescFontSize, 'normal', itemDescLineHeight);
        } else {
            level.modules.forEach((module: Module) => {
                if (yPosition + itemTitleLineHeight > pageHeight - margin) { 
                    pdf.addPage();
                    yPosition = margin;
                }
                const completionMark = module.isCompleted ? '[X]' : '[ ]';
                yPosition = addTextWithWrapAndPageBreak(`${completionMark} ${module.title}`, margin + 20, yPosition, itemTitleFontSize, 'normal', itemTitleLineHeight);
                yPosition = addTextWithWrapAndPageBreak(module.description, margin + 25, yPosition, itemDescFontSize, 'normal', itemDescLineHeight);

                const resourceIndent = margin + 30;
                if (module.youtubeUrl) {
                    if (yPosition + resourceLineHeight > pageHeight - margin) { pdf.addPage(); yPosition = margin; }
                    yPosition = addTextWithWrapAndPageBreak(`YouTube: ${module.youtubeUrl}`, resourceIndent, yPosition, resourceFontSize, 'normal', resourceLineHeight, "#007bff");
                }
                if (module.githubUrl) {
                    if (yPosition + resourceLineHeight > pageHeight - margin) { pdf.addPage(); yPosition = margin; }
                    yPosition = addTextWithWrapAndPageBreak(`GitHub: ${module.githubUrl}`, resourceIndent, yPosition, resourceFontSize, 'normal', resourceLineHeight, "#007bff");
                }
                yPosition += itemTitleLineHeight * 0.25; 
            });
        }
        yPosition += subHeaderLineHeight * 0.5; 

        // Projects Section
        if (yPosition + subHeaderLineHeight > pageHeight - margin) { pdf.addPage(); yPosition = margin; }
        yPosition = addTextWithWrapAndPageBreak("Projects:", margin + 10, yPosition, subHeaderFontSize, 'bold', subHeaderLineHeight);

        if (!level.projects || level.projects.length === 0) {
            yPosition = addTextWithWrapAndPageBreak("- No projects defined for this level.", margin + 20, yPosition, itemDescFontSize, 'normal', itemDescLineHeight);
        } else {
            level.projects.forEach((project: Project) => {
                if (yPosition + itemTitleLineHeight > pageHeight - margin) { 
                    pdf.addPage();
                    yPosition = margin;
                }
                yPosition = addTextWithWrapAndPageBreak(project.title, margin + 20, yPosition, itemTitleFontSize, 'bold', itemTitleLineHeight);
                yPosition = addTextWithWrapAndPageBreak(project.description, margin + 25, yPosition, itemDescFontSize, 'normal', itemDescLineHeight);
                
                if (project.githubUrl) {
                    if (yPosition + resourceLineHeight > pageHeight - margin) { pdf.addPage(); yPosition = margin; }
                    yPosition = addTextWithWrapAndPageBreak(`GitHub: ${project.githubUrl}`, margin + 30, yPosition, resourceFontSize, 'normal', resourceLineHeight, "#007bff");
                }
                yPosition += itemTitleLineHeight * 0.25;
            });
        }
        yPosition += levelHeaderLineHeight; 
      });

      const totalPages = pdf.internal.pages.length -1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - margin + 15, { align: 'right' });
      }
      
      const sanitizedTopic = path.topic.replace(/[^a-z0-9_]+/gi, '_').toLowerCase();
      pdf.save(`${sanitizedTopic}_learning_roadmap.pdf`);

    } catch (e) {
      console.error("Error generating PDF:", e);
      setPdfError(e instanceof Error ? `PDF Generation Failed: ${e.message}` : "An unknown error occurred during PDF generation.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 lg:p-8">
        <div id="action-buttons-container" className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 dark:text-primary-400">{path.topic}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generated on: {formatDate(path.createdAt)}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            >
              &larr; Back 
            </button>
            {onSavePath && ( 
              <button
                onClick={() => onSavePath(path)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-gray-800"
              >
                Save Path
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download path as PDF Road Map"
            >
              {isGeneratingPdf ? (
                <>
                  <SpinnerIcon className="animate-spin w-4 h-4 mr-2" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <PdfFileIcon className="w-4 h-4 mr-2" />
                  Download PDF Road Map
                </>
              )}
            </button>
          </div>
        </div>
        {pdfError && <p id="pdf-error-message" className="text-sm text-red-600 dark:text-red-400 my-2 p-2 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-center">{pdfError}</p>}
        
        {totalModules > 0 && (
          <div id="progress-bar-container" className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-secondary-700 dark:text-secondary-400">Path Progress</span>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-400">{completedModules} / {totalModules} Modules ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-secondary-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        )}

        {path.levels.map((level: Level) => (
          <div key={level.name} className="mb-8">
            <button
              onClick={() => toggleLevel(level.name)}
              className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg shadow focus:outline-none"
              aria-expanded={expandedLevel === level.name}
              aria-controls={`level-content-${level.name.replace(/\s+/g, '-')}`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-secondary-700 dark:text-secondary-400">{level.name}</h2>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className={`w-6 h-6 transform transition-transform duration-200 ${(expandedLevel === level.name) ? 'rotate-180' : 'rotate-0'}`}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>
            
            {(expandedLevel === level.name) && (
              <div id={`level-content-${level.name.replace(/\s+/g, '-')}`} className="mt-4">
                {/* Modules Section */}
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 ml-1">Modules</h3>
                {level.modules && level.modules.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {level.modules.map((module: Module, index: number) => (
                      <ModuleCard 
                          key={`${level.name}-module-${module.title}-${index}`} 
                          module={module} 
                          moduleNumber={index + 1}
                          onToggleComplete={() => onToggleModuleCompletion(level.name, module.title)}
                          onUpdateNotes={(notes) => onUpdateModuleNotes(level.name, module.title, notes)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No modules available for this level.</p>
                )}

                {/* Projects Section */}
                {level.projects && level.projects.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 ml-1 flex items-center">
                      <FolderOpenIcon className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" />
                      Projects for this Level
                    </h3>
                    <div className="space-y-6">
                      {level.projects.map((project: Project, index: number) => (
                        <div key={`${level.name}-project-${project.title}-${index}`} className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg shadow">
                          <h4 className="text-md font-semibold text-primary-700 dark:text-primary-300 mb-1">{project.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{project.description}</p>
                          {project.githubUrl && project.githubUrl !== "#" && (
                             <ResourceLink type="github" url={project.githubUrl} title={`View "${project.title}" on GitHub`} />
                          )}
                          {(!project.githubUrl || project.githubUrl === "#") && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 italic">No GitHub link provided for this project.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                 {(!level.projects || level.projects.length === 0) && (
                   <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">No projects specified for this level.</p>
                   </div>
                 )}
              </div>
            )}
          </div>
        ))}
         {path.levels.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No learning levels found for this path.</p>}
      </div>
    </div>
  );
};

export default LearningPathDisplay;
