import React, { useState } from 'react';
import { X, Lock, Unlock, KeyRound, ShieldCheck } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  currentPassword: string;
  onSetPassword: (password: string) => void;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  isLocked,
  currentPassword,
  onSetPassword,
  onUnlock,
  onLock,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = onUnlock(passwordInput);
    if (success) {
      setSuccessMsg('تم إلغاء القفل وتفعيل وضع المسؤول بنجاح!');
      setPasswordInput('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } else {
      setErrorMsg('كلمة المرور غير صحيحة! يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      setErrorMsg('يرجى إدخال كلمة مرور صالحة.');
      return;
    }
    onSetPassword(newPasswordInput.trim());
    setSuccessMsg('تم تعيين وحفظ كلمة مرور الحماية بنجاح!');
    setNewPasswordInput('');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                حماية وأمان سجل المراسلات
              </h2>
              <p className="text-xs text-slate-500">التحكم في صلاحيات التعديل والإضافة</p>
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
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLocked ? (
            /* Unlock Form */
            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                <strong>النظام حالياً في وضع المعاينة فقط (View-Only).</strong> أدخل كلمة المرور لإلغاء القفل وتعديل السجلات.
                {!currentPassword && (
                  <div className="mt-1 text-slate-600">
                    *(ملاحظة: لم يتم تعيين كلمة مرور بعد، يمكنك إدخال <strong>admin</strong> أو تعيين كلمة مرور جديدة أدناه)*
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أدخل كلمة المرور لإلغاء القفل:
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="كلمة المرور..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>إلغاء القفل وتفعيل التعديل</span>
                </button>
              </div>
            </form>
          ) : (
            /* Locked Status and Change Password */
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <strong className="block font-bold">وضع المسؤول مفعل حالياً</strong>
                  <span className="text-slate-600">يمكنك إجراء التعديلات والإضافة بحرية.</span>
                </div>
                <button
                  onClick={() => {
                    onLock();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  قفل النظام الآن
                </button>
              </div>

              {/* Set New Password Form */}
              <form onSubmit={handleSetNewPassword} className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  تعيين كلمة مرور جديدة لحماية السجل:
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>حفظ كلمة المرور وتأمين النظام</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
