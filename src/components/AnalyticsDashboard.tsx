import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  BarChart3,
  X,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { LetterItem } from '../App';

interface AnalyticsProps {
  items: LetterItem[];
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter?: (filterType: string, value: string) => void;
}

const NETWORK_COLORS: Record<string, string> = {
  SAR: '#00707b',
  HHR: '#d97706',
  MMMP: '#2563eb'
};

const DIRECTION_COLORS: Record<string, string> = {
  IN: '#0284c7',
  OUT: '#8b5cf6'
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#ef4444',
  UNDER_REVIEW: '#f59e0b',
  CLOSED: '#10b981'
};

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({
  items,
  isOpen,
  onClose,
  onApplyFilter
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [activeTab, setActiveTab] = useState<'all' | 'network' | 'direction' | 'status'>('all');

  if (!isOpen) return null;

  const total = items.length;

  // 1. Network Data
  const sarCount = items.filter(i => i.network === 'SAR').length;
  const hhrCount = items.filter(i => i.network === 'HHR').length;
  const mmmpCount = items.filter(i => i.network === 'MMMP').length;

  const networkData = [
    { name: 'الخطوط الحديدية (SAR)', code: 'SAR', value: sarCount, color: NETWORK_COLORS.SAR },
    { name: 'قطار الحرمين (HHR)', code: 'HHR', value: hhrCount, color: NETWORK_COLORS.HHR },
    { name: 'قطار المشاعر (MMMP)', code: 'MMMP', value: mmmpCount, color: NETWORK_COLORS.MMMP }
  ].filter(d => d.value > 0);

  // 2. Direction Data
  const inCount = items.filter(i => i.direction === 'IN').length;
  const outCount = items.filter(i => i.direction === 'OUT').length;

  const directionData = [
    { name: 'الوارد (In-Coming)', code: 'IN', value: inCount, color: DIRECTION_COLORS.IN },
    { name: 'الصادر (Out-Going)', code: 'OUT', value: outCount, color: DIRECTION_COLORS.OUT }
  ].filter(d => d.value > 0);

  // 3. Status Data
  const openCount = items.filter(i => i.status === 'OPEN').length;
  const underReviewCount = items.filter(i => i.status === 'UNDER_REVIEW').length;
  const closedCount = items.filter(i => i.status === 'CLOSED').length;

  const statusData = [
    { name: 'مفتوح (Open)', code: 'OPEN', value: openCount, color: STATUS_COLORS.OPEN },
    { name: 'تحت المراجعة (Under Review)', code: 'UNDER_REVIEW', value: underReviewCount, color: STATUS_COLORS.UNDER_REVIEW },
    { name: 'مغلق ومؤرشف (Closed)', code: 'CLOSED', value: closedCount, color: STATUS_COLORS.CLOSED }
  ].filter(d => d.value > 0);

  // 4. Reply Status Data
  const needReplyCount = items.filter(i => i.requiresReply && i.status !== 'CLOSED').length;
  const noReplyCount = total - needReplyCount;
  const replyData = [
    { name: 'بانتظار الرد (Pending Reply)', value: needReplyCount, color: '#f97316' },
    { name: 'مكتمل / لا يتطلب رد (Resolved/None)', value: noReplyCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-sans border border-slate-700">
          <p className="font-bold mb-1">{data.name || data.payload?.name}</p>
          <p className="text-slate-300">
            العدد: <span className="font-bold text-white">{data.value} خطاب</span>
          </p>
          <p className="text-emerald-400">
            النسبة: <span className="font-bold">{percent}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#004e57] to-[#00707b] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <span>لوحة الإحصائيات والرسوم البيانية</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono font-medium">
                  {total} خطاب مسجل
                </span>
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                تحليل مرئي شامل لحركة الخطابات حسب النوع، الشبكة، والحالة التشغيلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Style Switcher */}
            <div className="bg-black/20 p-1 rounded-xl flex items-center gap-1 border border-white/10">
              <button
                onClick={() => setChartType('pie')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'pie'
                    ? 'bg-white text-[#00707b] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="عرض المخططات الدائرية (Pie Chart)"
              >
                <PieChartIcon className="w-4 h-4" />
                <span className="hidden sm:inline">دائري</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-[#00707b] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="عرض الأعمدة البيانية (Bar Chart)"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">أعمدة</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#00707b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              جميع الرسوم البيانية
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'network'
                  ? 'bg-[#00707b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              حسب الشبكة (SAR / HHR / MMMP)
            </button>
            <button
              onClick={() => setActiveTab('direction')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'direction'
                  ? 'bg-[#00707b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              حسب النوع والاتجاه (الوارد والصادر)
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-[#00707b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              حسب الحالة (مفتوح / مغلق)
            </button>
          </div>
        </div>

        {/* Charts Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold block">إجمالي الخطابات</span>
              <span className="text-xl font-black text-slate-800">{total}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-sky-600 font-bold block">الوارد (IN)</span>
              <span className="text-xl font-black text-sky-700">{inCount} <span className="text-xs font-normal text-slate-400">({total > 0 ? Math.round((inCount/total)*100) : 0}%)</span></span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-purple-600 font-bold block">الصادر (OUT)</span>
              <span className="text-xl font-black text-purple-700">{outCount} <span className="text-xs font-normal text-slate-400">({total > 0 ? Math.round((outCount/total)*100) : 0}%)</span></span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-emerald-600 font-bold block">المغلق (CLOSED)</span>
              <span className="text-xl font-black text-emerald-700">{closedCount} <span className="text-xs font-normal text-slate-400">({total > 0 ? Math.round((closedCount/total)*100) : 0}%)</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Distribution by Network */}
            {(activeTab === 'all' || activeTab === 'network') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00707b]" />
                    <span>توزيع الخطابات حسب الشبكة</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">SAR · HHR · MMMP</span>
                </div>

                <div className="h-64 w-full">
                  {chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-xs text-slate-700 font-medium px-1">{value}</span>}
                        />
                        <Pie
                          data={networkData}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {networkData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={networkData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {networkData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {networkData.map((item) => (
                    <div key={item.code} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 font-medium">{item.code}:</span>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart 2: Distribution by Direction / Type */}
            {(activeTab === 'all' || activeTab === 'direction') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-sky-600" />
                    <span>توزيع الخطابات حسب النوع والاتجاه</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">In-Coming vs Out-Going</span>
                </div>

                <div className="h-64 w-full">
                  {chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-xs text-slate-700 font-medium px-1">{value}</span>}
                        />
                        <Pie
                          data={directionData}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {directionData.map((entry, index) => (
                            <Cell key={`dir-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={directionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {directionData.map((entry, index) => (
                            <Cell key={`dir-bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-600" />
                    <span className="text-slate-600">الوارد (In):</span>
                    <span className="font-bold text-slate-900">{inCount} خطاب ({total > 0 ? Math.round((inCount/total)*100) : 0}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600" />
                    <span className="text-slate-600">الصادر (Out):</span>
                    <span className="font-bold text-slate-900">{outCount} خطاب ({total > 0 ? Math.round((outCount/total)*100) : 0}%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chart 3: Distribution by Status (Open vs Closed) */}
            {(activeTab === 'all' || activeTab === 'status') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>توزيع الخطابات حسب الحالة التشغيلية</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Open / Closed / Review</span>
                </div>

                <div className="h-64 w-full">
                  {chartType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-xs text-slate-700 font-medium px-1">{value}</span>}
                        />
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`status-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {statusData.map((entry, index) => (
                            <Cell key={`status-bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600">مفتوح:</span>
                    <span className="font-bold text-slate-900">{openCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">تحت المراجعة:</span>
                    <span className="font-bold text-slate-900">{underReviewCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">مغلق ومؤرشف:</span>
                    <span className="font-bold text-slate-900">{closedCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chart 4: Response Requirements */}
            {(activeTab === 'all' || activeTab === 'status') && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>حالة الردود والمتابعة الرسمية</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Action Deadlines</span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-xs text-slate-700 font-medium px-1">{value}</span>}
                      />
                      <Pie
                        data={replyData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {replyData.map((entry, index) => (
                          <Cell key={`reply-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-slate-600">يتطلب رد رسمي:</span>
                    <span className="font-bold text-slate-900">{needReplyCount} خطاب</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-600">مكتمل أو للإحاطة:</span>
                    <span className="font-bold text-slate-900">{noReplyCount} خطاب</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            تحديث البيانات مباشر وتلقائي بناءً على سجل الخطابات
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            إغلاق الإحصائيات
          </button>
        </div>

      </div>
    </div>
  );
};
