
import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { Message } from '../types';

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const SupportChatModal: React.FC<SupportChatModalProps> = ({ isOpen, onClose, messages, onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
      if(!input.trim()) return;
      onSendMessage(input);
      setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[500px] animate-fade-in">
         <div className="p-4 border-b border-brand-800 bg-brand-950/50 flex justify-between items-center rounded-t-2xl">
            <h2 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-500"/> App Feedback & Support
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-900/50">
             {messages.length === 0 && (
                 <div className="text-center text-gray-500 text-sm mt-10">
                     <p>Found a bug? Have a suggestion?</p>
                     <p>Send a message to the Admin team.</p>
                 </div>
             )}
             {messages.map(msg => (
                 <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${msg.senderId === 'admin' ? 'bg-brand-800 text-gray-200' : 'bg-brand-600 text-white'}`}>
                         {msg.text}
                     </div>
                 </div>
             ))}
         </div>

         <div className="p-3 border-t border-brand-800 flex gap-2">
             <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your feedback..."
                className="flex-1 bg-brand-950 border border-brand-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                onKeyDown={e => e.key === 'Enter' && handleSend()}
             />
             <button onClick={handleSend} className="bg-brand-600 p-2 rounded-lg text-white hover:bg-brand-500">
                 <Send className="w-5 h-5"/>
             </button>
         </div>
      </div>
    </div>
  );
};
