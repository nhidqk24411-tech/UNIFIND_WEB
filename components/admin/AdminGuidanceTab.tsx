
import React, { useState } from 'react';
import { GuidancePost } from '../../types';
import { Edit2, Save, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminGuidanceTabProps {
  guidanceList: GuidancePost[];
  onUpdateGuidance: (updatedPost: GuidancePost) => void;
}

export const AdminGuidanceTab: React.FC<AdminGuidanceTabProps> = ({ guidanceList, onUpdateGuidance }) => {
  const { t } = useLanguage();
  const [editingGuidance, setEditingGuidance] = useState<GuidancePost | null>(null);

  const handleSaveGuidance = () => {
      if (editingGuidance) {
          onUpdateGuidance({
              ...editingGuidance,
              lastUpdated: new Date().toISOString().split('T')[0]
          });
          setEditingGuidance(null);
      }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-800 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-brand-500"/>
                    {t.admin.guidance.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {t.admin.guidance.subtitle}
                </p>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar space-y-6">
            {guidanceList.map(guide => (
                <div key={guide.id} className={`bg-brand-800 border ${editingGuidance?.id === guide.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-brand-700'} p-6 rounded-xl transition-all shadow-lg`}>
                    {editingGuidance?.id === guide.id ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-brand-400 font-bold text-sm uppercase tracking-wider">{t.admin.guidance.editTitle}</h3>
                                <div className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs rounded border border-amber-500/30 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3"/> {t.admin.guidance.unsaved}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.admin.guidance.postTitle}</label>
                                <input 
                                    value={editingGuidance.title} 
                                    onChange={e => setEditingGuidance({...editingGuidance, title: e.target.value})}
                                    className="w-full bg-brand-900 border border-brand-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{t.admin.guidance.content}</label>
                                <textarea 
                                    value={editingGuidance.content}
                                    onChange={e => setEditingGuidance({...editingGuidance, content: e.target.value})}
                                    rows={8}
                                    className="w-full bg-brand-900 border border-brand-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner leading-relaxed"
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <button 
                                    onClick={() => setEditingGuidance(null)} 
                                    className="px-4 py-2 bg-brand-900 border border-brand-700 text-gray-300 rounded-lg hover:text-white hover:bg-brand-800 transition text-sm font-medium"
                                >
                                    {t.admin.guidance.cancel}
                                </button>
                                <button 
                                    onClick={handleSaveGuidance} 
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-600/20 active:scale-95 transition"
                                >
                                    <Save className="w-4 h-4"/> {t.admin.guidance.save}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-white text-xl group-hover:text-brand-400 transition-colors">{guide.title}</h3>
                                <button 
                                    onClick={() => setEditingGuidance(guide)} 
                                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition shadow border border-brand-600"
                                >
                                    <Edit2 className="w-3 h-3"/> {t.common.edit}
                                </button>
                            </div>
                            
                            <div className="bg-brand-900/50 p-4 rounded-lg border border-brand-700/50">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                    {guide.content}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                <Clock className="w-3 h-3"/>
                                <span>{t.help.lastUpdated}: {guide.lastUpdated}</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};
