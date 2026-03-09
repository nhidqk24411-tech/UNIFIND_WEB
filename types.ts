
export type ItemType = 'LOST' | 'FOUND';
export type TabType = 'LOST' | 'FOUND' | 'MATCHES';
export type Role = 'USER' | 'ADMIN';
export type ItemStatus = 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  avatarUrl: string;
  joinedDate: string;
  role: Role;
  isLocked?: boolean;
  isVerified?: boolean; 
}

export interface FoundItem {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  description: string;
  location: string;
  dateFound: string;
  imageUrl: string;
  contactInfo: string;
  category: ItemCategory;
  finderName: string;
  status: ItemStatus; 
}

export enum ItemCategory {
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  ID_CARDS = 'ID Cards/Wallets',
  ACCESSORIES = 'Accessories',
  BOOKS = 'Books/Stationery',
  OTHER = 'Other',
}

export interface SearchState {
  query: string;
  isAiSearching: boolean;
  aiResponse: string | null;
}

export interface Notification {
    id: string;
    message: string;
    type: 'MATCH_FOUND' | 'INFO' | 'SYSTEM' | 'COMPLETED';
    timestamp: number;
    read: boolean;
}

// --- Chat Types ---
export interface Message {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: number;
    isSystem?: boolean; 
}

export interface ChatSession {
    id: string;
    itemId: string;
    participants: [string, string]; 
    messages: Message[];
    lastUpdated: number;
    otherUserName: string; 
    itemTitle: string;    
    itemImage: string;    
    returnConfirmedBy: string[]; 
}

// --- Admin & Support Types ---

export type ReportType = 'ITEM' | 'USER' | 'CHAT' | 'APP_FEEDBACK';

export interface Report {
    id: string;
    type: ReportType;
    reporterId: string;
    targetId?: string; // ItemId, UserId, or SessionId
    targetName?: string; // For display
    reason: string;
    details?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    timestamp: string;
}

export interface SystemLog {
    id: string;
    action: string;
    adminId: string;
    details: string;
    timestamp: string;
}

export interface GuidancePost {
    id: string;
    title: string;
    content: string; // HTML or Markdown supported content
    lastUpdated: string;
}
