<p align="center">
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">SolTix</h1>

<p align="center">
  <strong>Decentralized event ticketing & resale on Solana</strong>
</p>

<p align="center">
  Programmable NFT tickets · Enforced royalties · Anti-scalping · Near-zero fees
</p>

---

## What is SolTix?

SolTix is a mobile-first decentralized ticketing protocol built on the **Solana blockchain**. Event organizers issue verifiable, programmable tickets as NFTs — with royalties, resale caps, and transfer rules enforced at the protocol level.

No more counterfeit tickets. No more unchecked scalping. No more opaque secondary markets.

### Why Solana?

| Metric | Solana | Ethereum L1 |
|---|---|---|
| Confirmation time | ~400ms block / <2s finality | ~12s block / minutes for finality |
| Transaction cost | ~$0.00025 | $1–50+ (variable) |
| Throughput | 65,000 TPS theoretical | ~15 TPS |

---

## Features

- **NFT Ticket Minting** — Each ticket is a unique, verifiable Solana NFT (Metaplex standard)
- **Resale Marketplace** — Built-in secondary market with atomic buy/sell execution
- **Royalty Enforcement** — Organizers earn royalties on every resale within the marketplace
- **Resale Price Caps** — On-chain constraints prevent abusive scalping
- **Wallet-Native Auth** — No accounts or passwords; connect Phantom or Solflare
- **Event Discovery** — Browse, search, and filter upcoming events
- **Ticket Management** — View, transfer, and list owned tickets
- **Real-Time State** — Zustand-powered stores synced with on-chain and Supabase data

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Mobile Client                      │
│        Expo · React Native · NativeWind              │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Screens │  │  Stores  │  │    Services        │  │
│  │ (Router) │◄►│(Zustand) │◄►│ (RPC + Supabase)  │  │
│  └──────────┘  └──────────┘  └─────────┬─────────┘  │
└────────────────────────────────────────┬┘            │
                                         │             │
                    ┌────────────────────┼─────────────┘
                    │                    │
          ┌────────▼────────┐  ┌────────▼────────┐
          │  Solana Network │  │    Supabase      │
          │  (Devnet/Main)  │  │  (Postgres +     │
          │                 │  │   Storage)        │
          │  Anchor Program │  │  Events, Tickets, │
          │  NFT Minting    │  │  Profiles, etc.   │
          └─────────────────┘  └──────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Expo SDK 54** (React Native) | Cross-platform mobile app |
| Language | **TypeScript 5.x** (strict) | Type-safe client code |
| Navigation | **Expo Router** | File-based routing |
| Styling | **NativeWind** (Tailwind CSS) | Utility-first styling |
| State | **Zustand** | Lightweight reactive stores |
| Forms | **React Hook Form + Zod** | Validation & form state |
| Blockchain | **@solana/web3.js** | Transaction construction & RPC |
| Wallet | **Solana Mobile Wallet Adapter** | Phantom / Solflare integration |
| Backend | **Supabase** (PostgreSQL) | Events, tickets, profiles, storage |
| Smart Contracts | **Rust + Anchor** | On-chain program logic |
| NFT Standard | **Metaplex Token Metadata** | NFT minting & metadata |
| Storage | **Arweave / IPFS** | Decentralized metadata storage |

---

## Project Structure

```
SolTix/
├── app/                    # Screens (file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry point
│   ├── landing.tsx         # Landing / onboarding
│   ├── modal.tsx           # Global modal
│   ├── (tabs)/             # Tab navigator
│   │   ├── index.tsx       #   Dashboard
│   │   ├── explore.tsx     #   Event discovery
│   │   ├── marketplace.tsx #   Resale marketplace
│   │   ├── tickets.tsx     #   My tickets
│   │   └── settings.tsx    #   Settings
│   ├── event/[id].tsx      # Event details (dynamic)
│   └── resale/[id].tsx     # Resale listing (dynamic)
├── components/             # Reusable UI components
│   ├── ui/                 #   Primitives (button, search, loading)
│   ├── event-card.tsx      #   Event card
│   ├── ticket-card.tsx     #   Ticket card
│   ├── listing-card.tsx    #   Marketplace listing
│   ├── wallet-modal.tsx    #   Wallet connection modal
│   └── transaction-modal.tsx # Transaction confirmation
├── services/               # API & blockchain service layer
│   ├── solana.ts           #   Solana RPC client
│   ├── supabase.ts         #   Supabase client
│   ├── event-service.ts    #   Event CRUD
│   ├── ticket-service.ts   #   Ticket operations
│   ├── marketplace-service.ts # Listing operations
│   └── wallet-service.ts   #   Wallet connection
├── store/                  # Zustand state stores
│   ├── wallet-store.ts     #   Wallet & auth state
│   ├── event-store.ts      #   Events state
│   ├── ticket-store.ts     #   Tickets state
│   └── marketplace-store.ts #  Marketplace state
├── types/                  # TypeScript type definitions
│   ├── index.ts            #   App-wide types
│   └── database.ts         #   Supabase DB types
├── constants/              # Theme & config constants
├── hooks/                  # Custom React hooks
├── supabase/               # Database schema & seed data
│   ├── schema.sql          #   PostgreSQL schema
│   └── seed.sql            #   Sample event data
└── data/                   # Mock data for development
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Expo CLI** — `npm install -g expo-cli`
- A Solana wallet app on your phone ([Phantom](https://phantom.app) or [Solflare](https://solflare.com))
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/soltix.git
cd soltix
npm install
```

### 2. Configure Environment

Copy the example env and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Solana
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_NETWORK=devnet
EXPO_PUBLIC_PROGRAM_ID=YourProgramPublicKey

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Storage
EXPO_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net
EXPO_PUBLIC_IPFS_GATEWAY=https://ipfs.io
```

### 3. Set Up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql)
3. Then run [`supabase/seed.sql`](supabase/seed.sql) for sample data
4. Copy your **Project URL** and **anon key** from `Settings → API` into `.env`
5. *(Optional)* Create a public `event-images` storage bucket for event artwork

### 4. Run the App

```bash
# Start the Expo dev server
npx expo start --clear

# Or target a specific platform
npx expo start --android
npx expo start --ios
```

Scan the QR code with **Expo Go** or run on an emulator/simulator.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to blank project |
| `npm run eas:build:apk` | Build Android APK via EAS |
| `npm run eas:build:preview` | Build Android preview via EAS |
| `npm run eas:build:production` | Production build via EAS |

---

## Core User Flows

### Wallet Connection
```
Landing Page → Connect Wallet → Approve in Phantom/Solflare → Dashboard
```

### Ticket Purchase
```
Browse Events → Event Details → Buy Ticket → Confirm Tx → NFT Minted → My Tickets
```

### Ticket Resale
```
My Tickets → Select Ticket → List for Resale → Set Price (within cap) → On-chain Listing → Marketplace
```

### Resale Purchase
```
Marketplace → View Listing → Buy → Atomic Transfer (SOL + NFT) → Royalties Distributed
```

---

## Database Schema

The Supabase PostgreSQL database includes these core tables:

| Table | Purpose |
|---|---|
| `profiles` | User profiles keyed by wallet address |
| `events` | Event metadata (title, date, venue, pricing, constraints) |
| `tickets` | NFT ticket records with ownership & status tracking |
| `marketplace_listings` | Active resale listings with price validation |
| `transactions` | On-chain transaction history & settlement records |

See [`supabase/schema.sql`](supabase/schema.sql) for the full schema with enums, indexes, and RLS policies.

---

## Wallet & Network Configuration

### Devnet (Development)
```env
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_NETWORK=devnet
```
Get free devnet SOL at [faucet.solana.com](https://faucet.solana.com).

### Mainnet (Production)
```env
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EXPO_PUBLIC_NETWORK=mainnet-beta
```

For production throughput, use a dedicated RPC provider:
- [Helius](https://helius.dev) — Recommended for Solana
- [QuickNode](https://quicknode.com)
- [Alchemy](https://alchemy.com)

---

## Building for Production

SolTix uses [EAS Build](https://docs.expo.dev/eas/) for native builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build Android APK (for testing)
npm run eas:build:apk

# Build production release
npm run eas:build:production
```

---

## Security Model

| Aspect | Approach |
|---|---|
| Authentication | Wallet-based (no passwords, no PII) |
| Transaction signing | Delegated to external wallet (Phantom/Solflare) |
| Key storage | App **never** holds private keys |
| Session persistence | Wallet address stored in Expo SecureStore (encrypted) |
| Royalty enforcement | On-chain within SolTix marketplace |
| Resale constraints | Validated by Solana program before execution |

---

## Roadmap

- [x] **MVP** — Event creation, NFT minting, resale marketplace, royalty enforcement
- [ ] Creator dashboards & analytics
- [ ] Fiat on-ramp integration
- [ ] VIP ticket tiers with perks
- [ ] Event cancellation & refund logic
- [ ] DAO-governed event policies
- [ ] Cross-chain bridging
- [ ] Dynamic ticket metadata

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

Please ensure:
- TypeScript strict mode passes
- ESLint checks pass (`npm run lint`)
- New features include appropriate types in `types/`

---

## Documentation

| Document | Description |
|---|---|
| [`SETUP.md`](SETUP.md) | Detailed production setup guide |
| [`TECH_Stack.md`](TECH_Stack.md) | Full technology stack documentation |
| [`APP_Flow.md`](APP_Flow.md) | User flows & interaction design |
| [`prd.md`](prd.md) | Product requirements document |

---

## License

This project is private and not licensed for public distribution.

---

<p align="center">
  Built with Solana · Powered by Expo · Secured by cryptography
</p>
