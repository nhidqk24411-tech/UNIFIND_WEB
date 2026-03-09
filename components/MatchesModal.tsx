
import React from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { FoundItem } from '../types';
import { ItemCard } from './ItemCard';
import { useLanguage } from '../contexts/LanguageContext';

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: FoundItem[];
  onContact: (item: FoundItem) => void;
}

export const MatchesModal: React.FC<MatchesModalProps> = ({ isOpen, onClose, matches, onContact }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-800 bg-gradient-to-r from-brand-900 to-brand-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent/20 p-2 rounded-full">
                <Sparkles className="w-6 h-6 text-brand-accent animate-pulse" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{t.matches.title}</h2>
                <p className="text-sm text-gray-400">{t.matches.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar bg-brand-950/50">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map(item => (
                    <div key={item.id} className="relative">
                        <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border border-brand-900">
                            {t.matches.match}
                        </div>
                        <ItemCard item={item} onContact={(item) => { onContact(item); onClose(); }} />
                    </div>
                ))}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-800 bg-brand-900 rounded-b-2xl flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-amber-500">
             <AlertCircle className="w-4 h-4" />
             <span>{t.matches.notListed}</span>
          </div>
          <button 
            onClick={onClose}
            className="bg-brand-800 hover:bg-brand-700 text-white font-medium py-2 px-6 rounded-lg transition-colors border border-brand-600"
          >
            {t.matches.notMine}
          </button>
        </div>

      </div>
    </div>
  );
};
