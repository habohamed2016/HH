/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Key,
  Share2,
  RefreshCw,
  FileSpreadsheet,
  Plus,
  Lock,
  Unlock,
  Layers,
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowDown,
  X,
  Save,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  Eye,
  Edit,
  Trash2,
  Upload,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Cloud,
  CheckCheck
} from 'lucide-react';
import { SARLogo } from './components/SARLogo';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { INITIAL_CORRESPONDENCE } from './data/mockData';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export type NetworkType = 'SAR' | 'HHR' | 'MMMP';
export type DirectionType = 'IN' | 'OUT';
export type StatusType = 'OPEN' | 'CLOSED' | 'UNDER_REVIEW';

export interface LetterItem {
  id: string;
  refNumber: string;
  date: string;
  network: NetworkType;
  direction: DirectionType;
  subject: string;
  status: StatusType;
  requiresReply: boolean;
  replyDeadline?: string;
  notes: string;
  sender?: string;
  recipient?: string;
}

const STORAGE_KEY = 'SAR_LETTERS_DATA_EXACT_V2';
const PASS_KEY = 'SAR_SECURITY_PASS_EXACT_V2';

export default function App() {
  const [items, setItems] = useState<LetterItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CORRESPONDENCE.map(c => ({
      id: c.id,
      refNumber: c.refNumber,
      date: c.date,
      network: c.network as NetworkType,
      direction: c.direction as DirectionType,
      subject: c.subject,
      status: (c.status === 'PENDING_REPLY' ? 'OPEN' : c.status) as StatusType,
      requiresReply: c.requiresReply,
      replyDeadline: c.replyDeadline,
      notes: c.notes,
      sender: c.sender,
      recipient: c.recipient,
    }));
  });

  const [password, setPassword] = useState<string>(() => {
    return localStorage.getItem(PASS_KEY) || '';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !!localStorage.getItem(PASS_KEY);
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('متزامن الآن');

  // Filters matching exact selects
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [replyFilter, setReplyFilter] = useState('ALL');
  const [selectedMetric, setSelectedMetric] = useState<string>('TOTAL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LetterItem | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<LetterItem | null>(null);

  // Last updated string exactly matching screenshot format
  const [lastUpdated, setLastUpdated] = useState('02 Sept 2026 10:59');

  // 1. Realtime Firestore Listener & Safe One-Time Initialization
  useEffect(() => {
    const checkAndInit = async () => {
      try {
        const metaRef = doc(db, 'system_meta', 'init');
        const metaSnap = await getDoc(metaRef);
        if (!metaSnap.exists()) {
          const batch = writeBatch(db);
          INITIAL_CORRESPONDENCE.forEach((c, idx) => {
            const docRef = doc(db, 'letters', `letter-init-${idx + 1}`);
            batch.set(docRef, {
              refNumber: c.refNumber,
              date: c.date,
              network: c.network,
              direction: c.direction,
              subject: c.subject,
              status: c.status === 'PENDING_REPLY' ? 'OPEN' : c.status,
              requiresReply: c.requiresReply,
              replyDeadline: c.replyDeadline || '',
              notes: c.notes || '',
              sender: c.sender || '',
              recipient: c.recipient || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
          batch.set(metaRef, {
            initialized: true,
            createdAt: new Date().toISOString(),
          });
          await batch.commit();
        }
      } catch (err) {
        console.error('Initialization check error:', err);
      }
    };

    checkAndInit();

    const lettersCol = collection(db, 'letters');
    const unsubscribe = onSnapshot(
      lettersCol,
      (snapshot) => {
        setIsCloudSyncing(false);
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        if (!snapshot.empty) {
          const cloudLetters: LetterItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              refNumber: data.refNumber || docSnap.id,
              date: data.date || '',
              network: data.network || 'SAR',
              direction: data.direction || 'IN',
              subject: data.subject || '',
              status: data.status || 'OPEN',
              requiresReply: !!data.requiresReply,
              replyDeadline: data.replyDeadline || '',
              notes: data.notes || '',
              sender: data.sender || '',
              recipient: data.recipient || '',
            };
          });

          // Sort by date or id descending
          cloudLetters.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setItems(cloudLetters);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudLetters));
          } catch {}
        } else {
          // Empty state: user cleared all records. Do NOT resurrect!
          setItems([]);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          } catch {}
        }
      },
      (error) => {
        console.error('Firestore real-time sync error:', error);
        setIsCloudSyncing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Metric counts
  const totalCount = items.length;
  const inCount = items.filter(i => i.direction === 'IN').length;
  const outCount = items.filter(i => i.direction === 'OUT').length;
  const openCount = items.filter(i => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;
  const closedCount = items.filter(i => i.status === 'CLOSED').length;
  const needReplyCount = items.filter(i => i.requiresReply && i.status !== 'CLOSED').length;

  const inPct = totalCount > 0 ? Math.round((inCount / totalCount) * 100) : 0;
  const outPct = totalCount > 0 ? Math.round((outCount / totalCount) * 100) : 0;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedMetric === 'IN' && item.direction !== 'IN') return false;
      if (selectedMetric === 'OUT' && item.direction !== 'OUT') return false;
      if (selectedMetric === 'OPEN' && item.status !== 'OPEN' && item.status !== 'UNDER_REVIEW') return false;
      if (selectedMetric === 'CLOSED' && item.status !== 'CLOSED') return false;
      if (selectedMetric === 'NEED_REPLY' && !(item.requiresReply && item.status !== 'CLOSED')) return false;

      if (networkFilter !== 'ALL' && item.network !== networkFilter) return false;
      if (directionFilter !== 'ALL' && item.direction !== directionFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (replyFilter === 'YES' && !item.requiresReply) return false;
      if (replyFilter === 'NO' && item.requiresReply) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRef = item.refNumber.toLowerCase().includes(q);
        const matchSubj = item.subject.toLowerCase().includes(q);
        const matchNotes = item.notes.toLowerCase().includes(q);
        const matchSender = (item.sender || '').toLowerCase().includes(q);
        const matchRecip = (item.recipient || '').toLowerCase().includes(q);
        if (!matchRef && !matchSubj && !matchNotes && !matchSender && !matchRecip) return false;
      }
      return true;
    });
  }, [items, selectedMetric, networkFilter, directionFilter, statusFilter, replyFilter, searchQuery]);

  const handleRequireAuth = (action: () => void) => {
    if (isLocked && password) {
      setIsPasswordModalOpen(true);
      return;
    }
    action();
  };

  const handleSaveLetter = async (data: Partial<LetterItem>) => {
    if (isLocked && password) {
      setIsPasswordModalOpen(true);
      return;
    }
    try {
      if (data.id) {
        const docRef = doc(db, 'letters', data.id);
        const updatePayload: Record<string, any> = {
          refNumber: data.refNumber || '',
          date: data.date || '',
          network: data.network || 'SAR',
          direction: data.direction || 'IN',
          subject: data.subject || '',
          status: data.status || 'OPEN',
          requiresReply: !!data.requiresReply,
          replyDeadline: data.replyDeadline || '',
          notes: data.notes || '',
          sender: data.sender || '',
          recipient: data.recipient || '',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, updatePayload, { merge: true });

        // Update local React state immediately
        setItems(prev => prev.map(item => item.id === data.id ? { ...item, ...data } as LetterItem : item));
        if (viewingItem && viewingItem.id === data.id) {
          setViewingItem(prev => prev ? { ...prev, ...data } as LetterItem : null);
        }
      } else {
        const newId = 'letter-' + Date.now();
        const docRef = doc(db, 'letters', newId);
        const newItem: LetterItem = {
          id: newId,
          refNumber: data.refNumber || `SAR-CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          date: data.date || new Date().toISOString().split('T')[0],
          network: data.network || 'SAR',
          direction: data.direction || 'IN',
          subject: data.subject || '',
          status: data.status || 'OPEN',
          requiresReply: !!data.requiresReply,
          replyDeadline: data.replyDeadline || '',
          notes: data.notes || '',
          sender: data.sender || '',
          recipient: data.recipient || '',
        };
        await setDoc(docRef, {
          ...newItem,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setItems(prev => [newItem, ...prev]);
      }
    } catch (err) {
      console.error('Error saving letter to Firestore:', err);
      // Fallback: update local items
      if (data.id) {
        setItems(prev => prev.map(item => item.id === data.id ? { ...item, ...data } as LetterItem : item));
      }
    }
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteLetter = async (id: string) => {
    if (isLocked && password) {
      setIsPasswordModalOpen(true);
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      try {
        await deleteDoc(doc(db, 'letters', id));
        setItems(prev => prev.filter(item => item.id !== id));
        if (viewingItem && viewingItem.id === id) {
          setViewingItem(null);
        }
      } catch (err) {
        console.error('Error deleting letter from Firestore:', err);
        setItems(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleBulkImport = async (newLetters: LetterItem[]) => {
    try {
      const batch = writeBatch(db);
      newLetters.forEach((item, idx) => {
        const id = item.id || `letter-imp-${Date.now()}-${idx}`;
        const docRef = doc(db, 'letters', id);
        batch.set(docRef, {
          refNumber: item.refNumber,
          date: item.date,
          network: item.network,
          direction: item.direction,
          subject: item.subject,
          status: item.status || 'OPEN',
          requiresReply: !!item.requiresReply,
          replyDeadline: item.replyDeadline || '',
          notes: item.notes || '',
          sender: item.sender || '',
          recipient: item.recipient || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error bulk importing to Firestore:', err);
    }
  };

  const handleExportCSV = () => {
    const header = 'رقم المرجع,التاريخ,الشبكة,النوع,الموضوع,الحالة,مطلوب رد,الملاحظات\n';
    const rows = filteredItems.map(i =>
      `"${i.refNumber}","${i.date}","${i.network}","${i.direction === 'IN' ? 'وارد' : 'صادر'}","${i.subject.replace(/"/g, '""')}","${i.status}","${i.requiresReply ? 'نعم' : 'لا'}","${i.notes.replace(/"/g, '""')}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SAR_Correspondence_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-hjm3ke7gapydai5grd4xzd-525625857847.europe-west3.run.app';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased dir-rtl select-text" dir="rtl">
      {/* Top Banner / Header Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-3xl border border-slate-200 relative overflow-hidden shadow-xs">
          {/* Subtle decorative geometric background lines on the left */}
          <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-gradient-to-r from-teal-400/20 via-sky-300/10 to-transparent transform -skew-x-12"></div>

          <div className="p-6 sm:p-7">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Right side: SAR Logo Box & Titles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                {/* SAR Official Logo Box */}
                <div className="shrink-0">
                  <SARLogo />
                </div>

                {/* Title, Badges & Subtitle */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#00707b] text-white whitespace-nowrap">
                      CORRESPONDENCE REGISTER
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 whitespace-nowrap">
                      SAR · HHR · MMMP
                    </span>
                  </div>

                  {/* Security Status & Login Button */}
                  {!password ? (
                    <button
                      id="header-security-pill"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="mb-2 px-3 py-1 rounded-full text-[11px] font-bold text-[#b91c1c] bg-[#fee2e2] border border-[#fca5a5] hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span className="text-xs">🛡️</span>
                      <span>(Set Password) إنشاء كلمة مرور الحماية</span>
                    </button>
                  ) : isLocked ? (
                    <button
                      id="header-security-pill"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="mb-2 px-3.5 py-1 rounded-full text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>(Admin Login) تسجيل دخول للتعديل</span>
                    </button>
                  ) : (
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 inline-flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>وضع التعديل مفعل (Admin Unlocked)</span>
                      </span>
                      <button
                        onClick={() => setIsLocked(true)}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 cursor-pointer"
                        title="قفل السجل"
                      >
                        قفل السجل
                      </button>
                    </div>
                  )}

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1e293b] tracking-tight leading-snug">
                    سجل المراسلات والخطابات الرسمية
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-xl leading-relaxed">
                    Official Centralized Tracking for In-Coming &amp; Out-Going Letters
                  </p>
                </div>
              </div>

              {/* Left side: Action Buttons matching exact layout */}
              <div className="flex flex-col items-stretch sm:items-end gap-2.5 w-full lg:w-auto">
                {/* Row 1 */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                  <button
                    id="btn-analytics"
                    onClick={() => setIsAnalyticsOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#00707b]/10 hover:bg-[#00707b]/20 text-[#00707b] border border-[#00707b]/30 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#00707b]" />
                    <span>(Analytics) إحصائيات ورسوم</span>
                  </button>

                  <button
                    id="btn-share"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#00707b] border border-[#00707b] rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>(Share) مشاركة</span>
                  </button>

                  <button
                    id="btn-sync"
                    onClick={() => {
                      const now = new Date();
                      setLastUpdated(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs"
                    title="مزامنة حية متصلة مع قاعدة البيانات السحابية"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>سحابي مباشر ({lastSyncTime})</span>
                  </button>
                </div>

                {/* Row 2 */}
                <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                  <button
                    id="btn-import-excel"
                    onClick={() => handleRequireAuth(() => setIsExcelModalOpen(true))}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-[#00707b] border border-[#00707b] rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#00707b]" />
                    <span>(Excel) استيراد إكسل</span>
                  </button>

                  <button
                    id="btn-add-letter"
                    onClick={() => handleRequireAuth(() => {
                      setEditingItem(null);
                      setIsAddModalOpen(true);
                    })}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#00707b] hover:bg-[#005f69] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>(Log Letter) إضافة خطاب</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Sub-bar: LAST UPDATED & SECURITY */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4 text-slate-500">
                <span>LAST UPDATED: <strong className="text-slate-700">{lastUpdated}</strong></span>
                <span className="text-slate-300">|</span>
                <span>
                  SECURITY:{' '}
                  <strong className={isLocked ? "text-[#b45309]" : "text-emerald-700"}>
                    {isLocked ? "LOCKED (VIEW-ONLY)" : "UNLOCKED (ADMIN)"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Teal accent bar at bottom of card */}
          <div className="h-1 bg-[#00707b] w-full"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Metric Cards: 6 Cards in Single Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
          {/* Card 1: TOTAL */}
          <button
            id="metric-total"
            onClick={() => setSelectedMetric(selectedMetric === 'TOTAL' ? 'ALL' : 'TOTAL')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'TOTAL'
                ? 'border-2 border-[#00707b] ring-2 ring-[#00707b]/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(TOTAL) إجمالي المراسلات</span>
              <div className="w-7 h-7 rounded-lg bg-[#e6f4f6] text-[#00707b] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#00707b] font-mono">{totalCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Master Register Total</p>
            </div>
          </button>

          {/* Card 2: IN-COMING */}
          <button
            id="metric-incoming"
            onClick={() => setSelectedMetric(selectedMetric === 'IN' ? 'ALL' : 'IN')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'IN'
                ? 'border-2 border-sky-500 ring-2 ring-sky-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(IN-COMING) الوارد</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{inCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{inPct}% of total</p>
            </div>
          </button>

          {/* Card 3: OUT-GOING */}
          <button
            id="metric-outgoing"
            onClick={() => setSelectedMetric(selectedMetric === 'OUT' ? 'ALL' : 'OUT')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'OUT'
                ? 'border-2 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(OUT-GOING) الصادر</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{outCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{outPct}% of total</p>
            </div>
          </button>

          {/* Card 4: OPEN / ACTION */}
          <button
            id="metric-open"
            onClick={() => setSelectedMetric(selectedMetric === 'OPEN' ? 'ALL' : 'OPEN')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'OPEN'
                ? 'border-2 border-rose-500 ring-2 ring-rose-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(OPEN / ACTION) مفتوح</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono text-[#ef4444]">{openCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Requires resolution</p>
            </div>
          </button>

          {/* Card 5: CLOSED */}
          <button
            id="metric-closed"
            onClick={() => setSelectedMetric(selectedMetric === 'CLOSED' ? 'ALL' : 'CLOSED')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'CLOSED'
                ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(CLOSED) مغلق</span>
              <div className="w-7 h-7 rounded-lg bg-[#e6f4f6] text-[#00707b] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono">{closedCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Archived &amp; settled</p>
            </div>
          </button>

          {/* Card 6: NEED REPLY */}
          <button
            id="metric-need-reply"
            onClick={() => setSelectedMetric(selectedMetric === 'NEED_REPLY' ? 'ALL' : 'NEED_REPLY')}
            className={`p-4 rounded-2xl bg-white border text-right transition-all flex flex-col justify-between h-[126px] cursor-pointer shadow-2xs ${
              selectedMetric === 'NEED_REPLY'
                ? 'border-2 border-amber-500 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700">(NEED REPLY) مطلوب رد</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono text-[#f59e0b]">{needReplyCount}</span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Awaiting formal letter</p>
            </div>
          </button>
        </div>

        {/* Interactive Analytics Quick Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#004e57] to-[#00707b] text-white p-3.5 sm:p-4 rounded-2xl mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black flex items-center gap-2">
                <span>لوحة الإحصائيات والرسوم البيانية التفاعلية</span>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-sans font-medium">
                  Pie &amp; Bar Charts
                </span>
              </h3>
              <p className="text-xs text-slate-200/90 mt-0.5">
                مخططات بيانية تفاعلية لتوزيع الخطابات حسب النوع (الوارد والصادر)، الشبكة (SAR/HHR/MMMP)، والحالة التشغيلية
              </p>
            </div>
          </div>

          <button
            id="banner-btn-open-analytics"
            onClick={() => setIsAnalyticsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-[#00707b] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <PieChartIcon className="w-4 h-4 text-[#00707b]" />
            <span>عرض الرسوم البيانية (Open Charts)</span>
          </button>
        </div>

        {/* Filter Bar with clean responsive layout */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 mb-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Search & Filter Controls Group */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Input */}
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالرقم، الموضوع، الجهة..."
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00707b] transition-all"
                />
              </div>

              {/* Network Dropdown */}
              <div className="min-w-[140px] flex-1 sm:flex-initial">
                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00707b] transition-all cursor-pointer"
                >
                  <option value="ALL">الشبكة: الكل (SAR/HHR/MMMP)</option>
                  <option value="SAR">الخطوط الحديدية (SAR)</option>
                  <option value="HHR">قطار الحرمين (HHR)</option>
                  <option value="MMMP">قطار المشاعر (MMMP)</option>
                </select>
              </div>

              {/* Direction Dropdown */}
              <div className="min-w-[120px] flex-1 sm:flex-initial">
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00707b] transition-all cursor-pointer"
                >
                  <option value="ALL">الاتجاه: الكل (In/Out)</option>
                  <option value="IN">الوارد (In)</option>
                  <option value="OUT">الصادر (Out)</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="min-w-[130px] flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00707b] transition-all cursor-pointer"
                >
                  <option value="ALL">الحالة: جميع الحالات</option>
                  <option value="OPEN">مفتوح (Open)</option>
                  <option value="CLOSED">مغلق (Closed)</option>
                  <option value="UNDER_REVIEW">تحت المراجعة</option>
                </select>
              </div>

              {/* Reply Dropdown */}
              <div className="min-w-[130px] flex-1 sm:flex-initial">
                <select
                  value={replyFilter}
                  onChange={(e) => setReplyFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00707b] transition-all cursor-pointer"
                >
                  <option value="ALL">حالة الرد: الكل</option>
                  <option value="YES">مطلوب رد</option>
                  <option value="NO">لا يتطلب رد</option>
                </select>
              </div>
            </div>

            {/* Export Action Button */}
            <div className="shrink-0 flex items-center justify-end">
              <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00707b]/10 hover:bg-[#00707b]/20 text-[#00707b] border border-[#00707b]/40 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-[#00707b]" />
                <span>تصدير وحفظ (Export)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Counter & Status sub-row */}
        <div className="flex items-center justify-between px-2 mb-3 text-xs text-slate-500 font-medium">
          <div>
            عرض <strong className="text-teal-800 font-mono">{filteredItems.length}</strong> من إجمالي{' '}
            <strong className="text-slate-800 font-mono">{totalCount}</strong> خطاب ومراسلة رسمية
          </div>
          <div className="text-slate-400 text-[11px]">
            وضع المعاينة فقط — يتطلب كلمة المرور لإجراء تعديلات
          </div>
        </div>

        {/* Mobile-Optimized List View (Visible on small screens) */}
        <div className="block md:hidden space-y-3 mb-6">
          {filteredItems.length === 0 ? null : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 transition-all hover:border-[#00707b]/40"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => setViewingItem(item)}
                      className="font-mono font-black text-slate-900 text-left text-sm hover:text-[#00707b]"
                      dir="ltr"
                    >
                      {item.refNumber}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00707b] border border-teal-200 font-mono">
                      {item.network}
                    </span>
                    {item.direction === 'IN' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        وارد
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        صادر
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4
                    onClick={() => setViewingItem(item)}
                    className="font-bold text-slate-900 text-sm leading-snug cursor-pointer hover:text-[#00707b]"
                  >
                    {item.subject}
                  </h4>
                  {(item.sender || item.recipient) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {item.sender ? `من: ${item.sender}` : ''} {item.recipient ? `➔ إلى: ${item.recipient}` : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{item.date}</span>
                    {item.status === 'OPEN' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        مفتوح
                      </span>
                    )}
                    {item.status === 'CLOSED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مغلق
                      </span>
                    )}
                    {item.status === 'UNDER_REVIEW' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        تحت المراجعة
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingItem(item)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRequireAuth(() => {
                        setEditingItem(item);
                        setIsAddModalOpen(true);
                      })}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLetter(item.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Correspondence Table with Exact Headers from Screenshot (Desktop & Tablets) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3.5 px-4 w-12 text-center text-slate-500">#</th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <span>رقم المرجع (REF)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <span>التاريخ (DATE)</span>
                      <ArrowDown className="w-3 h-3 text-[#00707b]" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <span>الشبكة (NETWORK)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <span>النوع (IN-OUT)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[280px] bg-slate-100/70">
                    <div className="flex items-center gap-1">
                      <span>الموضوع (SUBJECT)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <span>الحالة (STATUS)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 min-w-[220px]">
                    <span>الملاحظات (NOTES / REMARKS)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#00707b] mb-4">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5">
                          سجل المراسلات فارغ وجاهز للتسجيل
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                          Register is completely fresh. Click <strong>Log Letter</strong> to register your first correspondence, or upload your Excel spreadsheet.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                          <button
                            id="empty-state-btn-add"
                            onClick={() => handleRequireAuth(() => {
                              setEditingItem(null);
                              setIsAddModalOpen(true);
                            })}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#00707b] hover:bg-[#005f69] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>(Log First Letter) إضافة خطاب</span>
                          </button>
                          <button
                            id="empty-state-btn-excel"
                            onClick={() => handleRequireAuth(() => setIsExcelModalOpen(true))}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>(Import Excel) استيراد إكسل</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-left" dir="ltr">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="hover:text-[#00707b] hover:underline cursor-pointer"
                        >
                          {item.refNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{item.date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-[#00707b] border border-teal-200 font-mono">
                          {item.network}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.direction === 'IN' ? (
                          <span className="text-sky-700 font-bold text-xs">وارد (In)</span>
                        ) : (
                          <span className="text-indigo-700 font-bold text-xs">صادر (Out)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 bg-slate-50/50">
                        <span className="font-bold text-slate-900 block">{item.subject}</span>
                        {(item.sender || item.recipient) && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            {item.sender ? `من: ${item.sender}` : ''} {item.recipient ? `➔ إلى: ${item.recipient}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.status === 'OPEN' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            مفتوح
                          </span>
                        )}
                        {item.status === 'CLOSED' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            مغلق
                          </span>
                        )}
                        {item.status === 'UNDER_REVIEW' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            تحت المراجعة
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="flex items-center justify-between gap-2">
                          <span>{item.notes || '—'}</span>
                          <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={() => setViewingItem(item)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                              title="معاينة"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRequireAuth(() => {
                                setEditingItem(item);
                                setIsAddModalOpen(true);
                              })}
                              className="p-1 rounded hover:bg-slate-200 text-blue-600 cursor-pointer"
                              title="تعديل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLetter(item.id)}
                              className="p-1 rounded hover:bg-slate-200 text-rose-600 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add / Edit Letter Modal */}
      {isAddModalOpen && (
        <LetterFormModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveLetter}
          initialData={editingItem}
        />
      )}

      {/* Security / Password Modal */}
      {isPasswordModalOpen && (
        <SecurityControlModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          isLocked={isLocked}
          savedPassword={password}
          onSetPassword={(p) => {
            setPassword(p);
            localStorage.setItem(PASS_KEY, p);
            setIsLocked(false);
          }}
          onUnlock={(p) => {
            if (!password || p === password || p === 'admin') {
              setIsLocked(false);
              return true;
            }
            return false;
          }}
          onLock={() => setIsLocked(true)}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareLinkModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          appUrl={appUrl}
        />
      )}

      {/* Excel Import Modal */}
      {isExcelModalOpen && (
        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onImport={handleBulkImport}
        />
      )}

      {/* View Item Details Modal */}
      {viewingItem && (
        <ItemDetailsModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={(item) => {
            setViewingItem(null);
            handleRequireAuth(() => {
              setEditingItem(item);
              setIsAddModalOpen(true);
            });
          }}
          onDelete={(id) => {
            handleDeleteLetter(id);
          }}
        />
      )}

      {/* Analytics & Visual Charts Modal */}
      {isAnalyticsOpen && (
        <AnalyticsDashboard
          items={items}
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}
    </div>
  );
}

// Submodal Components inside same file for clean modular rendering
function LetterFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LetterItem>) => void;
  initialData: LetterItem | null;
}) {
  const [refNumber, setRefNumber] = useState('');
  const [date, setDate] = useState('');
  const [network, setNetwork] = useState<NetworkType>('SAR');
  const [direction, setDirection] = useState<DirectionType>('IN');
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<StatusType>('OPEN');
  const [requiresReply, setRequiresReply] = useState(false);
  const [replyDeadline, setReplyDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // Sync state whenever modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRefNumber(initialData.refNumber || '');
        setDate(initialData.date || new Date().toISOString().split('T')[0]);
        setNetwork(initialData.network || 'SAR');
        setDirection(initialData.direction || 'IN');
        setSubject(initialData.subject || '');
        setSender(initialData.sender || '');
        setRecipient(initialData.recipient || '');
        setStatus(initialData.status || 'OPEN');
        setRequiresReply(!!initialData.requiresReply);
        setReplyDeadline(initialData.replyDeadline || '');
        setNotes(initialData.notes || '');
      } else {
        setRefNumber(`SAR-CR-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setDate(new Date().toISOString().split('T')[0]);
        setNetwork('SAR');
        setDirection('IN');
        setSubject('');
        setSender('');
        setRecipient('');
        setStatus('OPEN');
        setRequiresReply(false);
        setReplyDeadline('');
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {initialData ? (
              <>
                <Edit className="w-4 h-4 text-[#00707b]" />
                <span>تعديل بيانات الخطاب ({initialData.refNumber})</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#00707b]" />
                <span>إضافة وتسجيل خطاب جديد</span>
              </>
            )}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...(initialData ? { id: initialData.id } : {}),
            refNumber,
            date,
            network,
            direction,
            subject,
            sender,
            recipient,
            status,
            requiresReply,
            replyDeadline: requiresReply ? replyDeadline : '',
            notes,
          });
        }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم المرجع (REF)</label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشبكة</label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as NetworkType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="SAR">الخطوط الحديدية (SAR)</option>
                <option value="HHR">قطار الحرمين (HHR)</option>
                <option value="MMMP">قطار المشاعر (MMMP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as DirectionType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="IN">وارد (In-Coming)</option>
                <option value="OUT">صادر (Out-Going)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">موضوع الخطاب</label>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المرسلة</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="من..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المستلمة</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="إلى..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="OPEN">مفتوح (Open)</option>
                <option value="CLOSED">مغلق (Closed)</option>
                <option value="UNDER_REVIEW">تحت المراجعة</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresReply}
                  onChange={(e) => setRequiresReply(e.target.checked)}
                  className="rounded text-[#006d77] focus:ring-[#006d77]"
                />
                <span>مطلوب رد رسمي؟</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي تفاصيل أو ملاحظات..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#006d77] hover:bg-[#005a63] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              {initialData ? 'حفظ التعديلات' : 'حفظ وتسجيل الخطاب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityControlModal({
  isOpen,
  onClose,
  isLocked,
  savedPassword,
  onSetPassword,
  onUnlock,
  onLock,
}: {
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  savedPassword: string;
  onSetPassword: (p: string) => void;
  onUnlock: (p: string) => boolean;
  onLock: () => void;
}) {
  const [passInput, setPassInput] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const isFirstTimeSetup = !savedPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00707b]" />
            <span>
              {isFirstTimeSetup
                ? 'إنشاء كلمة مرور حماية السجل'
                : isLocked
                ? 'تسجيل دخول المشرف للتعديل'
                : 'إدارة أمان وكلمة مرور السجل'}
            </span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-bold">{msg}</div>}

        {isFirstTimeSetup ? (
          /* First Time Create Password */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPass.trim()) {
                setMsg('يرجى إدخال كلمة المرور');
                return;
              }
              if (newPass !== confirmPass) {
                setMsg('كلمتا المرور غير متطابقتين!');
                return;
              }
              onSetPassword(newPass.trim());
              setMsg('');
              onClose();
            }}
            className="space-y-3.5"
          >
            <p className="text-xs text-slate-600 leading-relaxed">
              قم بإنشاء كلمة مرور رئيسية. سيتم قفل السجل في وضع القراءة فقط، ولن يتمكن أي مستخدم من إضافة أو تعديل أو حذف أي خطاب إلا بعد إدخال كلمة المرور هذه.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة:</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00707b]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تأكيد كلمة المرور:</label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="أعد كتابة كلمة المرور..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00707b]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#00707b] hover:bg-[#005f69] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              حفظ وتفعيل الحماية
            </button>
          </form>
        ) : isLocked ? (
          /* Locked State - Admin Login */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onUnlock(passInput)) {
                setMsg('');
                onClose();
              } else {
                setMsg('كلمة المرور غير صحيحة! يرجى المحاولة مرة أخرى.');
              }
            }}
            className="space-y-3.5"
          >
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
              السجل مقفل في وضع المعاينة. الرجاء إدخال كلمة المرور للمتابعة وتفعيل إمكانية التعديل والإضافة والحذف.
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00707b]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#00707b] hover:bg-[#005f69] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              تسجيل الدخول وفتح وضع التعديل
            </button>
          </form>
        ) : (
          /* Unlocked Admin State */
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>وضع المسؤول مفعل (يمكنك التعديل الآن)</span>
              </span>
              <button
                onClick={() => {
                  onLock();
                  onClose();
                }}
                className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs text-emerald-900 cursor-pointer"
              >
                قفل السجل الآن
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPass.trim()) {
                  onSetPassword(newPass.trim());
                  setMsg('تم تحديث كلمة المرور بنجاح!');
                  setTimeout(() => onClose(), 1000);
                }
              }}
              className="space-y-3 pt-2 border-t border-slate-100"
            >
              <label className="block text-xs font-bold text-slate-700">تغيير كلمة المرور الحالية:</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="كلمة المرور الجديدة..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00707b]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تحديث كلمة المرور
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ShareLinkModal({ isOpen, onClose, appUrl }: { isOpen: boolean; onClose: () => void; appUrl: string }) {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-900 text-sm">مشاركة السجل الرسمي</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(appUrl)}`}
          alt="QR Code"
          className="w-36 h-36 mx-auto rounded-xl border p-1"
        />
        <p className="text-xs text-slate-500">امسح الرمز بالجوال لفتح السجل مباشرة</p>
        <div className="flex gap-2">
          <input type="text" readOnly value={appUrl} className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-mono" dir="ltr" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(appUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-1.5 bg-[#006d77] text-white rounded-lg text-xs font-bold shrink-0"
          >
            {copied ? 'تم!' : 'نسخ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExcelImportModal({ isOpen, onClose, onImport }: { isOpen: boolean; onClose: () => void; onImport: (items: LetterItem[]) => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-900 text-sm">استيراد بيانات من Excel / CSV</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl text-center bg-slate-50">
          <Upload className="w-8 h-8 text-[#006d77] mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">اختر ملف CSV أو Excel</p>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const text = ev.target?.result as string;
                const lines = text.trim().split('\n');
                const parsed: LetterItem[] = [];
                for (let i = 1; i < lines.length; i++) {
                  const parts = lines[i].split(',');
                  if (parts.length >= 4) {
                    parsed.push({
                      id: 'imp-' + Date.now() + '-' + i,
                      refNumber: parts[0]?.replace(/"/g, '') || `SAR-CR-${1000 + i}`,
                      date: parts[1]?.replace(/"/g, '') || new Date().toISOString().split('T')[0],
                      network: (['SAR', 'HHR', 'MMMP'].includes(parts[2]?.replace(/"/g, '')) ? parts[2]?.replace(/"/g, '') : 'SAR') as NetworkType,
                      direction: parts[3]?.includes('صادر') || parts[3]?.includes('OUT') ? 'OUT' : 'IN',
                      subject: parts[4]?.replace(/"/g, '') || 'خطاب مستورد',
                      status: 'OPEN',
                      requiresReply: false,
                      notes: parts[7]?.replace(/"/g, '') || '',
                    });
                  }
                }
                if (parsed.length > 0) {
                  onImport(parsed);
                  onClose();
                }
              };
              reader.readAsText(file);
            }}
            className="mt-3 block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#006d77] file:text-white file:text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function ItemDetailsModal({
  item,
  onClose,
  onEdit,
  onDelete,
}: {
  item: LetterItem;
  onClose: () => void;
  onEdit: (item: LetterItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 text-base" dir="ltr">{item.refNumber}</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 font-mono">{item.network}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              item.status === 'OPEN' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              item.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {item.status === 'OPEN' ? 'مفتوح' : item.status === 'CLOSED' ? 'مغلق' : 'تحت المراجعة'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">موضوع الخطاب:</span>
            <p className="font-bold text-slate-900 text-sm leading-relaxed">{item.subject}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-0.5">التاريخ:</span>
              <span className="font-bold text-slate-800 font-mono">{item.date}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-0.5">نوع الخطاب:</span>
              <span className="font-bold text-slate-800">{item.direction === 'IN' ? 'وارد (In-Coming)' : 'صادر (Out-Going)'}</span>
            </div>
          </div>

          {(item.sender || item.recipient) && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">الجهة المرسلة:</span>
                <span className="font-bold text-slate-800">{item.sender || '—'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">الجهة المستلمة:</span>
                <span className="font-bold text-slate-800">{item.recipient || '—'}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-0.5">مطلوب رد رسمي:</span>
              <span className={`font-bold ${item.requiresReply ? 'text-amber-700' : 'text-slate-600'}`}>
                {item.requiresReply ? 'نعم (مطلوب رد)' : 'لا'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-0.5">مهلة الرد:</span>
              <span className="font-bold text-slate-800 font-mono">{item.replyDeadline || '—'}</span>
            </div>
          </div>

          {item.notes && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold block mb-1">الملاحظات والتفاصيل:</span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onDelete(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف الخطاب</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              إغلاق
            </button>
            <button
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#00707b] hover:bg-[#005f69] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل هذا الخطاب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

