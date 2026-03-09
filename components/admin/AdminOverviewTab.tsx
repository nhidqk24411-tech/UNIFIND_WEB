
import React, { useMemo, useState } from 'react';
import { FoundItem, Report, Message, UserProfile, ItemCategory } from '../../types';
import { LayoutDashboard, Users, Archive, AlertOctagon, TrendingUp, Activity, PieChart, BarChart2, Layers, ArrowUpRight, MessageSquareWarning } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminOverviewTabProps {
  items: FoundItem[];
  reports: Report[];
  feedbacks: Message[];
  users: UserProfile[];
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ items, reports, feedbacks, users }) => {
  const { t } = useLanguage();
  const [activeTrendIndex, setActiveTrendIndex] = useState<number | null>(null);
  const [hoveredStatusIndex, setHoveredStatusIndex] = useState<number | null>(null);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
      // 1. Basic Counts
      const totalItems = items.length;
      const totalUsers = users.length;
      const activeUsers = users.filter(u => !u.isLocked).length;

      // 2. Status Breakdown
      const published = items.filter(i => i.status === 'PUBLISHED').length;
      const completed = items.filter(i => i.status === 'COMPLETED').length;
      const expired = items.filter(i => i.status === 'EXPIRED').length;
      const pending = items.filter(i => i.status === 'PENDING').length;
      const rejected = items.filter(i => i.status === 'REJECTED').length;

      // Custom Buckets for Chart
      const processingCount = published + pending;
      const notProcessedCount = expired + rejected;
      const completedCount = completed;

      // 3. Ratios
      const returnRate = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
      const approvalTotal = published + rejected + completed + expired;
      const approvalRate = approvalTotal > 0 ? Math.round(((approvalTotal - rejected) / approvalTotal) * 100) : 100;

      // 4. Reports & Feedback
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => r.status === 'PENDING').length;
      const totalFeedback = feedbacks.length;
      const combinedReportsAndFeedback = totalReports + totalFeedback;

      // 5. Category Distribution
      const categoryStats: Record<string, number> = {};
      Object.values(ItemCategory).forEach(cat => categoryStats[cat] = 0);
      items.forEach(item => {
          if (categoryStats[item.category] !== undefined) categoryStats[item.category]++;
      });
      const sortedCategories = Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .map(([name, count]) => ({ name, count }));

      // 6. Trend Data (Mocking last 7 days)
      const trendData = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          // Count items created on this date
          const lostCount = items.filter(item => item.dateFound.startsWith(dateStr) && item.type === 'LOST').length + Math.floor(Math.random() * 2);
          const foundCount = items.filter(item => item.dateFound.startsWith(dateStr) && item.type === 'FOUND').length + Math.floor(Math.random() * 2);
          return { date: d.toLocaleDateString(undefined, {weekday: 'short'}), fullDate: dateStr, lostCount, foundCount };
      });

      return {
          totalItems, totalUsers, activeUsers,
          processingCount, notProcessedCount, completedCount,
          pending, // Keep distinct pending for the small badge
          returnRate, approvalRate,
          pendingReports, totalFeedback, combinedReportsAndFeedback,
          trendData, sortedCategories
      };
  }, [items, reports, feedbacks, users]);

  // --- CHART HELPERS ---
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 300;
  const PADDING_X = 50;
  const PADDING_Y = 30;
  const GRAPH_WIDTH = SVG_WIDTH - PADDING_X * 2;
  const GRAPH_HEIGHT = SVG_HEIGHT - PADDING_Y * 2;

  // Calculate max value for Y-axis scaling
  const allTrendValues = stats.trendData.flatMap(d => [d.lostCount, d.foundCount]);
  const maxTrendValue = Math.max(...allTrendValues, 5); 

  const getX = (index: number) => PADDING_X + (index / (stats.trendData.length - 1)) * GRAPH_WIDTH;
  const getY = (value: number) => (SVG_HEIGHT - PADDING_Y) - (value / maxTrendValue) * GRAPH_HEIGHT;

  const generatePath = (key: 'lostCount' | 'foundCount') => {
      const points = stats.trendData.map((d, i) => `${getX(i)},${getY(d[key])}`);
      return `M${points.join(' L')}`;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const svgX = (x / rect.width) * SVG_WIDTH;
      let index = Math.round(((svgX - PADDING_X) / GRAPH_WIDTH) * (stats.trendData.length - 1));
      
      if (index < 0) index = 0;
      if (index >= stats.trendData.length) index = stats.trendData.length - 1;
      
      setActiveTrendIndex(index);
  };

  // --- COMPONENTS ---

  const CircularGauge = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
      const r = 36;
      const c = 2 * Math.PI * r;
      const offset = c - (percentage / 100) * c;
      return (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Background Track */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r={r} fill="transparent" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                    <circle 
                        cx="50%" cy="50%" r={r} 
                        fill="transparent" 
                        stroke={color} 
                        strokeWidth="8" 
                        strokeDasharray={c} 
                        strokeDashoffset={offset} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-xl font-bold tracking-tighter">{percentage}%</span>
                </div>
            </div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-center max-w-[100px] leading-tight">{label}</span>
          </div>
      );
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-brand-500"/>
                    {t.admin.overview.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    {t.admin.overview.subtitle}
                </p>
            </div>
            <div className="flex items-center gap-2 bg-brand-800 px-3 py-1.5 rounded-lg border border-brand-700 text-xs text-brand-300 shadow-sm">
                <Activity className="w-4 h-4 animate-pulse text-green-400"/>
                {t.admin.overview.systemHealth}: <span className="text-green-400 font-bold">Excellent</span>
            </div>
        </div>

        {/* 1. CONSOLIDATED METRIC CARDS */}
        <div id="admin-stats-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Items */}
            <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 shadow-sm relative overflow-hidden group hover:border-brand-500 transition">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t.admin.overview.totalItems}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalItems}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <Archive className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500"/> +5 this week
                </div>
            </div>

            {/* Card 2: Pending Approval (Specific subset of Processing) */}
            <div className="bg-brand-800 p-4 rounded-xl border border-amber-500/30 shadow-sm relative overflow-hidden group hover:border-amber-500 transition">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            {t.admin.overview.pendingItems}
                        </p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                        <AlertOctagon className="w-5 h-5" />
                    </div>
                </div>
                {stats.pending > 0 && (
                    <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded w-fit animate-pulse">
                        Needs Action
                    </div>
                )}
            </div>

            {/* Card 3: Total Reports & Feedback (Merged) */}
            <div className="bg-brand-800 p-4 rounded-xl border border-red-500/30 shadow-sm relative overflow-hidden group hover:border-red-500 transition">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            {t.admin.overview.reportsAndFeedback}
                        </p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.combinedReportsAndFeedback}</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                        <MessageSquareWarning className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-2">
                    <span className="text-red-400">{stats.pendingReports} {t.common.pending}</span>
                    <span>•</span>
                    <span className="text-blue-400">{stats.totalFeedback} Feedback</span>
                </div>
            </div>

            {/* Card 4: Active Users */}
            <div className="bg-brand-800 p-4 rounded-xl border border-brand-700 shadow-sm group hover:border-brand-500 transition">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{t.admin.overview.totalUsers}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.activeUsers}</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500"/> +12% vs last month
                </div>
            </div>
        </div>

        {/* 2. CHART ROW (Trend + Status Compare) */}
        {/* Changed grid to stack on mobile with min-heights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
            
            {/* 2a. INTERACTIVE TREND CHART */}
            <div id="admin-trend-chart" className="lg:col-span-2 bg-brand-800 p-6 rounded-2xl border border-brand-700 shadow-lg flex flex-col relative overflow-hidden h-80 lg:h-96">
                <div className="flex justify-between items-center mb-2 z-10">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400"/>
                        {t.admin.overview.lostVsFound}
                    </h3>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> {t.common.lost}</div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> {t.common.found}</div>
                    </div>
                </div>
                
                <div className="flex-1 w-full relative cursor-crosshair">
                    <svg 
                        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                        className="w-full h-full" 
                        preserveAspectRatio="none"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setActiveTrendIndex(null)}
                    >
                        {/* Grid Lines */}
                        <line x1={PADDING_X} y1={getY(0)} x2={SVG_WIDTH} y2={getY(0)} stroke="#334155" strokeWidth="1" />
                        <line x1={PADDING_X} y1={getY(maxTrendValue/2)} x2={SVG_WIDTH} y2={getY(maxTrendValue/2)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                        <line x1={PADDING_X} y1={getY(maxTrendValue)} x2={SVG_WIDTH} y2={getY(maxTrendValue)} stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                        {/* Interactive Vertical Cursor Line */}
                        {activeTrendIndex !== null && (
                            <line 
                                x1={getX(activeTrendIndex)} y1={PADDING_Y} 
                                x2={getX(activeTrendIndex)} y2={SVG_HEIGHT - PADDING_Y} 
                                stroke="white" strokeWidth="1" strokeDasharray="4" opacity="0.5" 
                            />
                        )}

                        {/* Paths */}
                        <path d={generatePath('lostCount')} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={generatePath('foundCount')} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Data Points */}
                        {stats.trendData.map((d, i) => {
                            const isActive = activeTrendIndex === i;
                            return (
                                <g key={i}>
                                    <text x={getX(i)} y={SVG_HEIGHT - 10} fill={isActive ? "#fff" : "#94a3b8"} fontSize="12" textAnchor="middle" fontWeight={isActive ? "bold" : "normal"}>{d.date}</text>
                                    
                                    {isActive && (
                                        <>
                                            <circle cx={getX(i)} cy={getY(d.lostCount)} r="6" fill="#f59e0b" stroke="white" strokeWidth="2" />
                                            <circle cx={getX(i)} cy={getY(d.foundCount)} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                                        </>
                                    )}
                                </g>
                            )
                        })}
                    </svg>

                    {/* Tooltip */}
                    {activeTrendIndex !== null && (
                        <div 
                            className="absolute top-10 pointer-events-none bg-brand-900/90 backdrop-blur border border-brand-600 p-3 rounded-lg shadow-xl text-xs z-20"
                            style={{ 
                                left: `${(getX(activeTrendIndex) / SVG_WIDTH) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <p className="text-gray-400 font-mono mb-1">{stats.trendData[activeTrendIndex].fullDate}</p>
                            <div className="flex items-center gap-3 font-bold text-sm">
                                <span className="text-amber-500">{t.common.lost}: {stats.trendData[activeTrendIndex].lostCount}</span>
                                <span className="text-blue-400">{t.common.found}: {stats.trendData[activeTrendIndex].foundCount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2b. STATUS COMPARISON CHART (Bar) */}
            <div className="bg-brand-800 p-6 rounded-2xl border border-brand-700 shadow-lg flex flex-col h-80 lg:h-96">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-purple-400"/>
                    {t.admin.overview.comparison}
                </h3>
                
                <div className="flex-1 flex items-end justify-around gap-4 px-2 pb-4">
                    {/* Helper to calculate bar height relative to max total */}
                    {(() => {
                        const maxVal = Math.max(stats.processingCount, stats.notProcessedCount, stats.completedCount, 1);
                        
                        const data = [
                            { label: t.common.processing, count: stats.processingCount, color: 'bg-blue-500', text: 'text-blue-500' },
                            { label: t.common.notProcessed, count: stats.notProcessedCount, color: 'bg-gray-500', text: 'text-gray-500' },
                            { label: t.common.completed, count: stats.completedCount, color: 'bg-green-500', text: 'text-green-500' }
                        ];

                        return data.map((d, i) => (
                            <div 
                                key={i} 
                                className="flex flex-col items-center gap-2 flex-1 h-full justify-end group cursor-pointer"
                                onMouseEnter={() => setHoveredStatusIndex(i)}
                                onMouseLeave={() => setHoveredStatusIndex(null)}
                            >
                                {/* Tooltip / Count Label */}
                                <div className={`transition-all duration-300 ${hoveredStatusIndex === i ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                                    <span className="text-white font-bold text-lg">{d.count}</span>
                                </div>
                                
                                {/* Bar */}
                                <div className="w-full bg-brand-900 rounded-t-lg relative h-full flex items-end overflow-hidden">
                                    <div 
                                        className={`w-full rounded-t-lg transition-all duration-500 ease-out ${d.color} ${hoveredStatusIndex === i ? 'opacity-100' : 'opacity-80'}`}
                                        style={{ height: `${(d.count / maxVal) * 100}%` }}
                                    ></div>
                                </div>
                                
                                {/* Label - Truncate if needed on small screens */}
                                <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-center break-words w-full px-1 ${d.text}`}>
                                    {d.label}
                                </span>
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>

        {/* 3. CATEGORY & PERFORMANCE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Bar Chart */}
            <div id="admin-cat-chart" className="lg:col-span-2 bg-brand-800 rounded-2xl border border-brand-700 p-6 shadow-lg">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-500"/>
                    {t.admin.overview.categoryDist}
                </h3>
                <div className="space-y-4">
                    {stats.sortedCategories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="w-32 text-xs text-gray-300 font-medium truncate text-right">{cat.name}</div>
                            <div className="flex-1 bg-brand-900 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-brand-500 h-full rounded-full transition-all duration-1000 group-hover:bg-brand-400" 
                                    style={{ width: `${(cat.count / (stats.totalItems || 1)) * 100}%` }}
                                ></div>
                            </div>
                            <div className="w-8 text-xs text-white font-bold">{cat.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Gauges */}
            <div className="bg-brand-800 rounded-2xl border border-brand-700 p-6 shadow-lg flex flex-col justify-between">
                <h3 className="text-white font-bold text-lg mb-6 w-full text-left flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500"/> {t.admin.overview.performance}
                </h3>
                <div className="flex justify-around items-center gap-4">
                    <CircularGauge percentage={stats.returnRate} color="#22c55e" label={t.admin.overview.returnRate} />
                    <CircularGauge percentage={stats.approvalRate} color="#3b82f6" label={t.admin.overview.approvalRate} />
                </div>
                <div className="mt-6 text-center text-[10px] text-gray-500 bg-brand-900/50 p-2 rounded-lg border border-brand-800">
                    {t.admin.overview.metricsDisclaimer}
                </div>
            </div>
        </div>
    </div>
  );
};
