
import React from 'react';
import { X, MessageCircle, User } from 'lucide-react';
import { ChatSession } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatListModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
  currentUserId: string;
}

export const ChatListModal: React.FC<ChatListModalProps> = ({ isOpen, onClose, sessions, onSelectSession, currentUserId }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  // Sort sessions by last updated (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[70vh] max-h-[600px] animate-fade-in">
        
        {/* Header */}
        <div className="p-4 border-b border-brand-800 bg-brand-950/50 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-brand-500" /> {t.nav.messages}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-brand-800 rounded-full transition">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {sortedSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                    <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                    <p>{t.chat.noMessages}</p>
                    <p className="text-xs mt-1">{t.chat.startChat}</p>
                </div>
            ) : (
                <div className="divide-y divide-brand-800">
                    {sortedSessions.map(session => {
                        const lastMsg = session.messages[session.messages.length - 1];
                        return (
                            <div 
                                key={session.id} 
                                onClick={() => { onSelectSession(session.id); onClose(); }}
                                className="p-4 hover:bg-brand-800/50 cursor-pointer transition flex gap-3 group"
                            >
                                <div className="relative">
                                     <div className="w-12 h-12 rounded-full bg-brand-800 border border-brand-600 flex items-center justify-center text-gray-300 overflow-hidden">
                                        <User className="w-6 h-6" />
                                     </div>
                                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-900"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-white truncate">{session.otherUserName}</h3>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(session.lastUpdated).toLocaleDateString() === new Date().toLocaleDateString() 
                                                ? new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                : new Date(session.lastUpdated).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <img src={session.itemImage} alt="" className="w-4 h-4 rounded object-cover inline-block" />
                                        <p className="text-xs text-brand-400 truncate font-medium mr-1">{session.itemTitle}:</p>
                                        <p className={`text-sm truncate ${lastMsg.senderId === currentUserId ? 'text-gray-500' : 'text-gray-300 font-medium'}`}>
                                            {lastMsg.senderId === currentUserId && `${t.chat.you} `}
                                            {lastMsg.imageUrl ? t.chat.sentImage : lastMsg.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
