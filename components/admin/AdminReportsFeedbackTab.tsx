
import React, { useState } from 'react';
import { Report, Message } from '../../types';
import { ShieldAlert, MessageSquare, CheckCircle2, Trash2, ExternalLink, User, AlertTriangle, Ban, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

import { useConfirm } from '../../contexts/ConfirmContext';

interface AdminReportsFeedbackTabProps {
  reports: Report[];
  feedbacks: Message[];
  onUpdateReportStatus: (id: string, action: 'RESOLVED' | 'DISMISSED') => void;
  onDeleteTarget: (type: 'ITEM' | 'USER', id: string) => void;
  onDeleteFeedback: (id: string) => void;
  onViewItem: (itemId: string) => void;
  onViewUser: (userId: string) => void;
}

export const AdminReportsFeedbackTab: React.FC<AdminReportsFeedbackTabProps> = ({ 
    reports, feedbacks, onUpdateReportStatus, onDeleteTarget, onDeleteFeedback, onViewItem, onViewUser 
}) => {
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const [subTab, setSubTab] = useState<'REPORTS' | 'FEEDBACKS'>('REPORTS');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  // Filter Logic
  const filteredReports = reports.filter(r => reportFilter === 'ALL' ? true : r.status === reportFilter);

  // --- Handlers ---
  const handleResolveReport = async (id: string) => {
      if(await confirm(t.common.confirm, `${t.admin.reports.markResolved}?`)) {
          onUpdateReportStatus(id, 'RESOLVED');
      }
  };

  const handleDeleteTarget = async (report: Report) => {
      if (!report.targetId) return;
      
      const confirmMsg = `${t.admin.reports.deleteItem} (ID: ${report.targetId})?`;

      if (await confirm(t.common.confirm, confirmMsg)) {
          onDeleteTarget(report.type === 'ITEM' ? 'ITEM' : 'USER', report.targetId);
          onUpdateReportStatus(report.id, 'RESOLVED'); // Auto resolve the report
      }
  };

  const handleDeleteFeedbackConfirm = async (id: string) => {
      if(await confirm(t.common.confirm, "Xóa tin nhắn phản hồi này?")) {
          onDeleteFeedback(id);
      }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {/* Header & Sub-tabs Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-800 pb-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {subTab === 'REPORTS' ? <ShieldAlert className="w-7 h-7 text-amber-500"/> : <MessageSquare className="w-7 h-7 text-blue-400"/>}
                    {subTab === 'REPORTS' ? t.admin.reports.title : t.admin.reports.feedbackTitle}
                </h2>
            </div>

            <div className="bg-brand-900 p-1 rounded-lg border border-brand-800 flex">
                <button 
                    onClick={() => setSubTab('REPORTS')} 
                    className={`px-4 py-2 text-sm font-bold rounded-md transition ${subTab === 'REPORTS' ? 'bg-brand-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    {t.admin.reports.reportTab} ({reports.filter(r => r.status === 'PENDING').length})
                </button>
                <button 
                    onClick={() => setSubTab('FEEDBACKS')} 
                    className={`px-4 py-2 text-sm font-bold rounded-md transition ${subTab === 'FEEDBACKS' ? 'bg-brand-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    {t.admin.reports.feedbackTab} ({feedbacks.length})
                </button>
            </div>
        </div>

        {/* --- REPORTS VIEW --- */}
        {subTab === 'REPORTS' && (
            <div className="flex-1 flex flex-col gap-4">
                {/* Filter Toolbar */}
                <div className="flex gap-2">
                    <button onClick={() => setReportFilter('ALL')} className={`px-3 py-1 text-xs rounded-full border ${reportFilter === 'ALL' ? 'bg-brand-600 border-brand-500 text-white' : 'border-brand-700 text-gray-400'}`}>{t.common.all}</button>
                    <button onClick={() => setReportFilter('PENDING')} className={`px-3 py-1 text-xs rounded-full border ${reportFilter === 'PENDING' ? 'bg-amber-600 border-amber-500 text-white' : 'border-brand-700 text-gray-400'}`}>{t.admin.reports.pending}</button>
                    <button onClick={() => setReportFilter('RESOLVED')} className={`px-3 py-1 text-xs rounded-full border ${reportFilter === 'RESOLVED' ? 'bg-green-600 border-green-500 text-white' : 'border-brand-700 text-gray-400'}`}>{t.admin.reports.resolved}</button>
                </div>

                <div className="overflow-auto custom-scrollbar flex-1 space-y-4">
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 border border-dashed border-brand-700 rounded-xl bg-brand-800/30">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                            <p>{t.admin.reports.noReports}</p>
                        </div>
                    ) : (
                        (filteredReports || []).map(report => (
                            <div key={report.id} className={`bg-brand-800 border ${report.status === 'PENDING' ? 'border-amber-500/40' : 'border-brand-700'} p-5 rounded-xl shadow-md transition hover:bg-brand-800/80`}>
                                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                report.type === 'USER' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                                                'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                            }`}>
                                                {report.type} REPORT
                                            </span>
                                            <span className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleString()}</span>
                                            {report.status === 'PENDING' && <span className="text-[10px] bg-amber-500 text-black px-1.5 rounded font-bold">NEW</span>}
                                        </div>
                                        
                                        <h3 className="font-bold text-white text-lg">{report.reason}</h3>
                                        <p className="text-sm text-gray-300 bg-brand-900/50 p-3 rounded border border-brand-700/50">
                                            "{report.details}"
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                            <span>{t.admin.reports.target}: <code className="bg-black/30 px-1 rounded">{report.targetId}</code></span>
                                            {report.targetName && <span className="text-brand-300 font-medium">({report.targetName})</span>}
                                        </div>
                                    </div>

                                    {/* Actions Column */}
                                    <div className="flex flex-col gap-2 min-w-[160px] lg:border-l lg:border-brand-700/50 lg:pl-4 justify-center">
                                        {/* VIEW BUTTONS */}
                                        {report.targetId && (
                                            <button 
                                                onClick={() => report.type === 'ITEM' ? onViewItem(report.targetId!) : onViewUser(report.targetId!)}
                                                className="w-full py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                                            >
                                                {report.type === 'ITEM' ? <ExternalLink className="w-3 h-3"/> : <User className="w-3 h-3"/>}
                                                {t.common.view}
                                            </button>
                                        )}

                                        {/* RESOLUTION BUTTONS (Only if Pending) */}
                                        {report.status === 'PENDING' ? (
                                            <>
                                                <button 
                                                    onClick={() => handleDeleteTarget(report)}
                                                    className="w-full py-2 bg-red-600/10 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition group"
                                                >
                                                    {report.type === 'ITEM' ? <Trash2 className="w-3 h-3"/> : <Ban className="w-3 h-3"/>}
                                                    {report.type === 'ITEM' ? t.admin.reports.deleteItem : t.admin.reports.banUser}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleResolveReport(report.id)}
                                                    className="w-full py-2 bg-green-600/10 hover:bg-green-600 border border-green-600/30 text-green-400 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                                                >
                                                    <CheckCircle2 className="w-3 h-3"/>
                                                    {t.admin.reports.markResolved}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-xs font-bold flex items-center justify-center gap-1">
                                                <CheckCircle2 className="w-3 h-3"/> {t.admin.reports.resolved}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* --- FEEDBACKS VIEW --- */}
        {subTab === 'FEEDBACKS' && (
             <div className="overflow-auto custom-scrollbar flex-1 space-y-4">
                {feedbacks.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 border border-dashed border-brand-700 rounded-xl bg-brand-800/30">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                        <p>{t.admin.reports.noFeedback}</p>
                    </div>
                ) : (
                    (feedbacks || []).map(fb => (
                        <div key={fb.id} className="bg-brand-800 border border-brand-700 p-5 rounded-xl shadow-sm hover:bg-brand-800/80 transition flex gap-4 items-start group">
                             <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center text-blue-400 shrink-0">
                                <MessageSquare className="w-5 h-5"/>
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-white text-sm">{fb.senderId === 'user' ? 'Anonymous User' : fb.senderId}</span>
                                    <span className="text-xs text-gray-500">{new Date(fb.timestamp).toLocaleString()}</span>
                                 </div>
                                 <p className="text-gray-300 text-sm leading-relaxed bg-brand-900/30 p-3 rounded-lg border border-brand-700/30">
                                     {fb.text}
                                 </p>
                             </div>
                             <button 
                                onClick={() => handleDeleteFeedbackConfirm(fb.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-brand-900 rounded-lg transition opacity-0 group-hover:opacity-100"
                                title={t.common.delete}
                             >
                                 <Trash2 className="w-4 h-4"/>
                             </button>
                        </div>
                    ))
                )}
             </div>
        )}
    </div>
  );
};
