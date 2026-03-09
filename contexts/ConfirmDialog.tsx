import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  isAlert?: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, isAlert, title, message, onConfirm, onCancel }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={isAlert ? onConfirm : onCancel} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={isAlert ? onConfirm : onCancel} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {!isAlert && (
            <button 
              onClick={onCancel}
              className="px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white font-medium rounded-lg transition"
            >
              {t.common.cancel}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition"
          >
            {isAlert ? "OK" : t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
