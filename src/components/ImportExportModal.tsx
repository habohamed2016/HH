import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from 'lucide-react';
import { CorrespondenceItem, NetworkType, DirectionType, CategoryType, StatusType } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: CorrespondenceItem[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [previewItems, setPreviewItems] = useState<CorrespondenceItem[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvHeader = 'Reference,Date,Network,Direction,Category,Sender,Recipient,Subject,Status,RequiresReply,Notes\n';
    const sampleRow = 'SAR-CR-2026-0099,2026-09-02,SAR,IN,LETTER,الهيئة العامة للنقل,الإدارة العامة,موضوع الخطاب الرسمي,OPEN,YES,ملاحظات المتابعة\n';
    const blob = new Blob([csvHeader + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'SAR_Correspondence_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setError('الملف لا يحتوي على بيانات كافية.');
        return;
      }

      const parsed: CorrespondenceItem[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 7) {
          const item: CorrespondenceItem = {
            id: 'imp-' + Date.now() + '-' + i,
            refNumber: parts[0]?.trim() || `SAR-CR-2026-${1000 + i}`,
            date: parts[1]?.trim() || new Date().toISOString().split('T')[0],
            network: (['SAR', 'HHR', 'MMMP'].includes(parts[2]?.trim().toUpperCase()) ? parts[2]?.trim().toUpperCase() : 'SAR') as NetworkType,
            direction: (parts[3]?.trim().toUpperCase() === 'OUT' ? 'OUT' : 'IN') as DirectionType,
            category: 'LETTER' as CategoryType,
            sender: parts[5]?.trim() || 'الجهة المرسلة',
            recipient: parts[6]?.trim() || 'الجهة المستلمة',
            subject: parts[7]?.trim() || 'موضوع المعاملة',
            status: (['OPEN', 'CLOSED', 'UNDER_REVIEW'].includes(parts[8]?.trim().toUpperCase()) ? parts[8]?.trim().toUpperCase() : 'OPEN') as StatusType,
            requiresReply: parts[9]?.trim().toUpperCase() === 'YES' || parts[9]?.trim() === 'نعم',
            notes: parts[10]?.trim() || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          parsed.push(item);
        }
      }

      if (parsed.length === 0) {
        setError('تعذر قراءة الصفوف بشكل صحيح. يرجى التأكد من مطابقة التنسيق للقالب.');
      } else {
        setError('');
        setPreviewItems(parsed);
      }
    } catch {
      setError('حدث خطأ أثناء معالجة الملف.');
    }
  };

  const handleConfirmImport = () => {
    if (previewItems.length > 0) {
      onImport(previewItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">استيراد خطابات من ملف Excel / CSV</h2>
              <p className="text-xs text-slate-500">إضافة دفعات من سجلات المراسلات دفعة واحدة</p>
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
        <div className="p-6 space-y-4">
          {/* Template Download */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-700">
              <span className="font-bold block text-slate-900">قالب ملف Excel / CSV المعتمد</span>
              <span>قم بتحميل القالب وتعبئته ثم رفعه هنا للحصول على أفضل نتيجة.</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل القالب</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-600 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-teal-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">اختر ملف CSV أو Excel من جهازك</p>
            <p className="text-[11px] text-slate-500 mt-1">يدعم ملفات .csv و .txt بالتنسيق المجدول</p>
            <label className="mt-3 inline-block px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs">
              <span>تحديد الملف</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewItems.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
              ✓ تم التعرف على {previewItems.length} خطاباً بنجاح وجاهزة للاستيراد.
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={previewItems.length === 0}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>استيراد السجلات ({previewItems.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
