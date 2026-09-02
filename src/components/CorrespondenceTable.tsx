import React from 'react';
import {
  ArrowUpDown,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Inbox,
  Send,
  Plus,
} from 'lucide-react';
import { CorrespondenceItem } from '../types';

interface CorrespondenceTableProps {
  items: CorrespondenceItem[];
  onViewDetails: (item: CorrespondenceItem) => void;
  onEditItem: (item: CorrespondenceItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
  isLocked: boolean;
}

export const CorrespondenceTable: React.FC<CorrespondenceTableProps> = ({
  items,
  onViewDetails,
  onEditItem,
  onDeleteItem,
  onOpenAddModal,
  isLocked,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">لا توجد مراسلات مطابقة للبحث</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          لم يتم العثور على أي خطابات بناءً على معايير الفلترة الحالية. يمكنك تعديل خيارات البحث أو إضافة خطاب جديد.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خطاب جديد الآن</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 font-mono">
                <div className="flex items-center gap-1 justify-start">
                  <span>رقم المرجع (REF)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">
                <div className="flex items-center gap-1 justify-start">
                  <span>التاريخ (DATE)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">
                <div className="flex items-center gap-1 justify-start">
                  <span>الشبكة (NETWORK)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">
                <div className="flex items-center gap-1 justify-start">
                  <span>النوع (IN-OUT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[280px]">
                <div className="flex items-center gap-1 justify-start">
                  <span>الموضوع (SUBJECT)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">
                <div className="flex items-center gap-1 justify-start">
                  <span>الحالة (STATUS)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[200px]">الملاحظات (NOTES / REMARKS)</th>
              <th className="py-3 px-3 text-center no-print">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              // Status Badge styling
              let statusBadge = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  <Clock className="w-3 h-3" /> قيد الإجراء
                </span>
              );
              if (item.status === 'OPEN') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Clock className="w-3 h-3" /> مفتوح (Open)
                  </span>
                );
              } else if (item.status === 'CLOSED') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> مغلق (Closed)
                  </span>
                );
              } else if (item.status === 'UNDER_REVIEW') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3" /> تحت المراجعة
                  </span>
                );
              }

              // Network Badge styling
              let networkBadge = (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                  {item.network}
                </span>
              );
              if (item.network === 'SAR') {
                networkBadge = (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 font-mono border border-teal-200">
                    SAR
                  </span>
                );
              } else if (item.network === 'HHR') {
                networkBadge = (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 font-mono border border-sky-200">
                    HHR
                  </span>
                );
              } else if (item.network === 'MMMP') {
                networkBadge = (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 font-mono border border-indigo-200">
                    MMMP
                  </span>
                );
              }

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-xs text-left" dir="ltr">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="hover:text-teal-700 hover:underline cursor-pointer"
                    >
                      {item.refNumber}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {networkBadge}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {item.direction === 'IN' ? (
                      <span className="inline-flex items-center gap-1 text-sky-700 font-bold text-xs">
                        <Inbox className="w-3.5 h-3.5" /> وارد (In)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold text-xs">
                        <Send className="w-3.5 h-3.5" /> صادر (Out)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <button
                        onClick={() => onViewDetails(item)}
                        className="font-bold text-slate-900 hover:text-teal-700 text-right block leading-snug cursor-pointer"
                      >
                        {item.subject}
                      </button>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>من: <strong className="text-slate-700">{item.sender}</strong></span>
                        <span>➔</span>
                        <span>إلى: <strong className="text-slate-700">{item.recipient}</strong></span>
                        {item.requiresReply && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            مطلوب رد {item.replyDeadline ? `قبل ${item.replyDeadline}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {statusBadge}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600">
                    <p className="line-clamp-2">{item.notes || '—'}</p>
                    {item.attachmentsCount && item.attachmentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Paperclip className="w-3 h-3" />
                        {item.attachmentsCount} مرفقات
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 cursor-pointer"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100 cursor-pointer"
                        title="تعديل الخطاب"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-slate-100 cursor-pointer"
                        title="حذف الخطاب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
