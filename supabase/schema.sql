-- ╔══════════════════════════════════════════════════════════════╗
-- ║  SolTix Database Schema — Supabase PostgreSQL              ║
-- ║  Run this in your Supabase SQL Editor to set up the DB     ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Custom Enums ───
CREATE TYPE event_category AS ENUM (
  'concert', 'conference', 'workshop', 'festival', 'meetup', 'sports', 'other'
);

CREATE TYPE event_status AS ENUM (
  'upcoming', 'ongoing', 'completed', 'cancelled'
);

CREATE TYPE ticket_status AS ENUM (
  'valid', 'used', 'listed', 'transferred', 'expired'
);

CREATE TYPE ticket_tier AS ENUM (
  'general', 'vip', 'premium'
);

CREATE TYPE listing_status AS ENUM (
  'active', 'sold', 'cancelled', 'expired'
);

-- ─── Profiles ───
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name   TEXT,
  avatar_url     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);

-- ─── Events ───
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  date              DATE NOT NULL,
  time              TEXT NOT NULL DEFAULT '00:00',
  venue             TEXT NOT NULL,
  location          TEXT NOT NULL,
  image_url         TEXT NOT NULL DEFAULT '',
  organizer_wallet  TEXT NOT NULL,
  organizer_name    TEXT NOT NULL DEFAULT 'Unknown Organizer',
  ticket_price      NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_tickets     INTEGER NOT NULL DEFAULT 0,
  tickets_sold      INTEGER NOT NULL DEFAULT 0,
  max_resale_price  NUMERIC(12,4) NOT NULL DEFAULT 0,
  royalty_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  category          event_category NOT NULL DEFAULT 'other',
  status            event_status NOT NULL DEFAULT 'upcoming',
  metadata_uri      TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_organizer ON events(organizer_wallet);

-- CHECK constraints for events
ALTER TABLE events ADD CONSTRAINT chk_royalty_range
  CHECK (royalty_percentage >= 0 AND royalty_percentage <= 100);
ALTER TABLE events ADD CONSTRAINT chk_ticket_price
  CHECK (ticket_price >= 0);
ALTER TABLE events ADD CONSTRAINT chk_max_resale_price
  CHECK (max_resale_price >= 0);
ALTER TABLE events ADD CONSTRAINT chk_total_tickets
  CHECK (total_tickets >= 0);
ALTER TABLE events ADD CONSTRAINT chk_tickets_sold_range
  CHECK (tickets_sold >= 0 AND tickets_sold <= total_tickets);

-- ─── Tickets ───
CREATE TABLE tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  mint_address    TEXT DEFAULT NULL,
  owner_wallet    TEXT NOT NULL,
  purchase_price  NUMERIC(12,4) NOT NULL DEFAULT 0,
  purchase_date   TIMESTAMPTZ DEFAULT now(),
  status          ticket_status NOT NULL DEFAULT 'valid',
  token_account   TEXT NOT NULL DEFAULT '',
  metadata_uri    TEXT NOT NULL DEFAULT '',
  seat_info       TEXT,
  tier            ticket_tier NOT NULL DEFAULT 'general',
  tx_signature    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_owner ON tickets(owner_wallet);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_mint ON tickets(mint_address);

-- Unique partial index: each mint_address can only appear once (excluding NULLs)
CREATE UNIQUE INDEX idx_tickets_unique_mint ON tickets(mint_address) WHERE mint_address IS NOT NULL;

-- ─── Marketplace Listings ───
CREATE TABLE marketplace_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  seller_wallet     TEXT NOT NULL,
  list_price        NUMERIC(12,4) NOT NULL,
  max_allowed_price NUMERIC(12,4) NOT NULL,
  royalty_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  listed_at         TIMESTAMPTZ DEFAULT now(),
  status            listing_status NOT NULL DEFAULT 'active',
  buyer_wallet      TEXT,
  sold_at           TIMESTAMPTZ,
  tx_signature      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_listings_ticket ON marketplace_listings(ticket_id);
CREATE INDEX idx_listings_seller ON marketplace_listings(seller_wallet);
CREATE INDEX idx_listings_status ON marketplace_listings(status);

-- CHECK constraints for marketplace_listings
ALTER TABLE marketplace_listings ADD CONSTRAINT chk_price_cap
  CHECK (list_price <= max_allowed_price);
ALTER TABLE marketplace_listings ADD CONSTRAINT chk_listing_royalty_range
  CHECK (royalty_percentage >= 0 AND royalty_percentage <= 100);

-- Prevent multiple active listings for the same ticket
CREATE UNIQUE INDEX uniq_active_listing_ticket_idx
  ON marketplace_listings(ticket_id) WHERE status = 'active';

-- ─── Auto-update updated_at trigger ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Increment tickets_sold function ───
CREATE OR REPLACE FUNCTION increment_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events SET tickets_sold = tickets_sold + 1 WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION increment_tickets_sold();

-- ─── Decrement tickets_sold on ticket deletion ───
CREATE OR REPLACE FUNCTION decrement_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events SET tickets_sold = GREATEST(0, tickets_sold - 1) WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_deleted
  AFTER DELETE ON tickets
  FOR EACH ROW EXECUTE FUNCTION decrement_tickets_sold();

-- ─── Row Level Security ───
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Events: anyone can read, organizers can insert/update their own
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT USING (true);

CREATE POLICY "Organizers can insert events"
  ON events FOR INSERT WITH CHECK (
    organizer_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', organizer_wallet)
  );

CREATE POLICY "Organizers can update their events"
  ON events FOR UPDATE USING (
    organizer_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', organizer_wallet)
  );

-- Tickets: users can read own, anyone can read for marketplace
CREATE POLICY "Tickets are viewable by everyone"
  ON tickets FOR SELECT USING (true);

CREATE POLICY "Users can insert tickets"
  ON tickets FOR INSERT WITH CHECK (
    owner_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', owner_wallet)
  );

CREATE POLICY "Owners can update their tickets"
  ON tickets FOR UPDATE USING (
    owner_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', owner_wallet)
  );

-- Marketplace: anyone can read active listings
CREATE POLICY "Listings are viewable by everyone"
  ON marketplace_listings FOR SELECT USING (true);

CREATE POLICY "Users can insert listings"
  ON marketplace_listings FOR INSERT WITH CHECK (
    seller_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', seller_wallet)
  );

CREATE POLICY "Sellers can update their listings"
  ON marketplace_listings FOR UPDATE USING (
    seller_wallet = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', seller_wallet)
  );

-- Profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their profile"
  ON profiles FOR INSERT WITH CHECK (
    wallet_address = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', wallet_address)
  );

CREATE POLICY "Users can update their profile"
  ON profiles FOR UPDATE USING (
    wallet_address = coalesce(current_setting('request.jwt.claims', true)::json->>'wallet_address', wallet_address)
  );
