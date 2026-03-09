
import React from 'react';
import { X, MapPin, Calendar, Tag, User, Clock, AlertCircle } from 'lucide-react';
import { FoundItem } from '../types';

interface ItemPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoundItem | null;
}

export const ItemPreviewModal: React.FC<ItemPreviewModalProps> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const isLost = item.type === 'LOST';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-800 bg-brand-950/50">
          <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Chi tiết Vật phẩm
                  <span className={`text-xs px-2 py-0.5 rounded border ${isLost ? 'bg-amber-600/20 text-amber-500 border-amber-500/30' : 'bg-brand-600/20 text-brand-400 border-brand-500/30'}`}>
                      {item.type}
                  </span>
              </h2>
              <p className="text-gray-500 text-xs font-mono mt-1">ID: {item.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-brand-800 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-6">
                
                {/* Left: Image */}
                <div className="md:w-1/2">
                    <div className="aspect-video w-full rounded-xl bg-black border border-brand-700 overflow-hidden relative group">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs text-center">
                            Hình ảnh vật phẩm
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-4 space-y-3 bg-brand-800/30 p-4 rounded-xl border border-brand-800">
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <Calendar className="w-4 h-4 text-brand-500"/>
                            <span>{new Date(item.dateFound).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <MapPin className="w-4 h-4 text-brand-500"/>
                            <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                            <Tag className="w-4 h-4 text-brand-500"/>
                            <span>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                             <div className={`w-2 h-2 rounded-full ${
                                 item.status === 'PUBLISHED' ? 'bg-green-500' : 
                                 item.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                             }`}></div>
                            <span className="capitalize">{item.status}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="md:w-1/2 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                        <div className="bg-brand-800/50 p-4 rounded-xl border border-brand-700/50 text-gray-200 leading-relaxed text-sm h-40 overflow-y-auto custom-scrollbar">
                            {item.description}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Thông tin người đăng</h4>
                        <div className="flex items-center gap-3 p-3 bg-brand-800 rounded-lg border border-brand-700">
                            <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-gray-400">
                                <User className="w-5 h-5"/>
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">{item.finderName}</p>
                                <p className="text-xs text-gray-500">{item.contactInfo}</p>
                            </div>
                        </div>
                    </div>

                    {item.status === 'PENDING' && (
                        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
                            <p>Vật phẩm này đang ở trạng thái Chờ duyệt. Nó chưa hiển thị công khai trên bảng tin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-brand-800 bg-brand-900 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg font-medium transition"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};
