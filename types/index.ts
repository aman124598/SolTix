// ─── Event Types ───
export interface EventData {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  time: string;
  venue: string;
  location: string;
  imageUrl: string;
  organizerWallet: string;
  organizerName: string;
  ticketPrice: number; // in SOL
  totalTickets: number;
  ticketsSold: number;
  maxResalePrice: number; // max resale price in SOL
  royaltyPercentage: number; // e.g. 5 = 5%
  category: EventCategory;
  status: EventStatus;
  metadataUri: string; // IPFS/Arweave URI
  createdAt: string;
}

export type EventCategory =
  | 'concert'
  | 'conference'
  | 'workshop'
  | 'festival'
  | 'meetup'
  | 'sports'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// ─── Ticket Types ───
export interface Ticket {
  id: string;
  eventId: string;
  event: EventData;
  mintAddress: string;
  ownerWallet: string;
  purchasePrice: number; // in SOL
  purchaseDate: string;
  status: TicketStatus;
  tokenAccount: string;
  metadataUri: string;
  seatInfo?: string;
  tier: TicketTier;
}

export type TicketStatus = 'valid' | 'used' | 'listed' | 'transferred' | 'expired';

export type TicketTier = 'general' | 'vip' | 'premium';

// ─── Marketplace Types ───
export interface MarketplaceListing {
  id: string;
  ticket: Ticket;
  sellerWallet: string;
  listPrice: number; // in SOL
  maxAllowedPrice: number;
  royaltyPercentage: number;
  listedAt: string;
  status: ListingStatus;
}

export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';

// ─── Wallet Types ───
export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  connecting: boolean;
}

// ─── Transaction Types ───
export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// ─── Navigation Types ───
export type RootStackParamList = {
  '(tabs)': undefined;
  'event/[id]': { id: string };
  'modal': undefined;
  'resale/[id]': { id: string };
};
