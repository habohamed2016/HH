import React from 'react';
import {
  Layers,
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CorrespondenceItem } from '../types';

interface MetricCardsProps {
  items: CorrespondenceItem[];
  selectedFilter: string;
  onSelectFilter: (type: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  items,
  selectedFilter,
  onSelectFilter,
}) => {
  const total = items.length;
  const inComing = items.filter(i => i.direction === 'IN').length;
  const outGoing = items.filter(i => i.direction === 'OUT').length;
  const openCount = items.filter(i => i.status === 'OPEN' || i.status === 'UNDER_REVIEW').length;
  const closedCount = items.filter(i => i.status === 'CLOSED').length;
  const needReplyCount = items.filter(i => i.requiresReply && i.status !== 'CLOSED').length;

  const inComingPct = total > 0 ? Math.round((inComing / total) * 100) : 0;
  const outGoingPct = total > 0 ? Math.round((outGoing / total) * 100) : 0;

  const cards = [
    {
      id: 'TOTAL',
      title: '(TOTAL) إجمالي المراسلات',
      count: total,
      subtext: 'Master Register Total',
      icon: Layers,
      color: 'teal',
      accentBg: 'bg-teal-50',
      iconColor: 'text-teal-700',
      countColor: 'text-teal-800',
      activeBorder: 'border-teal-600 ring-2 ring-teal-600/20',
    },
    {
      id: 'IN',
      title: '(IN-COMING) الوارد',
      count: inComing,
      subtext: `${inComingPct}% of total`,
      icon: Inbox,
      color: 'sky',
      accentBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      countColor: 'text-slate-800',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/20',
    },
    {
      id: 'OUT',
      title: '(OUT-GOING) الصادر',
      count: outGoing,
      subtext: `${outGoingPct}% of total`,
      icon: Send,
      color: 'indigo',
      accentBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      countColor: 'text-slate-800',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20',
    },
    {
      id: 'OPEN',
      title: '(OPEN / ACTION) مفتوح',
      count: openCount,
      subtext: 'Requires resolution',
      icon: Clock,
      color: 'rose',
      accentBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      countColor: openCount > 0 ? 'text-rose-600' : 'text-slate-800',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
    },
    {
      id: 'CLOSED',
      title: '(CLOSED) مغلق',
      count: closedCount,
      subtext: 'Archived & settled',
      icon: CheckCircle2,
      color: 'emerald',
      accentBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      countColor: 'text-slate-800',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
    },
    {
      id: 'NEED_REPLY',
      title: '(NEED REPLY) مطلوب رد',
      count: needReplyCount,
      subtext: 'Awaiting formal letter',
      icon: AlertTriangle,
      color: 'amber',
      accentBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      countColor: needReplyCount > 0 ? 'text-amber-600' : 'text-slate-800',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 my-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedFilter === card.id;

        return (
          <button
            key={card.id}
            id={`metric-card-${card.id.toLowerCase()}`}
            onClick={() => onSelectFilter(isSelected ? 'ALL' : card.id)}
            className={`text-right p-4 rounded-2xl bg-white border transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between h-[135px] ${
              isSelected
                ? card.activeBorder
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-700 leading-tight">
                {card.title}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.accentBg} flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-extrabold ${card.countColor}`}>
                  {card.count}
                </span>
                <span className="text-xs text-slate-500 font-medium">خطاب</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
