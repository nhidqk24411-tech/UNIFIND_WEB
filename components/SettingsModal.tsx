
import React from 'react';
import { X, Globe, Bell, Shield, Smartphone, Power } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

import { useConfirm } from '../contexts/ConfirmContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t, pushEnabled, togglePushNotifications } = useLanguage();
  const { confirm } = useConfirm();

  if (!isOpen) return null;

  const handleExit = async () => {
    if (await confirm(t.common.confirm, t.settings.confirmExit)) {
      // Attempt to close the window (Works for PWAs or scripts that opened the window)
      window.close();
      
      // Fallback: Redirect to a blank page or google if window.close() is blocked by browser
      // Using a short timeout to allow window.close to try first
      setTimeout(() => {
          window.location.href = "about:blank"; 
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-brand-800 bg-brand-950/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t.settings.title}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-brand-800 rounded-full transition">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* Language Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {t.settings.general}
                </h3>
                
                <div className="bg-brand-800 rounded-xl p-4 border border-brand-700 flex justify-between items-center">
                    <div>
                        <p className="text-white font-medium">{t.settings.language}</p>
                        <p className="text-xs text-gray-500">English / Tiếng Việt</p>
                    </div>
                    <div className="flex bg-brand-950 rounded-lg p-1 border border-brand-800">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('vi')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'vi' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Tiếng Việt
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4" /> {t.settings.notifications}
                </h3>
                
                <div className="bg-brand-800 rounded-xl p-4 border border-brand-700 flex justify-between items-center">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{t.settings.pushLabel}</p>
                            {pushEnabled && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded border border-green-500/30">ON</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {t.settings.pushDesc}
                        </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                        onClick={togglePushNotifications}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${pushEnabled ? 'bg-green-500' : 'bg-brand-950 border border-brand-600'}`}
                    >
                        <div 
                            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${pushEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>

            {/* Info Section (Static) */}
             <div className="bg-brand-950/50 rounded-xl p-4 border border-brand-800/50 flex gap-3 items-start">
                 <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                 <div>
                     <p className="text-sm text-gray-300 font-medium">{t.settings.privacy}</p>
                     <p className="text-xs text-gray-500 mt-1">Version 1.2.0 • Build 2024</p>
                 </div>
             </div>
        </div>

        <div className="p-4 border-t border-brand-800 bg-brand-950/50 flex justify-between gap-4">
            <button 
                onClick={handleExit}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-lg transition text-sm flex items-center gap-2 border border-red-500/20"
            >
                <Power className="w-4 h-4" /> {t.settings.exitApp}
            </button>
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-brand-700 hover:bg-brand-600 text-white font-medium rounded-lg transition text-sm"
            >
                {t.settings.save}
            </button>
        </div>

      </div>
    </div>
  );
};
