
import React from 'react';
import { MapPin, Calendar, Tag, User, MessageCircle, CheckCircle2, Clock, XCircle, Flag } from 'lucide-react';
import { FoundItem, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ItemCardProps {
  item: FoundItem;
  onContact: (item: FoundItem) => void;
  onReport?: (item: FoundItem) => void;
  onUserClick?: (userId: string, userName: string) => void;
  userRole?: Role;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onContact, onReport, onUserClick, userRole = 'USER' }) => {
  const { t } = useLanguage();
  const dateStr = new Date(item.dateFound).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const isLost = item.type === 'LOST';
  const accentColor = isLost ? 'text-amber-500' : 'text-brand-accent';
  const badgeColor = isLost ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-brand-900/90 border-brand-700 text-brand-accent';
  const btnColor = isLost ? 'bg-amber-600 hover:bg-amber-500 border-amber-600' : 'bg-brand-700 hover:bg-brand-600 border-brand-600';

  return (
    <div className="group bg-brand-800 rounded-xl overflow-hidden border border-brand-700 hover:border-brand-500 transition-all duration-300 hover:shadow-xl hover:shadow-brand-900/50 flex flex-col h-full relative">
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute top-3 right-3 backdrop-blur text-xs font-semibold px-2 py-1 rounded border flex items-center gap-1 ${badgeColor} z-10`}>
          <Tag className="w-3 h-3" /> {isLost ? t.report.iLost : t.report.iFound}
        </div>
        
        {/* Status Indicators */}
        {item.status === 'PUBLISHED' && (
            <div className="absolute top-3 left-3 bg-blue-500/20 backdrop-blur border border-blue-500/50 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                <Clock className="w-3 h-3" /> {t.common.processing}
            </div>
        )}
        {item.status === 'COMPLETED' && (
             <div className="absolute top-3 left-3 bg-green-500/20 backdrop-blur border border-green-500/50 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                <CheckCircle2 className="w-3 h-3" /> {t.common.completed}
            </div>
        )}
        {item.status === 'EXPIRED' && (
             <div className="absolute top-3 left-3 bg-gray-500/20 backdrop-blur border border-gray-500/50 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                <XCircle className="w-3 h-3" /> {t.common.notProcessed}
            </div>
        )}

        {/* Report Button on Image - Only show if not Admin (Admins delete directly) */}
        {onReport && userRole !== 'ADMIN' && (
            <button 
                onClick={(e) => { e.stopPropagation(); onReport(item); }}
                className="absolute bottom-2 right-2 p-1.5 bg-black/40 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur z-20"
                title={t.item.report}
            >
                <Flag className="w-3 h-3" />
            </button>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className={`text-lg font-semibold text-white line-clamp-1 group-hover:${accentColor} transition-colors`}>
            {item.title}
            </h3>
            <span className="text-xs text-gray-500 bg-brand-900 px-2 py-1 rounded">{item.category}</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>
        
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-xs text-gray-400 gap-2">
            <MapPin className={`w-4 h-4 ${accentColor}`} />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-2">
            <Calendar className={`w-4 h-4 ${accentColor}`} />
            <span>{isLost ? t.item.lostOn : t.item.foundOn} {dateStr}</span>
          </div>
          <div className="flex items-center text-xs text-gray-400 gap-2">
            <User className={`w-4 h-4 ${accentColor}`} />
            <button 
                onClick={() => onUserClick && onUserClick(item.userId, item.finderName)}
                className="hover:text-white hover:underline truncate"
            >
                {isLost ? t.item.owner : t.item.finder} {item.finderName}
            </button>
          </div>
        </div>

        {/* Hide Contact button for Admins */}
        {userRole !== 'ADMIN' && (
            <button 
                onClick={() => onContact(item)}
                className={`w-full mt-4 text-white py-2 rounded-lg text-sm font-medium transition-colors border flex items-center justify-center gap-2 relative z-30 ${btnColor}`}
            >
                <MessageCircle className="w-4 h-4" />
                <span>{isLost ? t.item.contactOwner : t.item.contactFinder}</span>
            </button>
        )}
      </div>
    </div>
  );
};
