import React, { useState, useEffect } from 'react';
import { X, Save, Plus, FileText, Check } from 'lucide-react';
import { CorrespondenceItem, NetworkType, DirectionType, CategoryType, StatusType } from '../types';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<CorrespondenceItem>) => void;
  initialData?: CorrespondenceItem | null;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [refNumber, setRefNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [network, setNetwork] = useState<NetworkType>('SAR');
  const [direction, setDirection] = useState<DirectionType>('IN');
  const [category, setCategory] = useState<CategoryType>('LETTER');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<StatusType>('OPEN');
  const [requiresReply, setRequiresReply] = useState(false);
  const [replyDeadline, setReplyDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentsCount, setAttachmentsCount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setRefNumber(initialData.refNumber);
      setDate(initialData.date);
      setNetwork(initialData.network);
      setDirection(initialData.direction);
      setCategory(initialData.category);
      setSender(initialData.sender);
      setRecipient(initialData.recipient);
      setSubject(initialData.subject);
      setStatus(initialData.status);
      setRequiresReply(initialData.requiresReply);
      setReplyDeadline(initialData.replyDeadline || '');
      setNotes(initialData.notes || '');
      setAttachmentsCount(initialData.attachmentsCount || 0);
    } else {
      // Auto-generate realistic reference number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setRefNumber(`SAR-CR-2026-${randomNum}`);
      setDate(new Date().toISOString().split('T')[0]);
      setNetwork('SAR');
      setDirection('IN');
      setCategory('LETTER');
      setSender('');
      setRecipient('');
      setSubject('');
      setStatus('OPEN');
      setRequiresReply(false);
      setReplyDeadline('');
      setNotes('');
      setAttachmentsCount(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim() || !subject.trim()) {
      alert('يرجى ملء رقم المرجع والموضوع كحد أدنى.');
      return;
    }

    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      refNumber: refNumber.trim(),
      date,
      network,
      direction,
      category,
      sender: sender.trim() || (direction === 'IN' ? 'جهة خارجية' : 'الخطوط الحديدية السعودية'),
      recipient: recipient.trim() || (direction === 'OUT' ? 'جهة خارجية' : 'الإدارة العامة للمشاريع'),
      subject: subject.trim(),
      status,
      requiresReply,
      replyDeadline: requiresReply ? replyDeadline : undefined,
      notes: notes.trim(),
      attachmentsCount: Number(attachmentsCount) || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? 'تعديل بيانات الخطاب / المراسلة' : 'إضافة وتسجيل خطاب جديد (Log Letter)'}
              </h2>
              <p className="text-xs text-slate-500">سجل الخطابات والمراسلات الرسمية - SAR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم المرجع (Reference No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="SAR-CR-2026-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden text-left"
                dir="ltr"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التاريخ (Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                required
              />
            </div>

            {/* Network / Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشبكة / المشروع (Network)
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as NetworkType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-bold"
              >
                <option value="SAR">الخطوط الحديدية السعودية (SAR)</option>
                <option value="HHR">قطار الحرمين السريع (HHR)</option>
                <option value="MMMP">قطار المشاعر المقدسة (MMMP)</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الاتجاه (Direction)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('IN')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    direction === 'IN'
                      ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  وارد (In-Coming)
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('OUT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    direction === 'OUT'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  صادر (Out-Going)
                </button>
              </div>
            </div>

            {/* Sender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الجهة المرسلة (Sender / From)
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="مثال: الهيئة العامة للنقل / الاستشاري"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              />
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الجهة المستلمة (Recipient / To)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="مثال: إدارة هندسة السكة والأنظمة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              موضوع الخطاب (Subject) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="اكتب موضوع الخطاب أو الإشعار الفني بوضوح..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الحالة (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-medium"
              >
                <option value="OPEN">مفتوح (Open / Action Required)</option>
                <option value="UNDER_REVIEW">تحت المراجعة (Under Review)</option>
                <option value="CLOSED">مغلق ومؤرشف (Closed)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تصنيف المعاملة
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-medium"
              >
                <option value="LETTER">خطاب رسمي (Official Letter)</option>
                <option value="TECHNICAL_NOTICE">إشعار فني (Technical Notice)</option>
                <option value="SUBMITTAL">تقديم واعتماد (Submittal)</option>
                <option value="MOM">محضر اجتماع (Minutes of Meeting)</option>
                <option value="CIRCULAR">تعميم إداري (Circular)</option>
              </select>
            </div>

            {/* Attachments Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عدد المرفقات
              </label>
              <input
                type="number"
                min="0"
                value={attachmentsCount}
                onChange={(e) => setAttachmentsCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Reply Requirements */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresReplyCheck"
                checked={requiresReply}
                onChange={(e) => setRequiresReply(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="requiresReplyCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                يتطلب رداً رسمياً أو إجراء من الطرف الآخر؟
              </label>
            </div>

            {requiresReply && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الموعد النهائي للرد (Target Reply Date)
                  </label>
                  <input
                    type="date"
                    value={replyDeadline}
                    onChange={(e) => setReplyDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الملاحظات والتوصيات (Notes &amp; Remarks)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية، أرقام تتبع، أو تفاصيل المتابعة..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-700/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'حفظ التعديلات' : 'تسجيل الخطاب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
