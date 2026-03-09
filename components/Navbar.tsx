
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Bell, HelpCircle, User, LogOut, MessageCircle, LayoutDashboard, Settings, Phone, Mail, ChevronDown } from 'lucide-react';
import { Notification, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  onReportFoundClick: () => void;
  onReportLostClick: () => void;
  onHomeClick: () => void;
  onAccountClick: () => void;
  onAdminClick: () => void; 
  onLogoutClick: () => void; 
  onNotificationItemClick: (notification: Notification) => void;
  onMessagesClick: () => void;
  onHelpClick: () => void; 
  onTutorialClick: () => void;
  onSettingsClick: () => void;
  activeTab: string;
  notifications: Notification[];
  unreadCount: number;
  user: UserProfile; 
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onReportFoundClick, 
  onReportLostClick, 
  onHomeClick, 
  onAccountClick,
  onAdminClick,
  onLogoutClick,
  onNotificationItemClick,
  onMessagesClick,
  onHelpClick,
  onTutorialClick,
  onSettingsClick,
  activeTab,
  notifications,
  unreadCount,
  user
}) => {
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserClick = () => {
      setShowUserMenu(!showUserMenu);
      setShowNotifications(false);
  };

  const handleLogoClick = () => {
      if (isAdmin) {
          onAdminClick();
      } else {
          onHomeClick();
      }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#144E8C] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section: Logo & Contact Info */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/88/Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_kinh_t%E1%BA%BF_-_Lu%E1%BA%ADt_%28UEL%29%2C_%C4%90HQG-HCM%2C_220px.png?_=20231026090505" 
                    alt="UEL Logo" 
                    className="h-14 w-auto object-contain"
                    referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Call us : 028 37244539</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>E-mail : cntt@uel.edu.vn</span>
              </div>
            </div>
          </div>
          
          {/* Right Section: Buttons & Icons */}
          <div className="flex items-center gap-4">
            {/* Report Buttons */}
            {!isAdmin && (
              <div className="flex items-center gap-3">
                  <button 
                    onClick={onReportLostClick}
                    className="bg-[#F05A22] hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tôi bị mất đồ</span>
                  </button>

                  <button 
                    onClick={onReportFoundClick}
                    className="bg-[#6C8EBF] hover:opacity-90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-sm border border-blue-300"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Tôi nhặt được</span>
                  </button>
              </div>
            )}

            {/* Icons */}
            <div className="flex items-center gap-4 ml-2">
              {/* Tutorial Button */}
              <button onClick={onTutorialClick} className="text-white/80 hover:text-white transition" title="Hướng dẫn sử dụng">
                  <HelpCircle className="w-5 h-5" />
              </button>

              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                  <button onClick={handleBellClick} className="text-white/80 hover:text-white transition relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-red-600 font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[60] text-gray-800">
                          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                              <h3 className="font-semibold text-sm">{t.nav.notifications}</h3>
                              {unreadCount > 0 && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                          </div>
                          <div className="max-h-80 overflow-y-auto custom-scrollbar">
                              {notifications.length === 0 ? (
                                  <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                      <Bell className="w-8 h-8 mb-2 opacity-20" />
                                      {t.nav.emptyNotif}
                                  </div>
                              ) : (
                                  notifications.map(notif => (
                                      <div 
                                          key={notif.id}
                                          onClick={() => {
                                              onNotificationItemClick(notif);
                                              setShowNotifications(false);
                                          }}
                                          className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition flex gap-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                      >
                                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.type === 'MATCH_FOUND' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                          <div>
                                              <p className={`text-sm ${!notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                  {notif.message}
                                              </p>
                                              <p className="text-xs text-gray-400 mt-1">
                                                  {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                              </p>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  )}
              </div>

              {!isAdmin && (
                <button onClick={onMessagesClick} className="text-white/80 hover:text-white transition" title={t.nav.messages}>
                    <MessageCircle className="h-5 w-5" />
                </button>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                  <button onClick={handleUserClick} className="flex items-center gap-1 text-white/90 hover:text-white transition">
                      <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center text-white font-bold border border-white/20">
                          {user.name.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[60] text-gray-800">
                          <div className="p-4 border-b border-gray-100 bg-gray-50">
                              <p className="font-bold truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              {isAdmin && <span className="mt-1 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">Administrator</span>}
                          </div>
                          <div className="py-1">
                              {!isAdmin && (
                                  <button onClick={() => {onAccountClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                      <User className="w-4 h-4"/> {t.nav.profile}
                                  </button>
                              )}
                              <button onClick={() => {onSettingsClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                  <Settings className="w-4 h-4"/> {t.nav.settings}
                              </button>
                              <button onClick={() => {onLogoutClick(); setShowUserMenu(false);}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <LogOut className="w-4 h-4"/> {t.nav.logout}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
