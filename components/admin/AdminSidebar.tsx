
import React from 'react';
import { UserProfile } from '../../types';
import { CheckCircle, Database, LogOut, ShieldAlert, BookOpen, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type AdminTab = 'OVERVIEW' | 'VERIFY' | 'ITEMS' | 'REPORTS_FEEDBACK' | 'GUIDANCE' | 'CHATS';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  feedbackCount: number;
  pendingCount: number; // New Prop for Pending Items
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
    activeTab, setActiveTab, currentUser, onLogout, feedbackCount, pendingCount 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="w-64 bg-brand-900 border-r border-brand-800 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-brand-800">
            <span className="font-bold text-white text-xl">UEL Admin</span>
            <p className="text-xs text-gray-500 mt-1">Logged as {currentUser.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button 
                id="nav-admin-overview"
                onClick={() => setActiveTab('OVERVIEW')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'OVERVIEW' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <LayoutDashboard className="w-5 h-5" /> {t.admin.sidebar.overview}
            </button>

            <div className="mt-4 mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t.admin.sidebar.mainFunc}
            </div>
            
            {/* Verify Tab with Pending Count Badge */}
            <button 
                id="nav-admin-verify"
                onClick={() => setActiveTab('VERIFY')} 
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'VERIFY' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" /> {t.admin.sidebar.verify}
                </div>
                {pendingCount > 0 && (
                    <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{pendingCount}</span>
                )}
            </button>

            <button 
                id="nav-admin-items"
                onClick={() => setActiveTab('ITEMS')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'ITEMS' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <Database className="w-5 h-5" /> {t.admin.sidebar.items}
            </button>
            
            <div className="mt-6 mb-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t.admin.sidebar.system}
            </div>
            <button 
                id="nav-admin-chats"
                onClick={() => setActiveTab('CHATS')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'CHATS' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <MessageSquare className="w-5 h-5" /> {t.admin.chats}
            </button>
            <button 
                id="nav-admin-reports"
                onClick={() => setActiveTab('REPORTS_FEEDBACK')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'REPORTS_FEEDBACK' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5" /> {t.admin.sidebar.reports}
                    </div>
                    {feedbackCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{feedbackCount}</span>
                    )}
                </div>
            </button>
            <button 
                id="nav-admin-guidance"
                onClick={() => setActiveTab('GUIDANCE')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'GUIDANCE' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-brand-800 hover:text-gray-200'}`}
            >
                <BookOpen className="w-5 h-5" /> {t.admin.sidebar.guidance}
            </button>
        </nav>
        <div className="p-4 border-t border-brand-800">
            <button onClick={onLogout} className="text-red-400 w-full text-center hover:bg-red-500/10 py-2 rounded transition flex items-center justify-center gap-2 font-medium">
                <LogOut className="w-4 h-4"/> {t.nav.logout}
            </button>
        </div>
    </div>
  );
};
