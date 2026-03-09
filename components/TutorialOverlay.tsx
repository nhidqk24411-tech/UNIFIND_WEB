
import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, Check, Target } from 'lucide-react';
import { Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialOverlayProps {
  onComplete: () => void;
  userRole: Role;
}

interface Step {
  targetIds: string[]; // Changed to array to support multiple potential targets (desktop/mobile)
  title: string;
  text: string;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, userRole }) => {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Define steps with translations
  const userSteps: Step[] = [
    { targetIds: ['root-logo'], title: t.tutorial.user.welcomeTitle, text: t.tutorial.user.welcomeText },
    { targetIds: ['report-buttons'], title: t.tutorial.user.reportTitle, text: t.tutorial.user.reportText },
    { targetIds: ['search-bar'], title: t.tutorial.user.searchTitle, text: t.tutorial.user.searchText },
    { targetIds: ['filter-bar'], title: t.tutorial.user.filterTitle, text: t.tutorial.user.filterText },
    { targetIds: ['advanced-filters'], title: t.tutorial.user.advFilterTitle, text: t.tutorial.user.advFilterText },
    { targetIds: ['help-btn'], title: t.tutorial.user.helpTitle, text: t.tutorial.user.helpText },
  ];

  // Updated Admin Steps to follow the flow: Logo -> Metrics -> Trends -> Sidebar
  const adminSteps: Step[] = [
    { targetIds: ['root-logo'], title: t.tutorial.admin.dashTitle, text: t.tutorial.admin.dashText },
    
    // Overview Elements
    { targetIds: ['admin-stats-row'], title: t.tutorial.admin.overviewTitle, text: t.tutorial.admin.overviewText },
    { targetIds: ['admin-trend-chart'], title: t.tutorial.admin.chartTitle, text: t.tutorial.admin.chartText },
    
    // Sidebar Elements (Sequence)
    // Note: On mobile, these IDs map to the scrollable tab buttons
    { targetIds: ['nav-admin-verify', 'mobile-nav-admin-verify'], title: t.tutorial.admin.verifyTitle, text: t.tutorial.admin.verifyText },
    { targetIds: ['nav-admin-items', 'mobile-nav-admin-items'], title: t.tutorial.admin.itemsTitle, text: t.tutorial.admin.itemsText },
    { targetIds: ['nav-admin-chats', 'mobile-nav-admin-chats'], title: t.tutorial.admin.chatsTitle, text: t.tutorial.admin.chatsText },
    { targetIds: ['nav-admin-reports', 'mobile-nav-admin-reports'], title: t.tutorial.admin.reportsTitle, text: t.tutorial.admin.reportsText },
  ];

  const steps = userRole === 'ADMIN' ? adminSteps : userSteps;

  const updatePosition = useCallback(() => {
      const step = steps[stepIndex];
      let element: HTMLElement | null = null;

      // Try to find the first visible element matching the IDs
      for (const id of step.targetIds) {
          const el = document.getElementById(id);
          if (el) {
              const r = el.getBoundingClientRect();
              // Check if element is visible and has dimension
              if (r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none') {
                  element = el;
                  break; 
              }
          }
      }

      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          const r = element.getBoundingClientRect();
          // Add a small padding to the highlight box
          setRect({
              top: r.top - 5,
              left: r.left - 5,
              width: r.width + 10,
              height: r.height + 10
          });
      } else {
          // If element not found or hidden, default to center screen (fallback)
          setRect({
             top: window.innerHeight / 2 - 50,
             left: window.innerWidth / 2 - 150,
             width: 300,
             height: 100
          });
      }
  }, [stepIndex, steps]);

  useEffect(() => {
    // Initial delay to allow rendering
    const timer = setTimeout(updatePosition, 500);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('orientationchange', () => {
        setTimeout(updatePosition, 200); // Delay for orientation settle
    });
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('orientationchange', updatePosition);
    };
  }, [updatePosition, stepIndex]);

  const handleNext = () => {
      if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
      else onComplete();
  };

  const currentStep = steps[stepIndex];

  // Tooltip positioning logic
  const getTooltipStyle = () => {
      if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

      const isTopHalf = rect.top < window.innerHeight / 2;
      
      let top, left;

      if (isTopHalf) {
          top = rect.top + rect.height + 20; // Show below
      } else {
          top = rect.top - 200; // Show above (approx height of tooltip)
          // Adjust if tooltip goes off top
          if (top < 10) top = rect.top + rect.height + 20; 
      }

      // Center horizontally relative to target, but clamp to screen edges
      left = rect.left + (rect.width / 2) - 160; // 160 is half tooltip width
      if (left < 10) left = 10;
      if (left > window.innerWidth - 330) left = window.innerWidth - 330;

      return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden">
        {/* Spotlight Effect using Box Shadow */}
        {rect && (
             <div 
                className="absolute transition-all duration-300 ease-in-out pointer-events-none rounded-lg"
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)', // The Magic Darkening
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                }}
             >
                 {/* Pulsing effect */}
                 <div className="absolute -inset-2 border-2 border-brand-500 rounded-xl opacity-75 animate-pulse"></div>
             </div>
        )}

        {/* Tooltip Card - HIGH CONTRAST MODE */}
        <div 
            className="absolute w-80 bg-white text-gray-900 p-6 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 z-[2001] animate-fade-in flex flex-col"
            style={getTooltipStyle()}
        >
             <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2">
                     <Target className="w-4 h-4 text-brand-600"/>
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {t.tutorial.step} {stepIndex + 1}/{steps.length}
                     </span>
                 </div>
                 <button onClick={onComplete} className="text-gray-400 hover:text-red-500 transition">
                     <X className="w-5 h-5"/>
                 </button>
             </div>

             <h3 className="text-xl font-bold mb-2 text-gray-900">{currentStep.title}</h3>
             <p className="text-sm text-gray-800 font-medium mb-6 leading-relaxed">{currentStep.text}</p>

             <div className="flex items-center justify-between mt-auto">
                 {stepIndex > 0 ? (
                     <button onClick={() => setStepIndex(stepIndex - 1)} className="text-sm text-gray-500 hover:text-brand-600 underline font-medium">
                         {t.tutorial.back}
                     </button>
                 ) : <div></div>}

                 <button 
                    onClick={handleNext}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
                 >
                    {stepIndex === steps.length - 1 ? t.tutorial.finish : t.tutorial.next}
                    {stepIndex === steps.length - 1 ? <Check className="w-4 h-4"/> : <ArrowRight className="w-4 h-4"/>}
                 </button>
             </div>
        </div>
    </div>
  );
};
