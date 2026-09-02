import React from 'react';
import { Search, Download, FileText, Printer, FileSpreadsheet } from 'lucide-react';
import { FilterState } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  totalFiltered: number;
  totalMaster: number;
  isLocked: boolean;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onExportExcel,
  onExportPDF,
  totalFiltered,
  totalMaster,
  isLocked,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  return (
    <div className="space-y-3 mb-6">
      {/* Filters Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-filter-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onFilterChange({ ...filters, searchQuery: e.target.value })
              }
              placeholder="ابحث برقم المرجع، الموضوع، الملاحظات، الجهة، أو المالك..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Network Filter */}
          <div className="lg:col-span-2">
            <select
              id="network-filter-select"
              value={filters.network}
              onChange={(e) =>
                onFilterChange({ ...filters, network: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-medium transition-all"
            >
              <option value="ALL">جميع الشبكات (SAR / HHR / MMMP)</option>
              <option value="SAR">شبكة الشمال والشرق (SAR)</option>
              <option value="HHR">قطار الحرمين السريع (HHR)</option>
              <option value="MMMP">قطار المشاعر المقدسة (MMMP)</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div className="lg:col-span-2">
            <select
              id="direction-filter-select"
              value={filters.direction}
              onChange={(e) =>
                onFilterChange({ ...filters, direction: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-medium transition-all"
            >
              <option value="ALL">الاتجاه (In / Out)</option>
              <option value="IN">الوارد فقط (In-Coming)</option>
              <option value="OUT">الصادر فقط (Out-Going)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              id="status-filter-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-medium transition-all"
            >
              <option value="ALL">جميع الحالات (All Status)</option>
              <option value="OPEN">مفتوح (Open / Pending Action)</option>
              <option value="UNDER_REVIEW">تحت المراجعة (Under Review)</option>
              <option value="CLOSED">مغلق ومؤرشف (Closed)</option>
            </select>
          </div>

          {/* Reply Filter & Export */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <select
              id="reply-filter-select"
              value={filters.replyRequired}
              onChange={(e) =>
                onFilterChange({ ...filters, replyRequired: e.target.value })
              }
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-medium transition-all"
            >
              <option value="ALL">حالة الرد (Reply Required)</option>
              <option value="YES">مطلوب رد رسمي</option>
              <option value="NO">للعلم والإحاطة (لا يتطلب رد)</option>
            </select>

            {/* Export Button with Dropdown */}
            <div className="relative shrink-0">
              <button
                id="export-btn"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden sm:inline">(Export) تصدير وحفظ</span>
                <span className="sm:hidden">تصدير</span>
              </button>

              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                  <button
                    onClick={() => {
                      onExportExcel();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>تصدير ملف Excel / CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportPDF();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-3 py-2 text-right text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>طباعة التقرير / PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Info Row */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
        <div>
          عرض <strong className="text-teal-800 font-mono">{totalFiltered}</strong> من إجمالي{' '}
          <strong className="text-slate-800 font-mono">{totalMaster}</strong> خطاب ومراسلة رسمية
        </div>
        <div className="text-slate-400">
          {isLocked ? (
            <span>وضع المعاينة فقط — يتطلب كلمة المرور لإجراء تعديلات</span>
          ) : (
            <span className="text-emerald-700 font-semibold">وضع المسؤول مفعل — يمكنك الإضافة والتعديل والحذف</span>
          )}
        </div>
      </div>
    </div>
  );
};
