import React from 'react';
import { X, FileText, Calendar, Building, Clock, CheckCircle2, AlertCircle, Inbox, Send, Paperclip } from 'lucide-react';
import { CorrespondenceItem } from '../types';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CorrespondenceItem | null;
  onEdit: (item: CorrespondenceItem) => void;
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono text-left" dir="ltr">
                  {item.refNumber}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 font-mono">
                  {item.network}
                </span>
              </div>
              <p className="text-xs text-slate-500">تفاصيل وسجل المعاملة الرسمية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Subject Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              موضوع الخطاب / المعاملة
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-relaxed">
              {item.subject}
            </h3>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> التاريخ:
              </span>
              <p className="text-sm font-bold text-slate-800 font-mono">{item.date}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                {item.direction === 'IN' ? <Inbox className="w-3.5 h-3.5 text-sky-600" /> : <Send className="w-3.5 h-3.5 text-indigo-600" />}
                الاتجاه والنوع:
              </span>
              <p className="text-sm font-bold text-slate-800">
                {item.direction === 'IN' ? 'وارد (In-Coming)' : 'صادر (Out-Going)'} — {item.category}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Building className="w-3.5 h-3.5 text-slate-500" /> الجهة المرسلة:
              </span>
              <p className="text-sm font-bold text-slate-800">{item.sender || '—'}</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Building className="w-3.5 h-3.5 text-slate-500" /> الجهة المستلمة:
              </span>
              <p className="text-sm font-bold text-slate-800">{item.recipient || '—'}</p>
            </div>
          </div>

          {/* Status & Reply Info */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1 font-semibold">حالة المعاملة الحالية:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-white border border-slate-200 text-slate-800 shadow-xs">
                {item.status === 'OPEN' && <Clock className="w-3.5 h-3.5 text-rose-600" />}
                {item.status === 'CLOSED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {item.status === 'UNDER_REVIEW' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                <span>
                  {item.status === 'OPEN' && 'مفتوح (Open / Pending Action)'}
                  {item.status === 'CLOSED' && 'مغلق ومؤرشف (Closed)'}
                  {item.status === 'UNDER_REVIEW' && 'تحت المراجعة والتدقيق (Under Review)'}
                </span>
              </span>
            </div>

            {item.requiresReply && (
              <div className="bg-amber-100/60 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block">مطلوب رد رسمي</span>
                {item.replyDeadline && <span>الموعد المحدد: <strong>{item.replyDeadline}</strong></span>}
              </div>
            )}
          </div>

          {/* Notes */}
          {item.notes && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 block mb-1">الملاحظات والتوصيات:</span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            تعديل الخطاب
          </button>
        </div>
      </div>
    </div>
  );
};
