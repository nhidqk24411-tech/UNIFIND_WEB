
import React, { useState } from 'react';
import { X, User as UserIcon, Flag, Shield, Eye, ArrowLeft } from 'lucide-react';
import { UserProfile, Role, FoundItem } from '../types';
import { ProfilePage } from './ProfilePage';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; id: string; avatarUrl: string }; // Simplified user
  userItems: FoundItem[]; // Items belonging to this user
  onReportUser: (userId: string) => void;
  currentUserRole?: Role;
  onContact?: (item: FoundItem) => void; // Passed down to ProfilePage
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ 
    isOpen, onClose, user, userItems, onReportUser, currentUserRole, onContact 
}) => {
  const [showFullProfile, setShowFullProfile] = useState(false);

  if (!isOpen) return null;

  // Construct a full user object for the ProfilePage
  const fullUserObject: UserProfile = {
      id: user.id,
      name: user.name,
      email: 'hidden@st.uel.edu.vn', // Hide email for privacy
      phone: '**********', // Hide phone for privacy
      studentId: 'K******', // Hide ID
      avatarUrl: user.avatarUrl,
      joinedDate: new Date().toISOString(), // Mock if not available
      role: 'USER',
      isVerified: true
  };

  // --- FULL PROFILE VIEW ---
  if (showFullProfile) {
      return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative bg-brand-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-brand-800 bg-brand-950">
                    <button 
                        onClick={() => setShowFullProfile(false)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-brand-800"
                    >
                        <ArrowLeft className="w-5 h-5"/> Back to Summary
                    </button>
                    <span className="font-bold text-white text-lg">Viewing {user.name}'s Profile</span>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-brand-800">
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-brand-900">
                     <ProfilePage 
                        user={fullUserObject} 
                        userItems={userItems}
                        onContact={onContact || (() => {})} // Pass dummy if not provided
                        readOnly={true} // IMPORTANT: Enable Read Only Mode
                     />
                </div>
            </div>
        </div>
      );
  }

  // --- SUMMARY CARD VIEW (Default) ---
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col animate-fade-in overflow-hidden">
        
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-brand-700 to-brand-500 relative">
             <button onClick={onClose} className="absolute top-2 right-2 p-2 text-white/80 hover:text-white bg-black/20 rounded-full">
                 <X className="w-5 h-5"/>
             </button>
        </div>
        
        <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full border-4 border-brand-900 bg-brand-800 overflow-hidden mb-3">
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover"/>
             </div>
             
             <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
             <span className="px-2 py-0.5 bg-brand-800 text-brand-400 text-xs rounded border border-brand-700">Student</span>
             
             <div className="w-full mt-6 space-y-3">
                 <div className="flex items-center gap-3 p-3 bg-brand-950/50 rounded-lg border border-brand-800">
                     <Shield className="w-5 h-5 text-green-500"/>
                     <div className="text-sm">
                         <p className="text-white font-medium">Verified Student</p>
                         <p className="text-gray-500 text-xs">Email confirmed via School ID</p>
                     </div>
                 </div>

                 {/* VIEW FULL PROFILE BUTTON */}
                 <button 
                    onClick={() => setShowFullProfile(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition text-sm font-bold shadow-lg"
                 >
                     <Eye className="w-4 h-4"/> Xem chi tiết hồ sơ
                 </button>
                 
                 {/* Only show Report button if the viewer is NOT an Admin */}
                 {currentUserRole !== 'ADMIN' && (
                     <button 
                        onClick={() => onReportUser(user.id)}
                        className="w-full flex items-center justify-center gap-2 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm font-medium border border-transparent hover:border-red-500/30"
                     >
                         <Flag className="w-4 h-4"/> Report User
                     </button>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};
