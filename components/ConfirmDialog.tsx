import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-900 border border-brand-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="bg-brand-950/50 p-4 border-t border-brand-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-brand-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 transition shadow-lg active:scale-95"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
