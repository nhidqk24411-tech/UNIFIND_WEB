
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Mic, MicOff, Loader2, User, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { FoundItem, UserProfile, Message } from '../types';
import { validateImageContent, moderateChatMessage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoundItem | null;
  currentUser: UserProfile;
  messages: Message[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  // New props for return confirmation
  onConfirmReturn: () => void;
  isMyTurnConfirmed: boolean;
  isOtherTurnConfirmed: boolean;
  isItemCompleted: boolean;
  onUserClick?: (userId: string, userName: string) => void; // Added for profile view
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const ContactModal: React.FC<ContactModalProps> = ({ 
    isOpen, onClose, item, currentUser, messages, onSendMessage, 
    onConfirmReturn, isMyTurnConfirmed, isOtherTurnConfirmed, isItemCompleted,
    onUserClick
}) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Image State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false); 
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Cleanup on close
  useEffect(() => {
      if (!isOpen) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsRecording(false);
          setInputValue('');
      }
  }, [isOpen]);

  // --- Handlers ---

  const handleSendClick = async () => {
      if (!inputValue.trim()) return;

      setIsSending(true);
      try {
          // Moderate Text
          const cleanText = await moderateChatMessage(inputValue);
          onSendMessage(cleanText);
          setInputValue('');
      } catch (e) {
          console.error(e);
      } finally {
          setIsSending(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendClick();
      }
  };

  // --- Voice Logic ---
  const toggleVoiceInput = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Voice input not supported in this browser.");
          return;
      }

      if (isRecording) {
          recognitionRef.current?.stop();
          setIsRecording(false);
          return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
      };
      recognition.onend = () => setIsRecording(false);
      
      recognition.start();
  };

  // --- Image Logic ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && item) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              setIsUploading(true);
              setUploadError(null);

              // AI Moderation
              const result = await validateImageContent(base64, item.category, item.title);
              
              setIsUploading(false);

              if (result.isValid) {
                   onSendMessage("", base64);
              } else {
                  setUploadError(result.reason || "Image blocked: NSFW content detected.");
                  // Auto clear error after 3s
                  setTimeout(() => setUploadError(null), 3000);
              }
          };
          reader.readAsDataURL(file);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen || !item) return null;
  const isLost = item.type === 'LOST';

  // Determine partner info (Simplification: assuming Item owner/finder is the partner)
  // If I created the item, I am talking to a generic "User". 
  // If I am contacting, I am talking to item.userId (the poster).
  const isMePoster = currentUser.id === item.userId;
  const partnerName = isMePoster ? "Student Contact" : item.finderName; 
  const partnerId = isMePoster ? "other-user" : item.userId; 

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-brand-800 bg-brand-950/50 flex justify-between items-center rounded-t-2xl">
            <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-brand-800/50 p-2 rounded-lg transition"
                onClick={() => onUserClick && onUserClick(partnerId, partnerName)}
                title="View Profile & Report"
            >
                <div className="w-10 h-10 rounded-full bg-brand-800 border border-brand-600 flex items-center justify-center text-gray-300 relative">
                    <User className="w-5 h-5"/>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-900"></div>
                </div>
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {partnerName}
                        <Info className="w-3 h-3 text-gray-500" />
                    </h3>
                    <p className="text-xs text-green-400">{t.chat.online}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                {/* Confirmation Button Logic */}
                {isItemCompleted ? (
                    <button className="px-3 py-1.5 bg-green-500/10 border border-green-500/50 text-green-500 text-xs font-bold rounded-lg flex items-center gap-1 cursor-default">
                        <CheckCircle2 className="w-3 h-3" /> {t.chat.returned}
                    </button>
                ) : (
                    <button 
                        onClick={onConfirmReturn}
                        disabled={isMyTurnConfirmed}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            isMyTurnConfirmed 
                            ? 'bg-amber-500/10 border border-amber-500/50 text-amber-500' 
                            : 'bg-brand-700 hover:bg-brand-600 border border-brand-600 text-white'
                        }`}
                        title="Click when item is returned"
                    >
                        {isMyTurnConfirmed 
                            ? <><Clock className="w-3 h-3"/> {t.chat.waiting}</> 
                            : <><CheckCircle2 className="w-3 h-3"/> {t.chat.confirmReturn}</>
                        }
                    </button>
                )}

                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-brand-900 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-brand-900">
            {messages.map((msg) => {
                if (msg.isSystem) {
                    return (
                        <div key={msg.id} className="flex justify-center mb-4">
                            <div className="bg-brand-800/80 border border-brand-700 rounded-xl p-3 max-w-[85%] flex gap-3 shadow-lg">
                                <img src={item.imageUrl} alt="Item" className="w-16 h-16 rounded-lg object-cover bg-black" />
                                <div>
                                    <p className="text-xs text-brand-accent font-bold uppercase mb-1">
                                        {isLost ? t.chat.lostItemTag : t.chat.foundItemTag}
                                    </p>
                                    <p className="text-white font-medium text-sm line-clamp-1">{item.title}</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        <MapPinIcon /> {item.location} • {new Date(item.dateFound).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }

                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            isMe 
                            ? 'bg-brand-600 text-white rounded-tr-none' 
                            : 'bg-brand-800 text-gray-200 border border-brand-700 rounded-tl-none'
                        }`}>
                            {msg.imageUrl && (
                                <img src={msg.imageUrl} alt="Sent" className="rounded-lg mb-2 max-h-48 object-cover border border-white/10" />
                            )}
                            {msg.text && <p>{msg.text}</p>}
                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                );
            })}
            {isSending && (
                 <div className="flex justify-end">
                    <div className="bg-brand-600/50 text-white/50 rounded-2xl rounded-tr-none px-4 py-2 text-sm flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin"/> sending...
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-brand-950/50 border-t border-brand-800 rounded-b-2xl">
            {uploadError && (
                <div className="mb-2 bg-red-500/10 border border-red-500/50 rounded px-3 py-1.5 flex items-center gap-2 text-xs text-red-300">
                    <AlertTriangle className="w-3 h-3"/> {uploadError}
                </div>
            )}
            
            <div className="flex items-end gap-2">
                <div className="flex gap-1 mb-1">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-900 rounded-full transition disabled:opacity-50"
                        title="Send Image"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ImageIcon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={toggleVoiceInput}
                        className={`p-2 rounded-full transition ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-brand-900'}`}
                        title="Voice Input"
                    >
                        {isRecording ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex-1 bg-brand-900 border border-brand-700 rounded-2xl flex items-center px-3 py-1 focus-within:ring-1 focus-within:ring-brand-600 focus-within:border-brand-600 transition">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? t.chat.listening : t.chat.placeholder}
                        rows={1}
                        className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none py-2 text-sm max-h-24"
                        style={{ minHeight: '36px' }}
                    />
                </div>

                <button 
                    onClick={handleSendClick}
                    disabled={(!inputValue.trim() && !isUploading) || isSending}
                    className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition mb-0.5"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for the System Message
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mb-0.5 mr-0.5">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);
