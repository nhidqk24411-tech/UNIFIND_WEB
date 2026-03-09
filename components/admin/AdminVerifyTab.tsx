
import React, { useState } from 'react';
import { FoundItem, ItemStatus } from '../../types';
import { CheckCircle2, XCircle, Search, Check, X, Calendar, MapPin, User, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import { useConfirm } from '../../contexts/ConfirmContext';

interface AdminVerifyTabProps {
  pendingItems: FoundItem[];
  onUpdateItemStatus: (id: string, status: ItemStatus) => void;
}

export const AdminVerifyTab: React.FC<AdminVerifyTabProps> = ({ pendingItems, onUpdateItemStatus }) => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter based on search
  const filteredItems = pendingItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.finderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Bulk Actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (await confirm(t.common.confirm, `${t.admin.verify.bulkApprove} (${selectedIds.length})?`)) {
        selectedIds.forEach(id => onUpdateItemStatus(id, 'PUBLISHED'));
        setSelectedIds([]);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    if (await confirm(t.common.confirm, `${t.admin.verify.bulkReject} (${selectedIds.length})?`)) {
        selectedIds.forEach(id => onUpdateItemStatus(id, 'REJECTED'));
        setSelectedIds([]);
    }
  };

  const handleSingleApprove = async (id: string) => {
    if (await confirm(t.common.confirm, `${t.common.approve}?`)) {
      onUpdateItemStatus(id, 'PUBLISHED');
    }
  };

  const handleSingleReject = async (id: string) => {
    if (await confirm(t.common.confirm, `${t.common.reject}?`)) {
      onUpdateItemStatus(id, 'REJECTED');
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-brand-500"/>
                    {t.admin.verify.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {t.admin.verify.subtitle} 
                </p>
            </div>
            
            {/* Stats Badge */}
            <div className="bg-brand-900 border border-brand-800 px-4 py-2 rounded-lg text-sm text-gray-300">
                {t.admin.verify.pendingCount}: <span className="text-brand-400 font-bold ml-1">{pendingItems.length}</span>
            </div>
        </div>

        {/* Toolbar */}
        <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-lg">
            {/* Search */}
            <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder={t.admin.verify.searchPlaceholder} 
                    className="w-full bg-brand-900 border border-brand-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <span className={`text-xs font-medium transition-opacity ${selectedIds.length > 0 ? 'opacity-100 text-brand-300' : 'opacity-0'}`}>
                    {selectedIds.length} {t.admin.verify.selected}
                </span>

                <button 
                    onClick={handleBulkReject}
                    disabled={selectedIds.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md border
                        ${selectedIds.length > 0 
                            ? 'bg-red-600/10 border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white active:scale-95' 
                            : 'bg-brand-900 border-brand-700 text-gray-600 cursor-not-allowed'}`}
                >
                    <X className="w-4 h-4"/>
                    <span className="hidden sm:inline">{t.admin.verify.bulkReject}</span>
                </button>

                <button 
                    onClick={handleBulkApprove}
                    disabled={selectedIds.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md border
                        ${selectedIds.length > 0 
                            ? 'bg-green-600 border-green-500 hover:bg-green-500 text-white active:scale-95' 
                            : 'bg-brand-900 border-brand-700 text-gray-600 cursor-not-allowed'}`}
                >
                    <Check className="w-4 h-4"/>
                    <span className="hidden sm:inline">{t.admin.verify.bulkApprove}</span>
                </button>
            </div>
        </div>

        {/* List Content */}
        <div className="bg-brand-800 rounded-xl border border-brand-700 overflow-hidden shadow-xl flex-1 flex flex-col">
            <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-brand-900/90 text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 w-12 text-center border-b border-brand-700">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-600 text-brand-600 focus:ring-brand-500 bg-gray-800 cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                                />
                            </th>
                            <th className="p-4 border-b border-brand-700 w-32">{t.report.photoEvidence}</th>
                            <th className="p-4 border-b border-brand-700">{t.help.contentLabel}</th>
                            <th className="p-4 border-b border-brand-700 w-40 text-right">{t.admin.sidebar.verify}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-700/50">
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle2 className="w-16 h-16 mb-4 text-green-500/20"/>
                                        <p className="text-xl font-medium text-gray-300">{t.admin.verify.emptyTitle}</p>
                                        <p className="text-sm mt-2">{t.admin.verify.emptyDesc}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(item => (
                                <tr key={item.id} className={`group hover:bg-brand-700/30 transition-colors ${selectedIds.includes(item.id) ? 'bg-brand-700/20' : ''}`}>
                                    <td className="p-4 text-center align-top pt-6">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-600 text-brand-600 focus:ring-brand-500 bg-gray-800 cursor-pointer"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                        />
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="w-24 h-24 rounded-lg bg-black overflow-hidden border border-brand-600 relative group-hover:border-brand-400 transition">
                                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover"/>
                                            <div className={`absolute top-0 right-0 px-1.5 py-0.5 text-[9px] font-bold text-white ${item.type === 'LOST' ? 'bg-amber-600' : 'bg-brand-600'}`}>
                                                {item.type}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className="font-bold text-white text-lg hover:text-brand-400 cursor-pointer">{item.title}</h3>
                                                <span className="text-xs text-brand-400 bg-brand-900/80 px-2 py-0.5 rounded border border-brand-700/50">{item.category}</span>
                                            </div>
                                            
                                            <p className="text-gray-300 text-sm bg-brand-900/40 p-3 rounded border border-brand-700/30 italic">
                                                "{item.description}"
                                            </p>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-gray-400"/> 
                                                    <span className="text-gray-300">{item.finderName}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400"/> 
                                                    {item.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400"/> 
                                                    {new Date(item.dateFound).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right align-middle">
                                        <div className="flex flex-col gap-3 items-end">
                                            <button 
                                                onClick={() => handleSingleApprove(item.id)}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                            >
                                                <Check className="w-4 h-4"/> {t.common.approve}
                                            </button>
                                            <button 
                                                onClick={() => handleSingleReject(item.id)}
                                                className="w-full px-4 py-2 bg-transparent border border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-400 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <X className="w-4 h-4"/> {t.common.reject}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
