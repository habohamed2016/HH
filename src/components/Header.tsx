import React from 'react';
import {
  Key,
  Share2,
  RefreshCw,
  FileSpreadsheet,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import { SARLogo } from './SARLogo';

interface HeaderProps {
  isLocked: boolean;
  onToggleSecurity: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenShareModal: () => void;
  onSync: () => void;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  isLocked,
  onToggleSecurity,
  onOpenAddModal,
  onOpenImportModal,
  onOpenShareModal,
  onSync,
  lastUpdated,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-5">
            {/* SAR Official-Style Logo Box */}
            <SARLogo />

            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#005F73] text-white shadow-xs">
                  CORRESPONDENCE REGISTER
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  SAR · HHR · MMMP
                </span>
                <button
                  id="security-pill-btn"
                  onClick={onToggleSecurity}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-rose-600" />
                  <span>{isLocked ? 'اضغط لإلغاء القفل / تعديل كلمة المرور' : 'الحماية مفعلة (جاهز للتعديل)'}</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                سجل المراسلات والخطابات الرسمية
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Official Centralized Tracking for In-Coming &amp; Out-Going Letters, Technical Notices &amp; Submittals
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            <button
              id="set-password-btn"
              onClick={onToggleSecurity}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-200 cursor-pointer"
            >
              <Key className="w-4 h-4 text-slate-600" />
              <span>(Set Password) إنشاء كلمة مرور</span>
            </button>

            <button
              id="share-btn"
              onClick={onOpenShareModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-200 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>(Share) مشاركة الرابط</span>
            </button>

            <button
              id="sync-btn"
              onClick={onSync}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-200 cursor-pointer"
              title="مزامنة وتحديث البيانات"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>Sync</span>
            </button>

            <button
              id="import-excel-btn"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-slate-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>(Excel) استيراد إكسل</span>
            </button>

            <button
              id="add-letter-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-700/20 hover:shadow-teal-700/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>(Log Letter) إضافة خطاب +</span>
            </button>
          </div>
        </div>

        {/* Sub-bar (Last Updated & Security Badge) */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>LAST UPDATED: <strong>{lastUpdated}</strong></span>
            <span>|</span>
            <span className="flex items-center gap-1">
              SECURITY:{' '}
              {isLocked ? (
                <strong className="text-amber-700 flex items-center gap-1">
                  <Lock className="w-3 h-3 inline" /> LOCKED (VIEW-ONLY)
                </strong>
              ) : (
                <strong className="text-emerald-700 flex items-center gap-1">
                  <Unlock className="w-3 h-3 inline" /> UNLOCKED (ADMIN MODE)
                </strong>
              )}
            </span>
          </div>
          <div className="text-slate-400 font-sans text-[11px]">
            نظام سجل الخطابات الموحد لشبكة الخطوط الحديدية
          </div>
        </div>
      </div>
    </header>
  );
};
