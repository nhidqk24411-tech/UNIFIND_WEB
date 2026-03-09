
import React, { useState } from 'react';
import { FoundItem, ItemStatus } from '../../types';
import { Trash2, CheckCircle2, Search, Filter, Calendar, SortAsc, SortDesc, Layers } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

import { useConfirm } from '../../contexts/ConfirmContext';

interface AdminItemsTabProps {
  items: FoundItem[];
  onUpdateItemStatus: (id: string, status: ItemStatus) => void;
  onDeleteItem: (id: string) => void;
}

export const AdminItemsTab: React.FC<AdminItemsTabProps> = ({ items, onUpdateItemStatus, onDeleteItem }) => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Advanced Filters
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'COMPLETED' | 'EXPIRED' | 'REJECTED'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // 1. Filter Logic
  const filteredItems = items.filter(item => {
    // Search
    const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm) ||
        item.finderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status Logic
    let matchesStatus = false;
    if (filterStatus === 'ALL') {
        matchesStatus = item.status !== 'PENDING';
    } else {
        matchesStatus = item.status === filterStatus;
    }
    
    // Category
    const matchesCategory = selectedCategory === 'ALL' ? true : item.category === selectedCategory;

    // Date
    const matchesDate = selectedDate ? item.dateFound.startsWith(selectedDate) : true;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // 2. Sort Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
      const dateA = new Date(a.dateFound).getTime();
      const dateB = new Date(b.dateFound).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // 3. Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedItems.map(item => item.id));
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

  // 4. Bulk Actions Logic
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (await confirm(t.common.confirm, `${t.admin.items.bulkDelete} (${selectedIds.length})?`)) {
        selectedIds.forEach(id => onDeleteItem(id));
        setSelectedIds([]); 
    }
  };

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return;
    const eligibleIds = selectedIds.filter(id => {
        const item = items.find(i => i.id === id);
        return item && (item.status === 'PUBLISHED' || item.status === 'EXPIRED');
    });

    if (eligibleIds.length === 0) {
        return;
    }

    if (await confirm(t.common.confirm, `${t.admin.items.bulkComplete} (${eligibleIds.length})?`)) {
        eligibleIds.forEach(id => onUpdateItemStatus(id, 'COMPLETED'));
        setSelectedIds([]);
    }
  };

  const handleSingleDelete = async (id: string) => {
      if (await confirm(t.common.confirm, `${t.common.delete}?`)) {
          onDeleteItem(id);
          setSelectedIds(prev => prev.filter(pid => pid !== id));
      }
  };

  const handleSingleComplete = async (id: string) => {
      if (await confirm(t.common.confirm, `${t.admin.items.bulkComplete}?`)) {
          onUpdateItemStatus(id, 'COMPLETED');
      }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
        {/* Header & Status Filter */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-brand-500"/>
                {t.admin.items.title}
            </h2>
            
            <div className="flex gap-2 bg-brand-900 p-1 rounded-lg border border-brand-800 overflow-x-auto">
                {(['ALL', 'PUBLISHED', 'COMPLETED', 'EXPIRED', 'REJECTED'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${filterStatus === status ? 'bg-brand-700 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-brand-800'}`}
                    >
                        {status === 'ALL' ? t.admin.items.allApproved : 
                         status === 'PUBLISHED' ? t.admin.items.showing :
                         status === 'COMPLETED' ? t.admin.items.completed : 
                         status === 'EXPIRED' ? t.admin.items.expired : t.admin.items.rejected}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Advanced Toolbar */}
        <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 grid grid-cols-1 lg:grid-cols-12 gap-4 shadow-lg">
            
            {/* Search - Spans 4 columns */}
            <div className="lg:col-span-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder={t.admin.items.searchPlaceholder} 
                    className="w-full bg-brand-900 border border-brand-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
            </div>

            {/* Filters - Spans 5 columns */}
            <div className="lg:col-span-5 flex gap-2 overflow-x-auto">
                {/* Category Filter */}
                <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500" />
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                        className="w-full pl-9 pr-8 py-2 bg-brand-900 border border-brand-600 rounded-lg text-xs text-gray-300 focus:outline-none focus:text-white appearance-none cursor-pointer"
                    >
                        <option value="ALL">{t.admin.items.allApproved}</option>
                        {(CATEGORIES || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Date Filter */}
                <div className="relative min-w-[130px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-500" />
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="w-full pl-9 pr-2 py-2 bg-brand-900 border border-brand-600 rounded-lg text-xs text-gray-300 focus:outline-none focus:text-white" 
                    />
                </div>

                {/* Sort Button */}
                <button 
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} 
                    className="flex items-center gap-2 px-3 py-2 bg-brand-900 border border-brand-600 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-brand-700 transition"
                >
                    {sortOrder === 'newest' ? <SortDesc className="w-4 h-4 text-brand-500" /> : <SortAsc className="w-4 h-4 text-brand-500" />}
                </button>
            </div>

            {/* Actions - Spans 3 columns */}
            <div className="lg:col-span-3 flex justify-end items-center gap-2">
                 {selectedIds.length > 0 && (
                     <>
                        <button 
                            onClick={handleBulkComplete}
                            className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition shadow-lg active:scale-95"
                            title={t.admin.items.bulkComplete}
                        >
                            <CheckCircle2 className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition shadow-lg active:scale-95"
                            title={t.admin.items.bulkDelete}
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{selectedIds.length}</span>
                     </>
                 )}
            </div>
        </div>

        {/* Table Area */}
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
                                    checked={sortedItems.length > 0 && selectedIds.length === sortedItems.length}
                                />
                            </th>
                            <th className="p-4 border-b border-brand-700">{t.report.itemTitle}</th>
                            <th className="p-4 border-b border-brand-700">Status</th>
                            <th className="p-4 border-b border-brand-700 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-700/50">
                        {sortedItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <Filter className="w-12 h-12 mb-3 opacity-20"/>
                                        <p className="text-lg">{t.home.noItems}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            (sortedItems || []).map(item => (
                                <tr key={item.id} className={`group hover:bg-brand-700/30 transition-colors ${selectedIds.includes(item.id) ? 'bg-brand-700/20' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-600 text-brand-600 focus:ring-brand-500 bg-gray-800 cursor-pointer"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 rounded-lg bg-black overflow-hidden border border-brand-600 flex-shrink-0 relative">
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover"/>
                                                <div className={`absolute top-0 right-0 px-1 py-0.5 text-[8px] font-bold text-white ${item.type === 'LOST' ? 'bg-amber-600' : 'bg-brand-600'}`}>
                                                    {item.type}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white text-sm line-clamp-1 hover:text-brand-400 transition cursor-pointer" title={item.title}>{item.title}</div>
                                                <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">{item.category} • {item.location}</div>
                                                <div className="text-[10px] text-gray-500 mt-1 font-mono flex gap-2">
                                                    <span>ID: {item.id}</span>
                                                    <span>• {new Date(item.dateFound).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            item.status === 'PUBLISHED' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                            item.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                            item.status === 'EXPIRED' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                                            item.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                            'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        }`}>
                                            {item.status === 'PUBLISHED' ? t.admin.items.showing : 
                                             item.status === 'EXPIRED' ? t.admin.items.expired :
                                             item.status === 'REJECTED' ? t.admin.items.rejected :
                                             item.status === 'COMPLETED' ? t.admin.items.completed : item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {(item.status === 'PUBLISHED' || item.status === 'EXPIRED') && (
                                                <button 
                                                    onClick={() => handleSingleComplete(item.id)}
                                                    className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-md transition"
                                                    title={t.admin.items.bulkComplete}
                                                >
                                                    <CheckCircle2 className="w-5 h-5"/>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleSingleDelete(item.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition"
                                                title={t.admin.items.bulkDelete}
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer Summary */}
            <div className="p-3 bg-brand-900 border-t border-brand-700 text-xs text-gray-500 flex justify-between items-center">
                <span>{t.admin.items.showing} {sortedItems.length}</span>
                <span>Page 1 of 1</span>
            </div>
        </div>
    </div>
  );
};
