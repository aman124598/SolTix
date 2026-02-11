Application Flow Documentation
1. Entry Points
Primary Entry Points

Direct URL:
User lands on the Landing Page. Application checks for an active wallet session.

Wallet connected → Redirect to Dashboard (the Home / My Tickets tab)

Wallet not connected → Display Landing Page

Landing Page:
Initial interface introducing the platform.

Displays value proposition (NFT tickets, resale control, royalties)

Primary CTA: Connect Wallet

Secondary CTA: Explore Events

Deep Links:
Entry via shared event links.

Wallet connected → Open Event Details

Wallet not connected → Prompt wallet connection → Return to Event Details

OAuth/Social Login:
Not applicable (wallet-native authentication model).

Secondary Entry Points

Search Engine:
Users land on Landing Page or Event Pages via SEO results.
Standard Direct URL behavior applies.

Marketing Campaigns:
Campaign-specific pages or links directing users to Event Details or Landing Page.

2. Core User Flows
Flow 1: Wallet Connection

Goal: Authenticate user identity via Solana wallet
Entry Point: Landing Page / Protected Routes
Frequency: Very High (required for blockchain actions)

Happy Path

Page: Landing Page

Elements: Hero section, Connect Wallet button

User Action: Clicks Connect Wallet

Trigger: Wallet provider modal opens

Wallet Provider Modal

Elements: Wallet options (Phantom, Solflare, etc.)

User Action: Selects wallet

Wallet Interaction

User Action: Approves connection request

System Action: Session Initialization

Capture wallet public key

Establish client session state

Redirect Logic

Navigate to Dashboard OR return to originating page

Error States

Wallet Not Installed

Display: Install wallet guidance

Action: Retry after installation

Connection Rejected

Display: Non-blocking notification

Action: User retries connection

Wallet Connection Failure

Display: Retry / switch wallet option

Wallet Modal Abandoned

Display: No visual change (modal dismissed)

Action: User can re-tap "Connect Wallet" to try again

System: No state change; wallet remains disconnected

Edge Cases

Wallet disconnect mid-session → Clear wallet state, clear cached balance, navigate to Landing Page. If a transaction is in-progress, show a "Transaction may still be pending on-chain" warning before clearing state.

Unsupported network → Prompt network correction

Exit Points

Success: Dashboard / Requested Page

Abandonment: Landing Page

Flow 2: Primary Ticket Purchase

Goal: Purchase NFT-based event ticket
Entry Point: Events Explorer / Event Details
Frequency: High (core business action)

Happy Path

Page: Events Explorer

Elements: Event list, filters

User Action: Selects event

Trigger: Navigate to Event Details

Page: Event Details

Elements: Event metadata, Buy Ticket button

User Action: Clicks Buy Ticket

Precondition Check

Wallet not connected → Trigger Wallet Connection Flow

System Action: Transaction Construction

Estimate total cost: ticket price + ~0.000005 SOL network fee

Display estimated fee to user before wallet prompt

SOL transfer instruction

NFT mint / transfer instruction

Wallet Interaction

User Action: Approves transaction

System Action: On-Chain Execution

Transaction submitted to Solana network

Expected confirmation time: < 2 seconds (devnet may vary)

NFT ticket minted/transferred

Ownership recorded

Success State

Display confirmation with transaction signature link

Ticket visible in My Tickets

Error States

Insufficient Balance

Display: Balance warning

Action: Retry after funding wallet

Transaction Rejected

Display: Notification

Action: Retry purchase

Transaction Failure

Display: Retry with error feedback

Edge Cases

RPC timeout → Retry with exponential backoff (max 3 attempts, delays: 1s, 2s, 4s). If all fail, show "Network Unavailable" error with manual retry button.

Duplicate transaction attempt → Prevent via isProcessing flag on Buy button (disabled + spinner while processing)

Exit Points

Success: My Tickets

Failure: Event Details

Flow 3: Ticket Resale

Goal: List & sell ticket within enforced rules
Entry Point: My Tickets
Frequency: Medium

Happy Path

Page: My Tickets

Elements: Owned ticket NFTs

User Action: Selects ticket → Clicks List for Resale

Page: Listing Interface

Elements: Price input, rule constraint display

Validation:

Price ≤ Maximum allowed price (set by organizer at event creation)

Price ≥ 0 (no negative listing prices)

Royalty percentage displayed (deducted from sale proceeds)

Resale rules compliance

Wallet Interaction

User Action: Approves listing transaction

System Action: Listing Recorded On-Chain

Buyer Flow

Buyer selects listing → Approves purchase transaction

System Action: Sale Execution

NFT transferred

Royalty auto-distributed

Seller receives funds

Success State

Listing removed

Ownership updated

Error States

Price Constraint Violation

Display: Inline validation error

Rule Violation

Display: Constraint explanation

Transaction Failure

Display: Retry guidance

Edge Cases

Ticket transferred before sale → Listing automatically invalidated; buyer sees "Listing no longer available" error. Seller's listing removed from marketplace with a push notification / in-app alert: "Your listing for [Event Name] has been invalidated because the ticket was transferred."

Wallet disconnect → Listing draft preserved in local state; user can resume after reconnecting

Exit Points

Success: Marketplace / My Tickets

Abandonment: Listing cancelled

3. Navigation Map
Primary Navigation

Landing Page

Events Explorer

Event Details

Dashboard

My Tickets

Marketplace

Settings

Navigation Rules

Authentication Required:

Dashboard

My Tickets

Marketplace Actions

Redirect Logic:

Unauthenticated actions → Prompt wallet connection

Authenticated users → Skip prompts

Back Button Behavior:

Preserve form & modal state

Prevent duplicate blockchain actions

4. Screen Inventory
Screen: Landing Page

Route: /

Access: Public

Purpose: Introduce application & initiate wallet connection

Key Elements:

Hero section

Connect Wallet CTA

Explore Events CTA

Actions Available:

Connect Wallet → Wallet Connection Flow

Explore Events → Events Explorer

State Variants: Default

Screen: Events Explorer

Route: /events

Access: Public

Purpose: Discover events & tickets

Key Elements:

Event list/grid

Filters / search

Actions Available:

Select Event → Event Details

State Variants: Loading, Empty, Error, Success

Screen: Event Details

Route: /events/:id

Access: Public

Purpose: Display event information & purchase options

Key Elements:

Event metadata

Buy Ticket CTA

Actions Available:

Buy Ticket → Primary Purchase Flow

State Variants: Loading, Error, Sold Out, Success

Screen: Dashboard

Route: / (Home Tab)

Access: Authenticated

Purpose: Overview of wallet balance, recent tickets, upcoming events

Key Elements:

Wallet balance display

Recent/upcoming tickets

Quick actions (Browse Events, View Tickets)

Actions Available:

Navigate to Events Explorer

Navigate to My Tickets

State Variants: Loading, Empty, Error, Success

Screen: My Tickets

Route: /tickets

Access: Authenticated

Purpose: Manage owned ticket NFTs

Key Elements:

NFT list

Resale / Transfer actions

Actions Available:

List for Resale → Resale Flow

Transfer Ticket → Wallet Transaction

State Variants: Loading, Empty, Error, Success

Screen: Marketplace

Route: /marketplace

Access: Public (purchase requires authentication)

Purpose: Browse and purchase resale ticket listings

Key Elements:

Active listings grid

Price / savings display

Buy button per listing

Actions Available:

Buy Listing → Purchase Flow (wallet required)

State Variants: Loading, Empty, Error, Success

Screen: Settings

Route: /settings

Access: Authenticated

Purpose: Manage wallet, preferences, and account settings

Key Elements:

Wallet address display

Balance display

Network info

Notification / biometric toggles (planned)

Disconnect wallet action

Terms of Service / Privacy Policy links

Actions Available:

Disconnect Wallet → Clear state, navigate to Landing Page

Open ToS / Privacy links

State Variants: Default, Loading

5. Interaction Patterns
Pattern: Wallet Transaction

Validation: Pre-flight simulation + On-chain validation

Loading State: Pending transaction indicator, disabled actions

Success: UI refresh & state sync

Error: Explicit error notification & retry option

Pattern: Infinite Scroll

Trigger: User scrolls near page end

Loading: Skeleton placeholders

End: “No more items” indicator

6. Decision Points
Decision: User Authentication Status

Wallet connected → Allow blockchain actions

Wallet not connected → Trigger Wallet Connection Flow

Decision: Ticket State

Available → Allow purchase/listing

Sold / Transferred → Disable actions

7. Error Handling Flows
404 Not Found

Display: Custom 404 page

Actions: Navigate to Home / Events Explorer

Log: Track invalid routes

Transaction Failure

Display: Contextual error message

Actions: Retry / View details

Fallback: Prevent duplicate execution

Network / RPC Failure

Display: Network warning banner

Actions: Retry automatically

Recovery: Resume pending actions

8. Responsive Behavior
Mobile-Specific Flows

Navigation: Hamburger menu

Actions: Bottom sheet interactions

Wallet Feedback: Full-screen transaction states

Desktop-Specific Flows

Navigation: Persistent top navigation

Actions: Modal-based interactions

Wallet Feedback: Inline overlays

9. Animation & Transitions
Page Transitions

Navigation: Fade transition (300ms)

Modal: Slide-up animation (200ms)

Drawer: Slide-in from side (250ms)

Micro-interactions

Button Click: Subtle scale feedback

Transaction Pending: Animated indicator

Success State: Checkmark animation