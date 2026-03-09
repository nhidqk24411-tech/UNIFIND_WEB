
import React from 'react';
import { Message } from '../../types';
import { User, Trash2, MessageSquare } from 'lucide-react';

interface AdminFeedbacksTabProps {
  feedbacks: Message[];
  onDeleteFeedback: (id: string) => void;
}

export const AdminFeedbacksTab: React.FC<AdminFeedbacksTabProps> = ({ feedbacks, onDeleteFeedback }) => {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400"/>
                Phản hồi từ người dùng
            </h2>
            <div className="px-3 py-1 bg-brand-800 rounded-full border border-brand-700 text-xs text-gray-300">
                Tổng cộng: {feedbacks.length}
            </div>
        </div>

        <div className="space-y-4">
            {feedbacks.length === 0 ? (
                <div className="bg-brand-800/50 p-12 rounded-xl border border-dashed border-brand-700 text-center text-gray-500 flex flex-col items-center">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20"/>
                    <p>Chưa có phản hồi nào.</p>
                </div>
            ) : (
                feedbacks.map(fb => (
                    <div key={fb.id} className="relative group bg-brand-800 border border-brand-700 p-5 rounded-xl hover:bg-brand-800/80 transition shadow-sm hover:shadow-md flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-700 to-brand-600 flex items-center justify-center text-white shrink-0 shadow-inner">
                            <User className="w-5 h-5"/>
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-2">
                                <span className="font-bold text-white text-sm">
                                    {fb.senderId === 'user' ? 'Người dùng ẩn danh' : fb.senderId}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(fb.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="bg-brand-900/50 p-3 rounded-lg border border-brand-700/50 text-gray-200 text-sm leading-relaxed">
                                {fb.text}
                            </div>
                        </div>

                        <button 
                            onClick={() => onDeleteFeedback(fb.id)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 hover:bg-brand-900 rounded-lg transition opacity-0 group-hover:opacity-100"
                            title="Xóa phản hồi này"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
