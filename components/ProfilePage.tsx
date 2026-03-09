
import React, { useState } from 'react';
import { UserProfile, FoundItem, ItemStatus } from '../types';
import { ItemCard } from './ItemCard';
import { User, Mail, Phone, Calendar, Edit2, Save, X, BookUser, Lock, Key, Check, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfilePageProps {
  user: UserProfile;
  userItems: FoundItem[];
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onContact: (item: FoundItem) => void;
  onUpdateStatus?: (itemId: string, status: ItemStatus) => void;
  readOnly?: boolean; // New prop
}

type ItemStatusFilter = 'ALL' | 'PROCESSING' | 'COMPLETED' | 'NOT_PROCESSED';

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, userItems, onUpdateUser, onContact, onUpdateStatus, readOnly = false 
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState(user);

  // Status Filters
  const [lostFilter, setLostFilter] = useState<ItemStatusFilter>('ALL');
  const [foundFilter, setFoundFilter] = useState<ItemStatusFilter>('ALL');

  // Password Change State
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // --- Filtering Logic ---
  const checkStatus = (item: FoundItem, filter: ItemStatusFilter) => {
      if (filter === 'ALL') return true;
      if (filter === 'PROCESSING') return item.status === 'PUBLISHED' || item.status === 'PENDING';
      if (filter === 'COMPLETED') return item.status === 'COMPLETED';
      if (filter === 'NOT_PROCESSED') return item.status === 'EXPIRED';
      return false;
  };

  const myLostItems = userItems.filter(item => item.type === 'LOST' && checkStatus(item, lostFilter));
  const myFoundItems = userItems.filter(item => item.type === 'FOUND' && checkStatus(item, foundFilter));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (onUpdateUser) onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setPassError('');
      setPassLoading(true);

      setTimeout(() => {
          if (passData.current !== user.studentId) {
              setPassError("Incorrect current password.");
              setPassLoading(false);
              return;
          }
          if (passData.new !== passData.confirm) {
              setPassError("New passwords do not match.");
              setPassLoading(false);
              return;
          }
          if (passData.new.length < 6) {
              setPassError("Password must be at least 6 characters.");
              setPassLoading(false);
              return;
          }
          setPassLoading(false);
          setIsChangingPassword(false);
          setPassData({ current: '', new: '', confirm: '' });
          alert(`Password Change Requested successfully!`);
      }, 1500);
  };

  const renderFilterTabs = (current: ItemStatusFilter, setFilter: (s: ItemStatusFilter) => void) => (
      <div className="flex flex-wrap gap-2 mb-4">
          {(['ALL', 'PROCESSING', 'COMPLETED', 'NOT_PROCESSED'] as ItemStatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    current === status 
                    ? 'bg-brand-600 border-brand-500 text-white' 
                    : 'bg-brand-900 border-brand-800 text-gray-400 hover:text-white'
                }`}
              >
                  {status === 'ALL' && 'All'}
                  {status === 'PROCESSING' && t.common.processing}
                  {status === 'COMPLETED' && t.common.completed}
                  {status === 'NOT_PROCESSED' && t.common.notProcessed}
              </button>
          ))}
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 w-full">
      
      {/* Change Password Modal - Only if NOT readOnly */}
      {!readOnly && isChangingPassword && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsChangingPassword(false)} />
              <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-brand-800 bg-brand-950/50">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Lock className="w-5 h-5 text-brand-500"/> {t.profile.changePassword}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Update your account security</p>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                      {passError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                              {passError}
                          </div>
                      )}
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                          <input 
                              type="password"
                              required
                              value={passData.new}
                              onChange={e => setPassData({...passData, new: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-black focus:ring-2 focus:ring-brand-600 outline-none"
                              placeholder="Min 6 characters"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                           <input 
                              type="password"
                              required
                              value={passData.confirm}
                              onChange={e => setPassData({...passData, confirm: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-black focus:ring-2 focus:ring-brand-600 outline-none"
                          />
                      </div>
                      <div className="pt-2 flex gap-3">
                          <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2.5 bg-brand-800 text-gray-300 rounded-xl">{t.common.cancel}</button>
                          <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl">Update</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden mb-8 shadow-xl">
        <div className="h-32 bg-gradient-to-r from-brand-700 to-brand-600 relative">
            <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-brand-800 bg-brand-900 overflow-hidden">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
        
        <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    {isEditing ? (
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-brand-900 border border-brand-600 rounded px-3 py-1 text-2xl font-bold text-white mb-1 w-full max-w-md focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                    )}
                    <p className="text-brand-accent font-medium">Student • ID: {user.studentId}</p>
                </div>
                
                {/* Only show Edit/Password buttons if NOT readOnly */}
                {!readOnly && (
                    <div className="flex flex-wrap gap-2">
                        {!isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-gray-300 rounded-lg transition text-sm font-medium border border-brand-700"
                                >
                                    <Key className="w-4 h-4" /> {t.profile.changePassword}
                                </button>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition text-sm font-medium border border-brand-600"
                                >
                                    <Edit2 className="w-4 h-4" /> {t.profile.editProfile}
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-white rounded-lg transition text-sm font-medium border border-brand-700"
                                >
                                    <X className="w-4 h-4" /> {t.common.cancel}
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition text-sm font-medium shadow-lg shadow-brand-600/20"
                                >
                                    <Save className="w-4 h-4" /> {t.common.save}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.email}</p>
                        <p className="text-sm font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.phone}</p>
                        <p className="text-sm font-medium">{user.phone}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.joined}</p>
                        <p className="text-sm font-medium">{new Date(user.joinedDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* User Items */}
      <div className="space-y-8">
        
        {/* Lost Items */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-amber-500 rounded-full inline-block"></span>
                {readOnly ? `${user.name}'s Lost Items` : t.profile.myLost}
                <span className="text-gray-500 text-sm font-normal">({userItems.filter(i => i.type === 'LOST').length} {t.profile.total})</span>
            </h2>
            
            {renderFilterTabs(lostFilter, setLostFilter)}

            {myLostItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myLostItems.map(item => (
                        <div key={item.id} className="relative group">
                            <ItemCard item={item} onContact={onContact} userRole={readOnly ? 'USER' : undefined} />
                            {/* Action Overlay - Only if NOT readOnly */}
                            {!readOnly && onUpdateStatus && item.status === 'PUBLISHED' && (
                                <div className="absolute top-48 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'COMPLETED'); }}
                                        className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4"/> {t.item.markFound}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-brand-800/30 border border-dashed border-brand-700 rounded-xl p-8 text-center text-gray-500">
                    <p>{t.profile.noLost}</p>
                </div>
            )}
        </div>

        {/* Found Items */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-brand-500 rounded-full inline-block"></span>
                {readOnly ? `Items ${user.name} Found` : t.profile.myFound}
                <span className="text-gray-500 text-sm font-normal">({userItems.filter(i => i.type === 'FOUND').length} {t.profile.total})</span>
            </h2>
            
            {renderFilterTabs(foundFilter, setFoundFilter)}

            {myFoundItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myFoundItems.map(item => (
                        <div key={item.id} className="relative group">
                             <ItemCard item={item} onContact={onContact} userRole={readOnly ? 'USER' : undefined} />
                             {/* Action Overlay - Only if NOT readOnly */}
                            {!readOnly && onUpdateStatus && item.status === 'PUBLISHED' && (
                                <div className="absolute top-48 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'COMPLETED'); }}
                                        className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4"/> {t.item.markReturned}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-brand-800/30 border border-dashed border-brand-700 rounded-xl p-8 text-center text-gray-500">
                    <p>{t.profile.noFound}</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
