// ─── Supabase Database Types ───
// These types mirror the Supabase tables for type-safe queries.

export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<EventRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<EventRow>;
      };
      tickets: {
        Row: TicketRow;
        Insert: Omit<TicketRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<TicketRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<TicketRow>;
      };
      marketplace_listings: {
        Row: MarketplaceListingRow;
        Insert: Omit<MarketplaceListingRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<MarketplaceListingRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<MarketplaceListingRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<ProfileRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<ProfileRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_category: EventCategoryEnum;
      event_status: EventStatusEnum;
      ticket_status: TicketStatusEnum;
      ticket_tier: TicketTierEnum;
      listing_status: ListingStatusEnum;
    };
  };
}

// ─── Events Table ───
export interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image_url: string;
  organizer_wallet: string;
  organizer_name: string;
  ticket_price: number;
  total_tickets: number;
  tickets_sold: number;
  max_resale_price: number;
  royalty_percentage: number;
  category: EventCategoryEnum;
  status: EventStatusEnum;
  metadata_uri: string;
  created_at: string;
  updated_at: string;
}

// ─── Tickets Table ───
export interface TicketRow {
  id: string;
  event_id: string;
  mint_address: string;
  owner_wallet: string;
  purchase_price: number;
  purchase_date: string;
  status: TicketStatusEnum;
  token_account: string;
  metadata_uri: string;
  seat_info: string | null;
  tier: TicketTierEnum;
  tx_signature: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Marketplace Listings Table ───
export interface MarketplaceListingRow {
  id: string;
  ticket_id: string;
  seller_wallet: string;
  list_price: number;
  max_allowed_price: number;
  royalty_percentage: number;
  listed_at: string;
  status: ListingStatusEnum;
  buyer_wallet: string | null;
  sold_at: string | null;
  tx_signature: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Profiles Table ───
export interface ProfileRow {
  id: string;
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Enums ───
export type EventCategoryEnum =
  | 'concert'
  | 'conference'
  | 'workshop'
  | 'festival'
  | 'meetup'
  | 'sports'
  | 'other';

export type EventStatusEnum = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type TicketStatusEnum = 'valid' | 'used' | 'listed' | 'transferred' | 'expired';

export type TicketTierEnum = 'general' | 'vip' | 'premium';

export type ListingStatusEnum = 'active' | 'sold' | 'cancelled' | 'expired';
