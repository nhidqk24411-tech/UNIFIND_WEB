
import React, { useState } from 'react';
import { ChatSession } from '../../types';
import { MessageSquare, Trash2, Eye, X, User, Clock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import { useConfirm } from '../../contexts/ConfirmContext';

interface AdminChatsTabProps {
  sessions: ChatSession[];
  onDeleteChat: (sessionId: string) => void;
}

export const AdminChatsTab: React.FC<AdminChatsTabProps> = ({ sessions, onDeleteChat }) => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (await confirm(t.common.confirm, "Admin Action: Are you sure you want to delete this conversation permanently?")) {
          onDeleteChat(id);
          if (selectedSession?.id === id) setSelectedSession(null);
      }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-800 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-brand-500"/>
                    {t.admin.chats}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {t.admin.chatsDesc}
                </p>
            </div>
            <div className="bg-brand-900 border border-brand-800 px-4 py-2 rounded-lg text-sm text-gray-300">
                Active Sessions: <span className="text-brand-400 font-bold ml-1">{sessions.length}</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex bg-brand-800 rounded-xl border border-brand-700 shadow-xl">
            
            {/* List View */}
            <div className={`flex-1 flex flex-col ${selectedSession ? 'hidden md:flex md:w-1/3 md:flex-none border-r border-brand-700' : 'w-full'}`}>
                <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-3">
                    {sessions.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>{t.admin.noChats}</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div 
                                key={session.id} 
                                onClick={() => setSelectedSession(session)}
                                className={`p-4 rounded-lg cursor-pointer transition border ${
                                    selectedSession?.id === session.id 
                                    ? 'bg-brand-700 border-brand-500' 
                                    : 'bg-brand-900/50 border-brand-800 hover:bg-brand-700/50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs">
                                            {session.participants.length}
                                        </div>
                                        <span className="truncate max-w-[120px]" title={session.itemTitle}>{session.itemTitle}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDelete(session.id, e)}
                                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-brand-900"
                                        title={t.admin.deleteChat}
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                                
                                <div className="space-y-1 text-xs text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3"/>
                                        <span className="truncate">
                                            {session.participants.join(' & ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3"/>
                                        <span>
                                            {new Date(session.lastUpdated).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View (Chat History) */}
            {selectedSession ? (
                <div className="flex-1 flex flex-col bg-brand-900/50 w-full md:w-auto">
                    <div className="p-4 border-b border-brand-700 flex justify-between items-center bg-brand-900">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedSession(null)} className="md:hidden text-gray-400">
                                <ArrowLeft className="w-5 h-5"/>
                            </button>
                            <div>
                                <h3 className="text-white font-bold">{selectedSession.itemTitle}</h3>
                                <p className="text-xs text-gray-500 font-mono">Session ID: {selectedSession.id}</p>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleDelete(selectedSession.id, e)}
                            className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition flex items-center gap-2"
                        >
                            <Trash2 className="w-3 h-3"/> {t.admin.deleteChat}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {selectedSession.messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.isSystem ? 'items-center' : 'items-start'}`}>
                                {msg.isSystem ? (
                                    <span className="text-[10px] text-gray-500 bg-brand-950 px-2 py-1 rounded border border-brand-800">
                                        {msg.text}
                                    </span>
                                ) : (
                                    <div className="max-w-[85%] w-full">
                                        <p className="text-[10px] text-gray-500 mb-1 ml-1 flex justify-between">
                                            <span className="font-bold text-brand-400">{msg.senderId}</span>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </p>
                                        <div className="bg-brand-800 border border-brand-700 p-3 rounded-lg rounded-tl-none text-sm text-gray-200">
                                            {msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="Attachment" className="max-h-48 rounded mb-2 border border-brand-600"/>
                                            )}
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 bg-brand-900/30">
                    <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                        <p>Chọn một cuộc hội thoại để xem chi tiết.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
