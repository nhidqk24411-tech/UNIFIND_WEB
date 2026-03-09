
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ItemCard } from './components/ItemCard';
import { ReportItemModal } from './components/ReportItemModal';
import { ProfilePage } from './components/ProfilePage';
import { ContactModal } from './components/ContactModal';
import { ChatListModal } from './components/ChatListModal';
import { MatchesModal } from './components/MatchesModal';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicProfileModal } from './components/PublicProfileModal';
import { ReportModal } from './components/ReportModal';
import { HelpModal } from './components/HelpModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { CameraModal } from './components/CameraModal';
import { ItemPreviewModal } from './components/ItemPreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { MOCK_ITEMS, CATEGORIES, MOCK_GUIDANCE, USERS_DB, MOCK_CHAT_SESSIONS, MOCK_FEEDBACKS } from './constants';
import { FoundItem, ItemType, UserProfile, TabType, Notification, ItemStatus, ChatSession, Message, ItemCategory, ReportType, GuidancePost } from './types';
import { Search, Sparkles, Loader2, Filter, SortDesc, SortAsc, ChevronDown, Mic, MicOff, X, Calendar, Activity, Camera, Phone, Mail, Youtube, Music, Facebook } from 'lucide-react';
import { findMatchingItems, checkItemMatches, describeImageForSearch, findVisualMatches } from './services/geminiService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { useConfirm, ConfirmProvider } from './contexts/ConfirmContext';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type StatusFilterType = 'PROCESSING' | 'COMPLETED' | 'NOT_PROCESSED';

// Inner component to consume Context
const AppContent: React.FC = () => {
  const { t, language, showDesktopNotification } = useLanguage();
  const { alert: showAlert } = useConfirm();
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [items, setItems] = useState<FoundItem[]>(MOCK_ITEMS || []);
  const [filteredItems, setFilteredItems] = useState<FoundItem[]>(MOCK_ITEMS || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType>('FOUND');
  
  const [matchedItems, setMatchedItems] = useState<FoundItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Chat State
  const [contactItem, setContactItem] = useState<FoundItem | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_CHAT_SESSIONS || []); // Initialize with MOCK
  const [isChatListOpen, setIsChatListOpen] = useState(false);

  // Admin View State
  const [previewItem, setPreviewItem] = useState<FoundItem | null>(null); 

  // Help & Feedback Data
  const [guidanceData, setGuidanceData] = useState<GuidancePost[]>(MOCK_GUIDANCE || []);
  const [feedbackMessages, setFeedbackMessages] = useState<Message[]>(MOCK_FEEDBACKS || []); // Initialize with MOCK

  // View Management
  const [currentView, setCurrentView] = useState<'HOME' | 'ACCOUNT' | 'ADMIN'>('HOME');
  const [activeTab, setActiveTab] = useState<TabType>('LOST'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const imageSearchRef = useRef<HTMLInputElement>(null);
  const [showCameraSearch, setShowCameraSearch] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);

  // New Modals State
  const [publicProfile, setPublicProfile] = useState<{name:string, id:string, avatarUrl:string} | null>(null);
  const [reportData, setReportData] = useState<{type: ReportType, targetName?: string} | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('PROCESSING');

  // --- AUTOMATED EXPIRATION LOGIC & TUTORIAL CHECK ---
  useEffect(() => {
      const checkExpiration = () => {
          const now = new Date();
          setItems(prevItems => prevItems.map(item => {
              if (item.status !== 'PUBLISHED') return item;
              const itemDate = new Date(item.dateFound);
              const diffTime = Math.abs(now.getTime() - itemDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const titleLower = item.title.toLowerCase();
              const isShortTerm = 
                  item.category === ItemCategory.ID_CARDS || 
                  titleLower.includes('vé') || 
                  titleLower.includes('ticket') || 
                  titleLower.includes('parking') || 
                  titleLower.includes('thẻ');
              if (isShortTerm && diffDays > 7) return { ...item, status: 'EXPIRED' };
              if (diffDays > 30) return { ...item, status: 'EXPIRED' };
              return item;
          }));
      };
      checkExpiration();
  }, []);

  // --- TAB TITLE NOTIFICATION ---
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) UniFind - Tìm kiếm đồ thất lạc`;
    } else {
      document.title = 'UniFind - Tìm kiếm đồ thất lạc';
    }
  }, [unreadCount]);

  const handleLogin = (loggedInUser: UserProfile) => {
      setUser(loggedInUser);
      setIsLoggedIn(true);
      if (loggedInUser.role === 'ADMIN') {
          setCurrentView('ADMIN');
      } else {
          setCurrentView('HOME');
      }
      
      const hasSeenTutorial = localStorage.getItem(`hasSeenTutorial_${loggedInUser.role}`);
      if (!hasSeenTutorial) {
          setShowTutorial(true);
      }
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
      setCurrentView('HOME');
      // DO NOT reset ChatSessions or Feedbacks completely if you want Mocks to persist on relogin for demo
      // In a real app, you would fetch from API. 
      // setChatSessions([]); 
  };

  const handleUpdateItemStatus = (id: string, status: ItemStatus) => {
      const itemToUpdate = items.find(i => i.id === id);
      
      if (itemToUpdate && status === 'PUBLISHED' && itemToUpdate.status === 'PENDING') {
          showDesktopNotification("Bài đăng đã được duyệt", `Vật phẩm "${itemToUpdate.title}" của bạn đã được phê duyệt và hiển thị công khai.`);
          
          const newNotif: Notification = {
              id: Date.now().toString(),
              message: `Vật phẩm "${itemToUpdate.title}" của bạn đã được phê duyệt và hiển thị công khai.`,
              type: 'SYSTEM',
              timestamp: Date.now(),
              read: false
          };
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
      }

      setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      
      if (status === 'COMPLETED') {
        alert("Item marked as returned successfully.");
        showDesktopNotification("Giao dịch hoàn tất", "Cảm ơn bạn đã sử dụng UniFind!");
      }
  };

  const handleDeleteItem = (id: string) => {
      setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteUser = (userId: string) => {
      setItems(prev => prev.filter(item => item.userId !== userId));
      alert(`User ${userId} has been banned and their items removed.`);
  };

  const handleDeleteChat = (sessionId: string) => {
      setChatSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleAdminViewItem = (itemId: string) => {
      const item = items.find(i => i.id === itemId);
      if (item) {
          setPreviewItem(item);
      } else {
          alert("Item not found or deleted.");
      }
  };

  const handleAdminViewUser = (userId: string) => {
      const itemByUser = items.find(i => i.userId === userId);
      const name = itemByUser ? itemByUser.finderName : "Unknown User";
      
      setPublicProfile({
          id: userId,
          name: name,
          avatarUrl: `https://ui-avatars.com/api/?background=random&name=${name}`
      });
  };

  const handleContactItem = (item: FoundItem) => {
      if (!user) return;
      const existingSession = chatSessions.find(s => s.itemId === item.id && s.participants.includes(user.id));
      if (existingSession) {
          setActiveChatSessionId(existingSession.id);
          setContactItem(item);
      } else {
          const newSessionId = Date.now().toString();
          const newSession: ChatSession = {
              id: newSessionId,
              itemId: item.id,
              participants: [user.id, 'other-user'],
              messages: [{ id: 'sys-1', senderId: 'system', timestamp: Date.now(), isSystem: true, text: 'Chat started' }],
              lastUpdated: Date.now(),
              otherUserName: item.finderName,
              itemTitle: item.title,
              itemImage: item.imageUrl,
              returnConfirmedBy: []
          };
          setChatSessions(prev => [...prev, newSession]);
          setActiveChatSessionId(newSessionId);
          setContactItem(item);
      }
  };

  const handleSelectChatSession = (sessionId: string) => {
      const session = chatSessions.find(s => s.id === sessionId);
      if (session) {
          const item = items.find(i => i.id === session.itemId);
          const displayItem = item || {
              id: session.itemId, title: session.itemTitle, imageUrl: session.itemImage, finderName: session.otherUserName,
              type: 'FOUND', description: 'Item details unavailable', location: 'Unknown', dateFound: new Date().toISOString(),
              contactInfo: '', category: 'Other', status: 'PUBLISHED', userId: 'unknown'
          } as FoundItem;
          setContactItem(displayItem);
          setActiveChatSessionId(sessionId);
      }
  };

  const handleSendMessage = (text: string, imageUrl?: string) => {
      if (!user || !activeChatSessionId) return;
      const newMessage: Message = {
          id: Date.now().toString(), senderId: user.id, text: text, imageUrl: imageUrl, timestamp: Date.now()
      };
      setChatSessions(prev => prev.map(session => {
          if (session.id === activeChatSessionId) {
              return { ...session, messages: [...session.messages, newMessage], lastUpdated: Date.now() };
          }
          return session;
      }));
      setTimeout(() => {
          setChatSessions(prev => prev.map(session => {
              if (session.id === activeChatSessionId) {
                  const replyText = "I received your message. Thanks!";
                  showDesktopNotification(`Tin nhắn mới từ ${session.otherUserName}`, replyText);
                  return { ...session, messages: [...session.messages, { id: (Date.now() + 1).toString(), senderId: 'other-user', text: replyText, timestamp: Date.now() }], lastUpdated: Date.now() };
              }
              return session;
          }));
      }, 2000);
  };

  const handleConfirmReturn = () => {
    if (!user || !activeChatSessionId || !contactItem) return;
    setChatSessions(prev => {
        return prev.map(session => {
            if (session.id === activeChatSessionId) {
                if (session.returnConfirmedBy.includes(user.id)) return session;
                const updatedConfirmations = [...session.returnConfirmedBy, user.id];
                const isComplete = updatedConfirmations.includes(user.id) && updatedConfirmations.includes('other-user'); 
                if (isComplete) {
                   setTimeout(() => handleUpdateItemStatus(contactItem.id, 'COMPLETED'), 500);
                } else {
                   setTimeout(() => {
                        setChatSessions(curr => curr.map(s => {
                            if (s.id === activeChatSessionId) {
                                handleUpdateItemStatus(contactItem.id, 'COMPLETED');
                                return { ...s, returnConfirmedBy: [...s.returnConfirmedBy, 'other-user'] };
                            }
                            return s;
                        }));
                        const newNotif: Notification = {
                            id: Date.now().toString(), message: `Return confirmed for ${contactItem.title}.`, type: 'COMPLETED', timestamp: Date.now(), read: false
                        };
                        setNotifications(p => [newNotif, ...p]);
                        setUnreadCount(c => c + 1);
                   }, 3000);
                }
                return { ...session, returnConfirmedBy: updatedConfirmations };
            }
            return session;
        });
    });
  };

  const handleSendFeedback = (text: string) => {
      const msg: Message = { id: Date.now().toString(), senderId: 'user', text, timestamp: Date.now() };
      setFeedbackMessages(prev => [...prev, msg]);
  };

  const handleReportSubmit = (reason: string, details: string) => {
      const newNotif: Notification = { 
          id: Date.now().toString(), 
          message: `Báo cáo của bạn đã được gửi thành công và đang chờ Admin xem xét.`, 
          type: 'SYSTEM', 
          timestamp: Date.now(), 
          read: false 
      };
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      setReportData(null);
      showDesktopNotification("Báo cáo thành công", "Báo cáo của bạn đã được gửi và đang chờ Admin xem xét.");
  };

  const processImageSearch = async (base64: string) => {
      setImageSearchLoading(true);
      setAiEnabled(true);
      
      const matchIds = await findVisualMatches(base64, items);
      
      setImageSearchLoading(false);
      
      if (matchIds.length > 0) {
          const matches = items.filter(i => matchIds.includes(i.id));
          setMatchedItems(matches);
          setActiveTab('MATCHES');
          setIsMatchesModalOpen(true);
      } else {
          alert("Không tìm thấy vật phẩm nào tương tự trong hình ảnh.");
      }
  };

  const handleImageSearchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              processImageSearch(base64);
          };
          reader.readAsDataURL(file);
      }
      if (imageSearchRef.current) imageSearchRef.current.value = '';
  };

  useEffect(() => {
    if (currentView === 'ACCOUNT' || currentView === 'ADMIN' || !isLoggedIn) return;
    const filterAndSortItems = async () => {
        let results: FoundItem[] = [];
        if (activeTab === 'MATCHES') results = matchedItems;
        else results = items.filter(item => item.type === activeTab);

        if (statusFilter === 'PROCESSING') results = results.filter(item => item.status === 'PUBLISHED');
        else if (statusFilter === 'COMPLETED') results = results.filter(item => item.status === 'COMPLETED');
        else if (statusFilter === 'NOT_PROCESSED') results = results.filter(item => item.status === 'EXPIRED');

        if (searchQuery.trim() !== '') {
            if (aiEnabled) {
                setIsAiSearching(true);
                const matchIds = await findMatchingItems(searchQuery, results);
                results = results.filter(item => matchIds.includes(item.id));
                setIsAiSearching(false);
            } else {
                const lowerQuery = searchQuery.toLowerCase();
                results = results.filter(item => 
                    item.title.toLowerCase().includes(lowerQuery) ||
                    item.description.toLowerCase().includes(lowerQuery) ||
                    item.location.toLowerCase().includes(lowerQuery) ||
                    item.category.toLowerCase().includes(lowerQuery)
                );
            }
        }
        if (selectedCategory !== 'ALL') results = results.filter(item => item.category === selectedCategory);
        if (selectedDate) results = results.filter(item => item.dateFound.startsWith(selectedDate));

        results.sort((a, b) => {
            const dateA = new Date(a.dateFound).getTime();
            const dateB = new Date(b.dateFound).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
        setFilteredItems(results);
    };
    const delayDebounceFn = setTimeout(() => filterAndSortItems(), 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, items, aiEnabled, activeTab, currentView, selectedCategory, sortOrder, matchedItems, selectedDate, isLoggedIn, statusFilter]);

  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice search not supported."); return; }
    if (isListening) { recognitionRef.current?.stop(); return; }
    setSearchQuery('');
    try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => setSearchQuery(event.results[0][0].transcript);
        recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
        recognition.start();
    } catch (error) { setIsListening(false); }
  };

  const handleAddItem = async (newItemData: Omit<FoundItem, 'id' | 'userId'>) => {
    if (!user) return;
    const newItem: FoundItem = {
      ...newItemData, id: Math.random().toString(36).substr(2, 9), userId: user.id, imageUrl: newItemData.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/300`, status: 'PENDING'
    };
    setItems(prev => [newItem, ...prev]);
    await showAlert("Đăng tin thành công", "Bài viết của bạn đã được gửi và đang chờ Admin phê duyệt.");
    showDesktopNotification("Đã gửi báo cáo", `Vật phẩm "${newItem.title}" của bạn đang chờ Admin phê duyệt.`);
    if (currentView === 'HOME') setActiveTab(newItem.type as TabType);
    if (newItem.type === 'LOST') runBackgroundMatching(newItem);
  };

  const runBackgroundMatching = async (lostItem: FoundItem) => {
      const candidates = items.filter(i => i.type === 'FOUND' && i.status === 'PUBLISHED');
      const matchedIds = await checkItemMatches(lostItem, candidates);
      if (matchedIds.length > 0) {
          const matches = candidates.filter(c => matchedIds.includes(c.id));
          setMatchedItems(prev => {
              const newMatches = matches.filter(m => !prev.some(p => p.id === m.id));
              return [...newMatches, ...prev];
          });
          const newNotif: Notification = { id: Date.now().toString(), message: `We found ${matches.length} potential match(es) for your ${lostItem.title}!`, type: 'MATCH_FOUND', timestamp: Date.now(), read: false };
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          showDesktopNotification("Tìm thấy vật phẩm trùng khớp!", `Chúng tôi tìm thấy ${matches.length} vật phẩm có thể là của bạn.`);
      } 
  };

  const handleNotificationItemClick = (notification: Notification) => {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (notification.type === 'MATCH_FOUND') setActiveTab('MATCHES');
      setCurrentView('HOME');
  };

  const getActiveSessionData = () => {
      const session = chatSessions.find(s => s.id === activeChatSessionId);
      if (!session || !user) return { messages: [], isMyConfirmed: false, isOtherConfirmed: false };
      return {
          messages: session.messages,
          isMyConfirmed: session.returnConfirmedBy.includes(user.id),
          isOtherConfirmed: session.returnConfirmedBy.some(id => id !== user.id && id !== 'system')
      };
  };

  const handleUserClick = (userId: string, userName: string) => {
      setPublicProfile({
          id: userId,
          name: userName,
          avatarUrl: `https://ui-avatars.com/api/?background=random&name=${userName}`
      });
  };

  // MAIN RENDER LOGIC
  return (
    <div className="min-h-screen flex flex-col pb-12 bg-brand-900" id="root">
        {/* Settings available at root level for access before login */}
        <SettingsModal 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
        />

        {!isLoggedIn || !user ? (
             <LoginPage onLogin={handleLogin} onOpenSettings={() => setShowSettings(true)} />
        ) : (
            <>
                <Navbar 
                    onReportFoundClick={() => { setModalType('FOUND'); setIsModalOpen(true); }} 
                    onReportLostClick={() => { setModalType('LOST'); setIsModalOpen(true); }}
                    onHomeClick={() => setCurrentView('HOME')}
                    onAccountClick={() => setCurrentView('ACCOUNT')}
                    onAdminClick={() => setCurrentView('ADMIN')}
                    onLogoutClick={handleLogout}
                    onNotificationItemClick={handleNotificationItemClick}
                    onMessagesClick={() => setIsChatListOpen(true)}
                    onHelpClick={() => setShowHelp(true)}
                    onTutorialClick={() => setShowTutorial(true)}
                    onSettingsClick={() => setShowSettings(true)}
                    activeTab={currentView}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    user={user}
                />

                {showTutorial && (
                    <TutorialOverlay 
                        onComplete={() => { 
                            setShowTutorial(false); 
                            localStorage.setItem(`hasSeenTutorial_${user.role}`, 'true'); 
                        }} 
                        userRole={user.role}
                    />
                )}

                <CameraModal 
                    isOpen={showCameraSearch} 
                    onClose={() => setShowCameraSearch(false)}
                    onCapture={(base64) => processImageSearch(base64)}
                />

                {/* Admin Preview Modal */}
                <ItemPreviewModal 
                    isOpen={!!previewItem}
                    onClose={() => setPreviewItem(null)}
                    item={previewItem}
                />

                {currentView === 'ADMIN' && (
                    <AdminDashboard 
                        items={items}
                        onUpdateItemStatus={handleUpdateItemStatus}
                        onDeleteItem={handleDeleteItem}
                        onDeleteUser={handleDeleteUser}
                        onLogout={handleLogout}
                        currentUser={user}
                        userFeedbacks={feedbackMessages} 
                        onViewItem={handleAdminViewItem}
                        onViewUser={handleAdminViewUser}
                        guidanceList={guidanceData}
                        onUpdateGuidance={(post) => setGuidanceData(prev => prev.map(p => p.id === post.id ? post : p))}
                        chatSessions={chatSessions}
                        onDeleteChat={handleDeleteChat}
                        allUsers={USERS_DB} // Pass full user mock DB for stats
                    />
                )}

                {currentView === 'HOME' && (
                    <>
                    <div className="relative bg-brand-900 overflow-hidden pt-12 pb-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            {t.home.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-brand-accent">{t.home.heroLost}</span> {language === 'en' ? '&' : ''} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-blue-400">{t.home.heroFound}</span>
                        </h1>
                        
                        <div className="flex justify-center mb-8">
                            <div id="filter-bar" className="bg-slate-950 p-1 rounded-xl border border-brand-800 flex relative gap-1 overflow-x-auto max-w-full no-scrollbar">
                                <button onClick={() => setActiveTab('LOST')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'LOST' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.home.lostTab}</button>
                                <button onClick={() => setActiveTab('MATCHES')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'MATCHES' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                    <Sparkles className="w-4 h-4" /> {t.home.matchesTab} {matchedItems.length > 0 && <span className="bg-white/20 text-white text-xs px-1.5 rounded-full">{matchedItems.length}</span>}
                                </button>
                                <button onClick={() => setActiveTab('FOUND')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'FOUND' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t.home.foundTab}</button>
                            </div>
                        </div>

                        <div id="search-bar" className="max-w-2xl mx-auto relative group z-20">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-brand-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex flex-wrap items-center bg-brand-800 rounded-xl p-2 border border-brand-700 shadow-2xl">
                            <input type="file" ref={imageSearchRef} className="hidden" accept="image/*" onChange={handleImageSearchSelect} />

                            <Search className={`ml-3 w-5 h-5 md:w-6 md:h-6 ${isAiSearching ? 'text-brand-accent animate-pulse' : 'text-gray-400'}`} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={isListening ? t.home.listening : (aiEnabled ? "Describe or use camera..." : t.home.searchPlaceholder)}
                                className="flex-1 min-w-[150px] bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 px-3 py-2 text-base md:text-lg"
                            />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-brand-700 transition mr-1"><X className="w-4 h-4" /></button>}
                            
                            <div className="flex items-center gap-1 mt-2 sm:mt-0 ml-auto sm:ml-0 w-full sm:w-auto justify-end">
                                {/* Camera Search Button */}
                                <button onClick={() => setShowCameraSearch(true)} disabled={imageSearchLoading} className={`p-2 rounded-lg transition-colors ${imageSearchLoading ? 'text-brand-accent animate-pulse' : 'text-gray-400 hover:text-white hover:bg-brand-700'}`} title="Use Camera">
                                    <Camera className="w-5 h-5" />
                                </button>

                                <button onClick={() => imageSearchRef.current?.click()} disabled={imageSearchLoading} className={`p-2 rounded-lg transition-colors ${imageSearchLoading ? 'text-brand-accent animate-pulse' : 'text-gray-400 hover:text-white hover:bg-brand-700'}`} title="Upload Image">
                                    <Loader2 className={`w-5 h-5 ${imageSearchLoading ? 'animate-spin' : 'hidden'}`} />
                                    {!imageSearchLoading && <span className="font-bold text-xs">IMG</span>}
                                </button>

                                <button onClick={toggleVoiceSearch} className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-brand-700'}`}>
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <button onClick={() => setAiEnabled(!aiEnabled)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ml-1 ${aiEnabled ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/50' : 'bg-brand-900 text-gray-400 border border-brand-700 hover:text-white'}`}>
                                    {isAiSearching ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{t.home.aiSearch}</span>
                                    <span className="sm:hidden text-xs">AI</span>
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                            {activeTab === 'MATCHES' ? t.home.matchesTab : (searchQuery ? t.home.results : (activeTab === 'LOST' ? t.home.peopleLooking : t.home.itemsWaiting))}
                            <span className="bg-brand-800 text-brand-accent text-xs px-2 py-1 rounded-full border border-brand-700">{filteredItems.length}</span>
                        </h2>

                        <div id="advanced-filters" className="flex flex-wrap items-center gap-3">
                            <div className="relative flex-1 sm:flex-none">
                                <Activity className="absolute left-3 top-2.5 h-4 w-4 text-brand-500" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)} className="w-full sm:w-auto pl-9 pr-8 py-2 bg-brand-800 border border-brand-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:text-white">
                                    <option value="PROCESSING">Processing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="NOT_PROCESSED">Not Processed</option>
                                </select>
                            </div>
                            <div className="relative flex-1 sm:flex-none">
                                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-brand-500" />
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full sm:w-auto pl-9 pr-8 py-2 bg-brand-800 border border-brand-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:text-white">
                                    <option value="ALL">All Categories</option>
                                    {(CATEGORIES || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="relative flex-1 sm:flex-none">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-brand-500" />
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full sm:w-auto pl-9 pr-3 py-2 bg-brand-800 border border-brand-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:text-white" />
                            </div>
                            <button onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} className="flex items-center gap-2 px-3 py-2 bg-brand-800 border border-brand-700 rounded-lg text-sm text-gray-300">
                                {sortOrder === 'newest' ? <SortDesc className="w-4 h-4 text-brand-500" /> : <SortAsc className="w-4 h-4 text-brand-500" />}
                            </button>
                        </div>
                        </div>

                        {filteredItems.length === 0 ? (
                        <div className="bg-brand-800/50 border border-brand-700 rounded-2xl p-12 text-center">
                            <h3 className="text-xl font-semibold text-white mb-2">{t.home.noItems}</h3>
                            <p className="text-gray-400">{t.home.tryAdjust}</p>
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(filteredItems || []).map(item => (
                            <ItemCard 
                                key={item.id} 
                                item={item} 
                                onContact={handleContactItem}
                                onReport={(item) => setReportData({type: 'ITEM', targetName: item.title})}
                                onUserClick={handleUserClick} 
                                userRole={user.role} 
                            />
                            ))}
                        </div>
                        )}
                    </main>
                    </>
                )}

                {currentView === 'ACCOUNT' && (
                    <ProfilePage 
                        user={user} 
                        userItems={items.filter(item => item.userId === user.id)}
                        onUpdateUser={(u) => setUser(u)}
                        onContact={handleContactItem}
                        onUpdateStatus={handleUpdateItemStatus}
                    />
                )}

                <ReportItemModal 
                    isOpen={isModalOpen} 
                    initialType={modalType}
                    onClose={() => setIsModalOpen(false)} 
                    onSubmit={handleAddItem}
                />

                <ContactModal 
                    isOpen={!!contactItem} 
                    onClose={() => setContactItem(null)} 
                    item={contactItem} 
                    currentUser={user}
                    messages={getActiveSessionData().messages}
                    onSendMessage={handleSendMessage}
                    onConfirmReturn={handleConfirmReturn}
                    isMyTurnConfirmed={getActiveSessionData().isMyConfirmed}
                    isOtherTurnConfirmed={getActiveSessionData().isOtherConfirmed}
                    isItemCompleted={contactItem?.status === 'COMPLETED'}
                    onUserClick={handleUserClick}
                />
                
                <MatchesModal isOpen={isMatchesModalOpen} onClose={() => setIsMatchesModalOpen(false)} matches={matchedItems} onContact={handleContactItem} />
                <ChatListModal isOpen={isChatListOpen} onClose={() => setIsChatListOpen(false)} sessions={chatSessions} onSelectSession={handleSelectChatSession} currentUserId={user.id} />
                
                <PublicProfileModal 
                    isOpen={!!publicProfile} 
                    onClose={() => setPublicProfile(null)} 
                    user={publicProfile || {name:'', id:'', avatarUrl:''}} 
                    userItems={items.filter(item => item.userId === (publicProfile?.id || ''))}
                    onContact={handleContactItem}
                    onReportUser={() => { setReportData({type: 'USER', targetName: publicProfile?.name}); setPublicProfile(null); }}
                    currentUserRole={user.role}
                />
                
                <ReportModal 
                    isOpen={!!reportData} 
                    onClose={() => setReportData(null)} 
                    type={reportData?.type || 'ITEM'}
                    targetName={reportData?.targetName}
                    onSubmit={handleReportSubmit}
                />

                <HelpModal 
                    isOpen={showHelp}
                    onClose={() => setShowHelp(false)}
                    guidance={guidanceData}
                    userRole={user.role}
                    onUpdateGuidance={(newPost) => setGuidanceData(prev => prev.map(p => p.id === newPost.id ? newPost : p))}
                    feedbackMessages={feedbackMessages}
                    onSendFeedback={handleSendFeedback}
                    onRestartTutorial={() => { setShowHelp(false); setShowTutorial(true); }}
                />

                {/* Footer */}
                <footer className="bg-[#2d2d2d] text-[#D1D5DB] py-12 mt-auto border-t-8 border-[#1a1a1a]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      {/* Col 1 */}
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-4 leading-tight font-sans tracking-tight">UEL Lost<br/>& Found</h3>
                        <p className="text-sm text-[#9CA3AF] leading-relaxed">
                          UEL Lost & Found - Hệ thống tìm kiếm đồ thất lạc của Trường Đại học Kinh tế - Luật.
                        </p>
                      </div>
                      {/* Col 2 */}
                      <div>
                        <h3 className="text-xl font-medium text-[#F05A22] mb-4">Info</h3>
                        <ul className="space-y-3 text-sm text-[#D1D5DB]">
                          <li><a href="https://www.uel.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F05A22] underline decoration-gray-500 underline-offset-4 transition-colors">UEL Homepage</a></li>
                          <li><a href="https://myuel.uel.edu.vn/default.aspx?pageid=4df58a9e-3011-4470-b1f9-e9f26ccba725&ModuleID=e9bed1ce-cb07-44ed-a585-d2754b43c422" target="_blank" rel="noopener noreferrer" className="hover:text-[#F05A22] underline decoration-gray-500 underline-offset-4 transition-colors">UEL MyUEL</a></li>
                          <li><a href="https://lib.uel.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F05A22] underline decoration-gray-500 underline-offset-4 transition-colors">UEL Lib</a></li>
                        </ul>
                      </div>
                      {/* Col 3 */}
                      <div>
                        <h3 className="text-xl font-medium text-[#F05A22] mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-[#D1D5DB]">
                          <li className="leading-relaxed">669 Đỗ Mười, khu phố 13, phường Linh Xuân, TP.HCM</li>
                          <li className="flex items-center gap-2"><Phone className="w-4 h-4"/> Phone : 028 37244539</li>
                          <li className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email : <a href="https://mail.google.com/mail/?view=cm&fs=1&to=cntt@uel.edu.vn" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">cntt@uel.edu.vn</a></li>
                        </ul>
                      </div>
                      {/* Col 4 */}
                      <div>
                        <h3 className="text-xl font-medium text-[#F05A22] mb-4">Follow Us</h3>
                        <div className="flex gap-3">
                          <a href="https://www.youtube.com/@uelchannel" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#cc181e] flex items-center justify-center rounded text-white hover:opacity-80 transition">
                            <Youtube className="w-5 h-5" />
                          </a>
                          <a href="https://www.tiktok.com/@uel.official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black flex items-center justify-center rounded text-white hover:opacity-80 transition">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.89-2.89h.56V9.06h-.56a6.33 6.33 0 1 0 6.33 6.33V8.58a7.21 7.21 0 0 0 4.21 1.38V6.69z" />
                            </svg>
                          </a>
                          <a href="https://www.facebook.com/groups/uel.hcm" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1877f2] flex items-center justify-center rounded text-white hover:opacity-80 transition">
                            <Facebook className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </footer>
            </>
        )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </LanguageProvider>
  );
};

export default App;
