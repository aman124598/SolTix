# SolTix — Production Setup Guide

## 1. Supabase Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** — choose a region close to your users
3. **Copy your credentials** from `Settings → API`:
   - `Project URL` → paste into `.env` as `EXPO_PUBLIC_SUPABASE_URL`
   - `anon/public` key → paste into `.env` as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. **Run the database schema** — go to `SQL Editor` and run:
   - First: paste and execute the contents of [`supabase/schema.sql`](./supabase/schema.sql)
   - Then: paste and execute the contents of [`supabase/seed.sql`](./supabase/seed.sql) (initial event data)

5. **Enable Storage** (for event images):
   - Go to `Storage` → Create a bucket named `event-images` (public)
   - Upload event images and update the `image_url` column in the `events` table

## 2. Solana Configuration

### Devnet (Testing)
```
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_NETWORK=devnet
```

### Mainnet (Production)
```
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_NETWORK=mainnet-beta
```

For higher throughput, use a dedicated RPC from:
- [Helius](https://helius.dev) (recommended for Solana)
- [QuickNode](https://quicknode.com)
- [Alchemy](https://alchemy.com)

## 3. Wallet Setup

The app integrates with real Solana wallet apps via deep links:
- **Phantom** — [phantom.app](https://phantom.app)
- **Solflare** — [solflare.com](https://solflare.com)

Users need one of these wallets installed on their phone.

### For testing on devnet:
1. Install Phantom on your phone
2. Switch to devnet in Phantom settings
3. Request free devnet SOL at [faucet.solana.com](https://faucet.solana.com)

## 4. Deep Link Configuration

Add to your `app.json`:
```json
{
  "expo": {
    "scheme": "soltix",
    "ios": {
      "associatedDomains": ["applinks:soltix.app"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "data": [{ "scheme": "soltix" }],
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

## 5. Running the App

```bash
# Install dependencies
npm install

# Start development server
npx expo start --clear

# Run on device
npx expo run:android
npx expo run:ios
```

## 6. Adding Real Events

Insert events directly into Supabase:

```sql
INSERT INTO events (title, description, date, time, venue, location, image_url,
  organizer_wallet, organizer_name, ticket_price, total_tickets,
  max_resale_price, royalty_percentage, category, status)
VALUES (
  'Your Event Name',
  'Event description...',
  '2026-06-15', '07:00 PM',
  'Venue Name', 'City, Country',
  'https://your-image-url.com/image.jpg',
  'OrganizerSolanaWalletAddress',
  'Organizer Name',
  1.5,    -- ticket price in SOL
  1000,   -- total tickets
  3.0,    -- max resale price in SOL
  5,      -- royalty percentage
  'concert',
  'upcoming'
);
```

Or use the Supabase dashboard Table Editor for a GUI experience.

## Architecture Overview

```
App (Expo + React Native)
  ↓
Zustand Stores (State Management)
  ↓
Service Layer
  ├── supabase.ts      → Supabase client
  ├── event-service.ts  → Events CRUD (Supabase)
  ├── ticket-service.ts → Tickets CRUD (Supabase)
  ├── marketplace-service.ts → Listings CRUD (Supabase)
  ├── solana.ts         → Blockchain read operations
  └── wallet-service.ts → Wallet connection (Deep Links)
  ↓
Supabase (PostgreSQL)  +  Solana Blockchain
```
