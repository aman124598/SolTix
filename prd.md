Product Requirements Document: SolTix MVP
Executive Summary

Product: SolTix
Version: MVP (1.0)
Document Status: Draft
Last Updated: 11 Feb 2026

Product Vision

SolTix is a decentralized ticketing and resale protocol built on the Solana blockchain, enabling event organizers to issue verifiable, programmable tickets as NFTs while enforcing royalties, resale constraints, and transfer rules at the protocol level. The platform eliminates counterfeit tickets, reduces scalping abuse, and provides transparent ownership and lifecycle tracking with near-zero fees and fast confirmation times (~400ms block time, typically < 2s for finality).

Success Criteria

Functional end-to-end ticket lifecycle (create event → mint → transfer → resale → settle)

Royalty enforcement at application/marketplace level (note: Solana NFT royalties are not enforceable at the protocol level for all transfer methods; SolTix enforces royalties within its own marketplace and program logic)

Resale limits enforced on-chain

Smooth wallet-based UX with no blockchain expertise required

Demonstrable cost and latency advantages over EVM-based alternatives

Problem Statement
Problem Definition

Traditional ticketing systems are centralized, opaque, and vulnerable to fraud, price manipulation, and counterfeit duplication. Secondary markets often fail to compensate organizers and cannot enforce pricing policies. EVM-based NFT ticketing improves verifiability but suffers from high gas fees and poor UX during network congestion.

Impact Analysis

User Impact: Ticket fraud, fake listings, high fees, delayed settlement

Market Impact: Multi-billion dollar global ticketing industry with persistent trust gaps

Business Impact: Lost organizer revenue from uncontrolled resale markets

Target Audience
Primary Persona: Independent Event Organizer

Demographics:

Age: 22–45

Location: Urban / Tier 1 & Tier 2 cities

Profile: Hosts concerts, workshops, meetups, festivals

Psychographics:

Revenue-sensitive

Community-driven

Comfortable with digital tools but not blockchain-native

Jobs to Be Done:

Issue tamper-proof tickets

Earn royalties on secondary sales

Prevent abusive scalping

Current Solutions & Pain Points:

Current Solution	Pain Points	Our Advantage
Centralized ticketing platforms	High commissions, fake tickets	Trustless verification, low fees
Informal resale markets	Fraud risk, no royalties	On-chain enforcement
EVM NFT tickets	Gas costs, UX friction	Fast, low-cost Solana transactions
Secondary Personas

Ticket Buyers / Attendees — Want secure ownership & easy transfer

Resellers / Traders — Want transparent rules & low fees

User Stories
Epic: Programmable NFT Ticketing

Primary User Story:
"As an event organizer, I want to mint tickets as NFTs so that ownership, resale rules, and royalties are enforced automatically."

Acceptance Criteria:

 Organizer can create an event with metadata

 Tickets minted as unique NFTs

 Royalties enforced on resale

 Resale price limits validated on-chain

Supporting User Stories

"As a buyer, I want to purchase a ticket securely using my wallet."

AC: Ownership transferred atomically

"As a ticket holder, I want to resell within allowed constraints."

AC: Program rejects invalid pricing

"As an organizer, I want royalties from resales."

AC: Royalty distribution executed automatically

"As a user, I want to transfer tickets easily."

AC: Standard Solana NFT transfer supported

Functional Requirements
Core Features (MVP — P0)
Feature 1: Event Creation

Description: Organizers register events with metadata stored on IPFS/Arweave

User Value: Verifiable event authenticity

Business Value: Foundation for ticket issuance

Acceptance Criteria:

 Metadata hash stored on-chain

 Immutable event ID generated

Dependencies: Storage layer integration

Estimated Effort: Medium

Feature 2: NFT Ticket Minting

Description: Tickets minted as Solana NFTs via Metaplex standard

User Value: Unique, verifiable ownership

Business Value: Fraud prevention & traceability

Acceptance Criteria:

 Each ticket uniquely identifiable

 Metadata resolvable off-chain

Dependencies: Metaplex Token Metadata Program

Estimated Effort: Medium

Feature 3: Resale Marketplace Logic

Description: On-chain listing & purchase mechanism

User Value: Trustless secondary market

Business Value: Revenue + ecosystem activity

Acceptance Criteria:

 Listing price validated against constraints

 Atomic buy execution

Dependencies: Custom Solana program

Estimated Effort: High

Feature 4: Royalty Enforcement

Description: Automatic royalty distribution to organizers

User Value: Fair compensation model

Business Value: Incentivizes adoption

Acceptance Criteria:

 Royalties enforced within SolTix marketplace transactions (cannot be enforced for arbitrary wallet-to-wallet transfers outside the platform)

 Cannot be bypassed by transfers within SolTix marketplace

Dependencies: Program logic + token transfers

Estimated Effort: High

Feature 5: Resale Constraints

Description: Max price / resale rules enforced on-chain

User Value: Scalping mitigation

Business Value: Platform differentiation

Acceptance Criteria:

 Invalid resale rejected

 Constraint parameters immutable

Estimated Effort: Medium

Should Have (P1)

Creator dashboards & analytics

Fiat on-ramp integration

Advanced ticket classes (VIP tiers, perks)

Could Have (P2)

DAO-governed event policies

Cross-chain bridging

Dynamic ticket metadata

Out of Scope (Won't Have)

Custodial wallet support — contradicts decentralization goals

Off-chain resale validation — weakens trust model

Note: The app currently stores wallet addresses locally via Expo SecureStore for session persistence. This is NOT custodial — the app never holds private keys. All transaction signing is delegated to the user’s external wallet (Phantom, Solflare, etc.).

Feature: Event Cancellation & Refunds (P1 — Post-MVP)

Description: Allow organizers to cancel events and trigger refunds to ticket holders

User Value: Buyer protection and trust

Business Value: Platform credibility

Acceptance Criteria:

 Organizer can cancel an event (status → ‘cancelled’)

 Active tickets are marked as ‘expired’

 Refund logic initiated (manual or automatic SOL return)

 Active marketplace listings for the event are invalidated

Note: Full automatic on-chain refunds require additional program logic. MVP may support manual refund tracking.

Feature: Ticket Revocation (P2)

Description: Organizers can revoke/invalidate specific tickets (e.g., fraud, duplicate)

Acceptance Criteria:

 Organizer can mark specific tickets as invalid

 Ticket status updated to ‘expired’

 Holder notified

Non-Functional Requirements
Performance

Transaction Confirmation: < 2 seconds (typical; network congestion may cause delays)

Program Execution: Deterministic & low compute budget

Concurrent Users: 10,000+ (depends on RPC provider capacity and rate limits)

Uptime: 99.9% (application layer; Solana network uptime is outside our control)

Security

Authentication: Wallet-based (Phantom/Solflare)

Authorization: Programmatic ownership checks

Data Protection: Cryptographic guarantees via Solana runtime

Compliance: Jurisdiction-dependent (handled externally)

Compliance

Jurisdiction-dependent regulatory requirements handled externally

NFT tickets may be classified as digital assets in some jurisdictions

No financial advice provided by the platform

Users responsible for tax implications of resale profits

GDPR/privacy: only public wallet addresses stored; no PII collected

Usability

Wallet-first UX

Minimal blockchain terminology

Mobile-friendly responsive UI

Scalability

Designed for high throughput without L2 dependencies

Quality Standards
Code Quality Requirements

Strict TypeScript for client

Rust-based Solana programs

Explicit error codes

Unit + integration tests mandatory

Design Quality Requirements

Consistent design system

Latency-optimized interactions

Clear transaction states

Non-Negotiables

No mock blockchain logic in production

No bypass of royalty rules

No silent transaction failures

UI/UX Requirements
Design Principles

Trust Transparency — Ownership & rules always visible

Latency Illusion — Perceived instant interactions

Wallet-Native Flows — No accounts/passwords

Information Architecture
├── Landing Page
├── Connect Wallet
├── Dashboard
│   ├── My Tickets
│   ├── My Events
│   └── Marketplace
├── Event Details
├── Resale Listing
└── Settings

Key User Flows
Flow 1: Ticket Purchase
graph LR
    A[Browse Event] --> B[Select Ticket]
    B --> C[Confirm Wallet Tx]
    C --> D[Ownership Transfer]
    D --> E[Success]

Flow 2: Ticket Resale
graph LR
    A[Select Owned Ticket] --> B[List for Resale]
    B --> C[Constraint Validation]
    C --> D[On-chain Listing]

Success Metrics
North Star Metric

Number of successfully settled on-chain ticket transactions

OKRs for MVP (First 90 Days)

Objective: Validate core protocol viability

KR1: 1,000+ tickets minted

KR2: <2s average confirmation time

KR3: ≥95% successful transaction completion

Metrics Framework
Category	Metric	Target	Measurement
Acquisition	Wallet connections	Growth trend	Analytics
Activation	First ticket mint/purchase	>30%	Program events
Retention	Repeat usage	Increasing	Wallet activity
Revenue	Protocol fees	Defined later	Treasury
Reliability	Tx failure rate	<5%	Logs
Constraints & Assumptions
Constraints

Budget: Lean / student-scale (primary costs: RPC provider fees, Supabase free tier, app store fees)

Timeline: MVP within 8–12 weeks (note: scope may require 12–16 weeks with a small team)

Resources: Small dev team (1–3 developers)

Technical: Solana + Rust stack (Anchor framework)

Assumptions

Users possess Solana wallets

Low-fee advantage improves adoption

Organizers value royalty enforcement

Open Questions

Custody & UX for non-crypto users

Legal treatment of NFT tickets

Fraud dispute mechanisms

Dependencies

Solana network stability

Metaplex ecosystem components

Wallet provider compatibility

Risk Assessment
Risk	Probability	Impact	Mitigation
Wallet UX friction	Medium	High	UX simplification, clear onboarding
Program vulnerabilities	Low	Critical	Audits, tests, bug bounty
Market adoption inertia	Medium	High	Incentive design, organizer outreach
Solana network outage	Low	High	Graceful degradation, retry logic, status page
RPC rate limiting	Medium	Medium	Fallback RPC providers, caching
Regulatory uncertainty	Medium	High	Legal review, jurisdiction-specific terms
Scalping via multiple wallets	High	Medium	Per-wallet purchase limits, analytics monitoring