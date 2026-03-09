
import React, { useState } from 'react';
import { X, BookOpen, MessageSquare, Edit2, Save, Send, CheckCircle } from 'lucide-react';
import { GuidancePost, Role, Message } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidance: GuidancePost[];
  userRole: Role;
  onUpdateGuidance?: (post: GuidancePost) => void;
  // Feedback Props
  feedbackMessages: Message[]; // Kept for interface compatibility but not used for display
  onSendFeedback: (text: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
    isOpen, onClose, guidance, userRole, onUpdateGuidance, 
    feedbackMessages, onSendFeedback 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'FEEDBACK'>('GUIDE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Feedback state for simple form
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen) return null;

  const startEdit = (post: GuidancePost) => {
      setEditingId(post.id);
      setEditContent(post.content);
  };

  const saveEdit = (post: GuidancePost) => {
      if (onUpdateGuidance) {
          onUpdateGuidance({ ...post, content: editContent, lastUpdated: new Date().toISOString().split('T')[0] });
      }
      setEditingId(null);
  };

  const handleSendFeedback = () => {
      if (!feedbackInput.trim()) return;
      onSendFeedback(feedbackInput);
      setFeedbackInput('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
  };

  // Admins don't need to see the Feedback tab here (they view it in dashboard)
  const showFeedbackTab = userRole !== 'ADMIN';

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[80vh] max-h-[700px] animate-fade-in overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex border-b border-brand-800 bg-brand-950/80">
            <button 
                onClick={() => setActiveTab('GUIDE')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'GUIDE' ? 'text-white border-b-2 border-brand-500 bg-brand-900' : 'text-gray-400 hover:text-white'}`}
            >
                <BookOpen className="w-4 h-4"/> {t.help.guideTab}
            </button>
            {showFeedbackTab && (
                <button 
                    onClick={() => setActiveTab('FEEDBACK')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'FEEDBACK' ? 'text-white border-b-2 border-brand-500 bg-brand-900' : 'text-gray-400 hover:text-white'}`}
                >
                    <MessageSquare className="w-4 h-4"/> {t.help.feedbackTab}
                </button>
            )}
            <button onClick={onClose} className="px-4 text-gray-400 hover:text-white border-l border-brand-800">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-brand-900">
            
            {/* TAB: GUIDANCE */}
            {activeTab === 'GUIDE' && (
                <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {guidance.map(post => (
                        <div key={post.id} className="bg-brand-800/50 p-6 rounded-xl border border-brand-700">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-white">{post.title}</h3>
                                {userRole === 'ADMIN' && onUpdateGuidance && (
                                    !editingId || editingId !== post.id ? (
                                        <button onClick={() => startEdit(post)} className="text-brand-400 hover:text-white p-1">
                                            <Edit2 className="w-4 h-4"/>
                                        </button>
                                    ) : null
                                )}
                            </div>

                            {editingId === post.id ? (
                                <div className="space-y-3">
                                    <textarea 
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={6}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">{t.common.cancel}</button>
                                        <button onClick={() => saveEdit(post)} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg flex items-center gap-2 font-medium">
                                            <Save className="w-3 h-3"/> {t.common.save}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                    {post.content}
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-brand-700/50">
                                {t.help.lastUpdated}: {post.lastUpdated}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: FEEDBACK SIMPLE FORM (Users Only) */}
            {activeTab === 'FEEDBACK' && showFeedbackTab && (
                <div className="h-full flex flex-col p-8 items-center justify-center">
                    {feedbackSent ? (
                        <div className="text-center animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                <CheckCircle className="w-8 h-8 text-green-500"/>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t.help.successTitle}</h3>
                            <p className="text-gray-400">{t.help.successMsg}</p>
                            <button 
                                onClick={() => setFeedbackSent(false)}
                                className="mt-6 text-brand-400 hover:text-white text-sm underline"
                            >
                                {t.help.sendAnother}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full max-w-lg space-y-4">
                            <div className="text-center mb-6">
                                <MessageSquare className="w-12 h-12 text-brand-500 mx-auto mb-3"/>
                                <h3 className="text-xl font-bold text-white">{t.help.title}</h3>
                                <p className="text-gray-400 text-sm mt-1">{t.help.subtitle}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.help.contentLabel}</label>
                                <textarea 
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    rows={5}
                                    placeholder={t.help.placeholder}
                                    className="w-full bg-white border border-brand-700 rounded-xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleSendFeedback}
                                disabled={!feedbackInput.trim()}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-4 h-4"/> {t.help.send}
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
