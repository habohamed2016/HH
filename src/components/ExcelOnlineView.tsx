import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Save,
  Grid,
  BarChart3,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  X,
  Edit2,
  Trash2,
  Eye
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
import { LetterItem, NetworkType, DirectionType, StatusType } from '../App';
import { exportStyledSARExcel } from '../utils/excelExporter';

interface ExcelOnlineViewProps {
  items: LetterItem[];
  onSaveItem: (data: Partial<LetterItem>) => void;
  onDeleteItem: (id: string) => void;
  onViewDetails: (item: LetterItem) => void;
  onClose?: () => void;
}

const NETWORK_COLORS: Record<string, string> = {
  SAR: '#00707b',
  HHR: '#d97706',
  MMMP: '#2563eb'
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#ef4444',
  UNDER_REVIEW: '#f59e0b',
  CLOSED: '#10b981'
};

export const ExcelOnlineView: React.FC<ExcelOnlineViewProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onViewDetails,
}) => {
  const [activeSheet, setActiveSheet] = useState<'dashboard' | 'letters'>('letters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCell, setSelectedCell] = useState<{ id: string; field: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof LetterItem; value: string } | null>(null);
  const [formulaBarText, setFormulaBarText] = useState('SUM(Letters[Total]) = ' + items.length);

  // Metrics
  const totalLetters = items.length;
  const inLetters = items.filter(i => i.direction === 'IN').length;
  const outLetters = items.filter(i => i.direction === 'OUT').length;
  const openLetters = items.filter(i => i.status === 'OPEN').length;
  const closedLetters = items.filter(i => i.status === 'CLOSED').length;
  const reviewLetters = items.filter(i => i.status === 'UNDER_REVIEW').length;
  const reqReplyLetters = items.filter(i => i.requiresReply).length;

  // Chart data
  const networkData = [
    { name: 'SAR العامة', value: items.filter(i => i.network === 'SAR').length, color: '#00707b' },
    { name: 'قطار الحرمين (HHR)', value: items.filter(i => i.network === 'HHR').length, color: '#d97706' },
    { name: 'قطار المشاعر (MMMP)', value: items.filter(i => i.network === 'MMMP').length, color: '#2563eb' },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'مفتوح (Open)', count: openLetters, fill: '#ef4444' },
    { name: 'مغلق (Closed)', count: closedLetters, fill: '#10b981' },
    { name: 'تحت المراجعة (Review)', count: reviewLetters, fill: '#f59e0b' },
  ];

  const filteredItems = items.filter(item => {
    const matchSearch =
      item.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sender && item.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.recipient && item.recipient.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchNet = selectedNetwork === 'ALL' || item.network === selectedNetwork;
    const matchStat = selectedStatus === 'ALL' || item.status === selectedStatus;

    return matchSearch && matchNet && matchStat;
  });

  const handleCellDoubleClick = (item: LetterItem, field: keyof LetterItem) => {
    setSelectedCell({ id: item.id, field });
    setEditingCell({
      id: item.id,
      field,
      value: String(item[field] || '')
    });
    setFormulaBarText(`=${field.toUpperCase()}("${item[field] || ''}")`);
  };

  const handleCellSave = () => {
    if (editingCell) {
      const itemToUpdate = items.find(i => i.id === editingCell.id);
      if (itemToUpdate) {
        onSaveItem({
          id: editingCell.id,
          [editingCell.field]: editingCell.value
        });
      }
      setEditingCell(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden flex flex-col font-sans" dir="rtl">
      
      {/* Excel Ribbon Top Header */}
      <div className="bg-[#107c41] text-white px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">Excel Online (SAR Edition)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white font-mono">سحابي مباشر</span>
            </div>
            <p className="text-[11px] text-emerald-100">سجل المراسلات والخطابات الرسمية — الشركة السعودية للخطوط الحديدية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStyledSARExcel(items)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#107c41] hover:bg-emerald-50 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="تحميل ملف إكسل رسمي منسق بالكامل (.xlsx)"
          >
            <Download className="w-4 h-4" />
            <span>تصدير ملف Excel منسق (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Excel Toolbar & Controls */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Sheet Selector Pills */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveSheet('letters')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                activeSheet === 'letters'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>📋 ورقة المراسلات (Letters Log)</span>
            </button>
            <button
              onClick={() => setActiveSheet('dashboard')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                activeSheet === 'dashboard'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>📊 لوحة المؤشرات والرسومات (Dashboard)</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Search Box in Excel Toolbar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في خلايا الإكسل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 pl-3 py-1 bg-white border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700"
          >
            <option value="ALL">جميع الشبكات</option>
            <option value="SAR">SAR العامة</option>
            <option value="HHR">قطار الحرمين (HHR)</option>
            <option value="MMMP">قطار المشاعر (MMMP)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-700"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="OPEN">مفتوح (OPEN)</option>
            <option value="CLOSED">مغلق (CLOSED)</option>
            <option value="UNDER_REVIEW">تحت المراجعة</option>
          </select>
        </div>
      </div>

      {/* Excel Formula Bar (fx) */}
      <div className="bg-white border-b border-slate-200 px-3 py-1 flex items-center gap-2 text-xs">
        <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {selectedCell ? `${selectedCell.field.toUpperCase()}` : 'A1'}
        </span>
        <span className="font-serif italic font-bold text-emerald-700 px-1">fx</span>
        <div className="h-4 w-px bg-slate-200" />
        <input
          type="text"
          value={editingCell ? editingCell.value : formulaBarText}
          onChange={(e) => {
            if (editingCell) {
              setEditingCell({ ...editingCell, value: e.target.value });
            } else {
              setFormulaBarText(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellSave();
            }
          }}
          className="flex-1 bg-transparent border-none text-xs text-slate-800 font-mono focus:outline-none"
        />
        {editingCell && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCellSave}
              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
            >
              حفظ (Enter)
            </button>
            <button
              onClick={() => setEditingCell(null)}
              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px]"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeSheet === 'letters' ? (
        /* ==================== SPREADSHEET TABLE ==================== */
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-right border-collapse text-xs">
            {/* Column Letter Identifiers Header */}
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-500 font-mono text-[11px]">
                <th className="w-10 px-2 py-1 text-center bg-slate-200 border-l border-slate-300">#</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">A (رقم المرجع)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">B (التاريخ)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">C (الشبكة)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">D (النوع)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">E (المرسل)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">F (المستلم)</th>
                <th className="px-4 py-1 text-center border-l border-slate-300">G (موضوع الخطاب)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">H (الحالة)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">I (مطلوب رد)</th>
                <th className="px-3 py-1 text-center border-l border-slate-300">J (مهلة الرد)</th>
                <th className="px-4 py-1 text-center">K (الملاحظات)</th>
              </tr>
              {/* Actual Title Headers in Dark SAR Teal */}
              <tr className="bg-[#00707b] text-white font-bold border-b border-slate-300">
                <th className="w-10 px-2 py-2 text-center bg-[#005a63] border-l border-[#005a63]">م</th>
                <th className="px-3 py-2 border-l border-teal-700">رقم المرجع (Ref No)</th>
                <th className="px-3 py-2 border-l border-teal-700">التاريخ</th>
                <th className="px-3 py-2 border-l border-teal-700">الشبكة</th>
                <th className="px-3 py-2 border-l border-teal-700">النوع</th>
                <th className="px-3 py-2 border-l border-teal-700">الجهة المرسلة</th>
                <th className="px-3 py-2 border-l border-teal-700">الجهة المستلمة</th>
                <th className="px-4 py-2 border-l border-teal-700">موضوع الخطاب</th>
                <th className="px-3 py-2 border-l border-teal-700">الحالة التشغيلية</th>
                <th className="px-3 py-2 border-l border-teal-700">مطلوب رد؟</th>
                <th className="px-3 py-2 border-l border-teal-700">مهلة الرد</th>
                <th className="px-4 py-2">الملاحظات والتفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-bold bg-slate-50">
                    لا توجد خطابات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = selectedCell?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-200 transition-colors hover:bg-emerald-50/50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      {/* Row Index Number */}
                      <td className="px-2 py-2 text-center font-mono font-bold bg-slate-100 text-slate-600 border-l border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Ref Number (Col A) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'refNumber')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'refNumber' })}
                        className={`px-3 py-2 font-mono font-bold text-slate-900 border-l border-slate-200 cursor-cell ${
                          isSelected && selectedCell.field === 'refNumber' ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                        }`}
                        dir="ltr"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'refNumber' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingCell.value}
                            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                            onBlur={handleCellSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                            className="w-full bg-white border border-emerald-500 px-1 py-0.5 text-xs font-mono rounded"
                          />
                        ) : (
                          item.refNumber
                        )}
                      </td>

                      {/* Date (Col B) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'date')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'date' })}
                        className="px-3 py-2 font-mono text-slate-700 border-l border-slate-200 text-center cursor-cell"
                      >
                        {item.date}
                      </td>

                      {/* Network (Col C) */}
                      <td className="px-3 py-2 border-l border-slate-200 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.network === 'SAR' ? 'bg-teal-100 text-[#00707b]' :
                            item.network === 'HHR' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.network}
                        </span>
                      </td>

                      {/* Direction (Col D) */}
                      <td className="px-3 py-2 border-l border-slate-200 text-center font-bold">
                        <span className={item.direction === 'IN' ? 'text-sky-700' : 'text-purple-700'}>
                          {item.direction === 'IN' ? '📥 وارد' : '📤 صادر'}
                        </span>
                      </td>

                      {/* Sender (Col E) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'sender')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'sender' })}
                        className="px-3 py-2 border-l border-slate-200 text-slate-800 cursor-cell"
                      >
                        {item.sender || '—'}
                      </td>

                      {/* Recipient (Col F) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'recipient')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'recipient' })}
                        className="px-3 py-2 border-l border-slate-200 text-slate-800 cursor-cell"
                      >
                        {item.recipient || '—'}
                      </td>

                      {/* Subject (Col G) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'subject')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'subject' })}
                        className={`px-4 py-2 border-l border-slate-200 font-bold text-slate-900 cursor-cell max-w-xs truncate ${
                          isSelected && selectedCell.field === 'subject' ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                        }`}
                        title={item.subject}
                      >
                        {editingCell?.id === item.id && editingCell.field === 'subject' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingCell.value}
                            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                            onBlur={handleCellSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                            className="w-full bg-white border border-emerald-500 px-1 py-0.5 text-xs rounded"
                          />
                        ) : (
                          item.subject
                        )}
                      </td>

                      {/* Status (Col H) */}
                      <td className="px-3 py-2 border-l border-slate-200 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'OPEN' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            item.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.status === 'OPEN' ? 'مفتوح' : item.status === 'CLOSED' ? 'مغلق' : 'تحت المراجعة'}
                        </span>
                      </td>

                      {/* Requires Reply (Col I) */}
                      <td className="px-3 py-2 border-l border-slate-200 text-center font-bold">
                        {item.requiresReply ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">⚡ نعم</span>
                        ) : (
                          <span className="text-slate-400">لا</span>
                        )}
                      </td>

                      {/* Deadline (Col J) */}
                      <td className="px-3 py-2 border-l border-slate-200 text-center font-mono text-slate-600">
                        {item.replyDeadline || '—'}
                      </td>

                      {/* Notes (Col K) */}
                      <td
                        onDoubleClick={() => handleCellDoubleClick(item, 'notes')}
                        onClick={() => setSelectedCell({ id: item.id, field: 'notes' })}
                        className="px-4 py-2 text-slate-600 max-w-xs truncate cursor-cell"
                        title={item.notes}
                      >
                        {item.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ==================== DASHBOARD & CHARTS SHEET ==================== */
        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto bg-slate-50">
          
          {/* Top Banner */}
          <div className="bg-[#00707b] text-white p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold">لوحة المؤشرات والرسومات البيانية الشاملة</h2>
              <p className="text-xs text-teal-100">تحليل لحظي لمراسلات وخطابات شبكات قطارات الخطوط الحديدية السعودية</p>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold">
              إجمالي الخطابات: {totalLetters}
            </span>
          </div>

          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-teal-200 shadow-2xs">
              <span className="text-[11px] font-bold text-teal-800 block mb-1">📌 إجمالي الخطابات</span>
              <span className="text-2xl font-black text-teal-900 font-mono">{totalLetters}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-800 block mb-1">📥 الوارد (IN)</span>
              <span className="text-2xl font-black text-sky-900 font-mono">{inLetters}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
              <span className="text-[11px] font-bold text-purple-800 block mb-1">📤 الصادر (OUT)</span>
              <span className="text-2xl font-black text-purple-900 font-mono">{outLetters}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-800 block mb-1">🔴 مفتوح (Open)</span>
              <span className="text-2xl font-black text-rose-900 font-mono">{openLetters}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 block mb-1">🟢 مغلق ومنجز</span>
              <span className="text-2xl font-black text-emerald-900 font-mono">{closedLetters}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 block mb-1">⚡ يتطلب رداً</span>
              <span className="text-2xl font-black text-amber-900 font-mono">{reqReplyLetters}</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: By Network */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00707b]" />
                <span>توزيع الخطابات حسب الشبكة التشغيلية</span>
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={networkData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {networkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: By Status */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#00707b]" />
                <span>متابعة الخطابات حسب الحالة التشغيلية</span>
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="عدد الخطابات" radius={[6, 6, 0, 0]} fill="#00707b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Excel Bottom Sheet Tabs Bar */}
      <div className="bg-slate-100 border-t border-slate-300 px-3 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSheet('letters')}
            className={`px-4 py-1.5 rounded-t-lg font-bold border-t-2 text-xs transition-all ${
              activeSheet === 'letters'
                ? 'bg-white border-[#107c41] text-[#107c41] shadow-xs'
                : 'bg-slate-200/80 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            📋 سجل المراسلات (Letters Log)
          </button>
          <button
            onClick={() => setActiveSheet('dashboard')}
            className={`px-4 py-1.5 rounded-t-lg font-bold border-t-2 text-xs transition-all ${
              activeSheet === 'dashboard'
                ? 'bg-white border-[#107c41] text-[#107c41] shadow-xs'
                : 'bg-slate-200/80 border-transparent text-slate-600 hover:bg-slate-200'
            }`}
          >
            📊 لوحة المؤشرات والرسومات (Dashboard)
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
          <span>جاهز (Ready)</span>
          <span>•</span>
          <span>المعروض: {filteredItems.length} من أصل {items.length}</span>
        </div>
      </div>

    </div>
  );
};
