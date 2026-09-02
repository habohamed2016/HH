export type NetworkType = 'SAR' | 'HHR' | 'MMMP';
export type DirectionType = 'IN' | 'OUT';
export type CategoryType = 'LETTER' | 'MOM' | 'CIRCULAR';
export type StatusType = 'OPEN' | 'CLOSED' | 'UNDER_REVIEW' | 'PENDING_REPLY';

export interface CorrespondenceItem {
  id: string;
  refNumber: string;
  date: string; // YYYY-MM-DD
  network: NetworkType;
  direction: DirectionType;
  category: CategoryType;
  sender: string;
  recipient: string;
  subject: string;
  status: StatusType;
  requiresReply: boolean;
  replyDeadline?: string;
  replyReference?: string;
  notes: string;
  attachmentsCount?: number;
  priority?: 'HIGH' | 'NORMAL' | 'URGENT';
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  network: string; // 'ALL' | 'SAR' | 'HHR' | 'MMMP'
  direction: string; // 'ALL' | 'IN' | 'OUT'
  status: string; // 'ALL' | 'OPEN' | 'CLOSED' | 'UNDER_REVIEW' | 'PENDING_REPLY'
  replyRequired: string; // 'ALL' | 'YES' | 'NO'
}
