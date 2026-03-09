
import React, { useState, useEffect } from 'react';
import { FoundItem, UserProfile, ItemStatus, Message, Report, GuidancePost, ChatSession } from '../types';
import { MOCK_REPORTS } from '../constants';

// Sub-components
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminVerifyTab } from './admin/AdminVerifyTab';
import { AdminItemsTab } from './admin/AdminItemsTab';
import { AdminReportsFeedbackTab } from './admin/AdminReportsFeedbackTab';
import { AdminGuidanceTab } from './admin/AdminGuidanceTab';
import { AdminChatsTab } from './admin/AdminChatsTab';
import { AdminOverviewTab } from './admin/AdminOverviewTab';

interface AdminDashboardProps {
  items: FoundItem[];
  onUpdateItemStatus: (id: string, status: ItemStatus) => void;
  onDeleteItem: (id: string) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
  currentUser: UserProfile;
  userFeedbacks: Message[]; 
  onViewItem: (itemId: string) => void;
  onViewUser: (userId: string) => void;
  // Guidance Props
  guidanceList: GuidancePost[];
  onUpdateGuidance: (post: GuidancePost) => void;
  // Chat Monitoring Props
  chatSessions: ChatSession[];
  onDeleteChat: (sessionId: string) => void;
  // Users Data for Overview
  allUsers: UserProfile[]; 
}

import { useConfirm } from '../contexts/ConfirmContext';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    items, onUpdateItemStatus, onDeleteItem, onDeleteUser, onLogout, currentUser, userFeedbacks,
    onViewItem, onViewUser, guidanceList, onUpdateGuidance, chatSessions, onDeleteChat, allUsers
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const { confirm } = useConfirm();
  
  // State for Reports (Initialized from Mock)
  const [localReports, setLocalReports] = useState<Report[]>(MOCK_REPORTS);
  // State for Feedbacks (Combined props + local actions)
  const [localFeedbacks, setLocalFeedbacks] = useState<Message[]>([]);

  useEffect(() => {
     setLocalFeedbacks(userFeedbacks);
  }, [userFeedbacks]);

  // --- Handlers ---
  const handleReportAction = (id: string, action: 'RESOLVED' | 'DISMISSED') => {
      setLocalReports(prev => prev.map(r => r.id === id ? {...r, status: action} : r));
  };

  const handleDeleteReportTarget = (type: 'ITEM' | 'USER', id: string) => {
      if (type === 'ITEM') {
          onDeleteItem(id);
      } else {
          onDeleteUser(id);
      }
  };

  const handleDeleteFeedback = async (id: string) => {
      if(await confirm("Xác nhận", "Xóa tin nhắn phản hồi này?")) {
        setLocalFeedbacks(prev => prev.filter(f => f.id !== id));
      }
  };

  // Filter items specifically for the Verify tab (PENDING only)
  const pendingItems = items.filter(item => item.status === 'PENDING');

  const renderContent = () => {
      switch(activeTab) {
          case 'OVERVIEW':
              return (
                  <AdminOverviewTab 
                      items={items}
                      reports={localReports}
                      feedbacks={localFeedbacks}
                      users={allUsers}
                  />
              );

          case 'VERIFY':
               return <AdminVerifyTab pendingItems={pendingItems} onUpdateItemStatus={onUpdateItemStatus} />;
          
          case 'ITEMS':
               return (
                    <AdminItemsTab 
                        items={items} 
                        onUpdateItemStatus={onUpdateItemStatus} 
                        onDeleteItem={onDeleteItem} 
                    />
               );

          case 'REPORTS_FEEDBACK':
               return (
                   <AdminReportsFeedbackTab 
                       reports={localReports}
                       feedbacks={localFeedbacks}
                       onUpdateReportStatus={handleReportAction}
                       onDeleteTarget={handleDeleteReportTarget}
                       onDeleteFeedback={handleDeleteFeedback}
                       onViewItem={onViewItem}
                       onViewUser={onViewUser}
                   />
               );
          
          case 'GUIDANCE':
               return (
                   <AdminGuidanceTab 
                       guidanceList={guidanceList}
                       onUpdateGuidance={onUpdateGuidance}
                   />
               );
          
          case 'CHATS':
                return (
                    <AdminChatsTab 
                        sessions={chatSessions}
                        onDeleteChat={onDeleteChat}
                    />
                );

          default: return <div className="text-white p-8">Select a tab from the sidebar.</div>;
      }
  };

  return (
    <div className="min-h-screen bg-brand-950 flex font-sans">
        <AdminSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            currentUser={currentUser} 
            onLogout={onLogout}
            feedbackCount={localFeedbacks.length}
            pendingCount={pendingItems.length}
        />

        <div className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
             {/* Mobile Header */}
             <div className="lg:hidden mb-6 flex justify-between items-center bg-brand-900 p-4 rounded-xl border border-brand-800">
                <span className="font-bold text-white text-xl">Admin Panel</span>
                <button onClick={onLogout} className="text-red-400 text-sm font-bold">Logout</button>
            </div>
            
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden mb-6 flex bg-brand-900 p-1 rounded-lg border border-brand-800 overflow-x-auto gap-1">
                <button 
                    id="mobile-nav-admin-overview" 
                    onClick={() => setActiveTab('OVERVIEW')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'OVERVIEW' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Overview
                </button>
                <button 
                    id="mobile-nav-admin-verify" 
                    onClick={() => setActiveTab('VERIFY')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'VERIFY' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Phê duyệt ({pendingItems.length})
                </button>
                <button 
                    id="mobile-nav-admin-items" 
                    onClick={() => setActiveTab('ITEMS')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'ITEMS' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Quản lý
                </button>
                <button 
                    id="mobile-nav-admin-chats" 
                    onClick={() => setActiveTab('CHATS')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'CHATS' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Chat
                </button>
                <button 
                    id="mobile-nav-admin-reports" 
                    onClick={() => setActiveTab('REPORTS_FEEDBACK')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'REPORTS_FEEDBACK' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Báo cáo
                </button>
                 <button 
                    id="mobile-nav-admin-guidance" 
                    onClick={() => setActiveTab('GUIDANCE')} 
                    className={`flex-1 py-2 px-2 text-xs font-bold whitespace-nowrap rounded transition ${activeTab === 'GUIDANCE' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}
                >
                    Content
                </button>
            </div>
            
            {renderContent()}
        </div>
    </div>
  );
};
