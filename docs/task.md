# FinTrace Implementation Tasks

## Phase 1 — Backend Core
- [x] Initialize Express, TypeScript, Drizzle, and SQLite project structure
- [x] Define database schema and run the first migration (`drizzle-kit push`)
- [x] Implement Setu client for consent creation, data session, and fetch
- [x] Build webhook handler to log consent approvals and trigger data fetch
- [x] Build transform layer and narration parser to extract sender/receiver
- [x] Implement CRUD API routes for transactions and tags

## Phase 2 — Frontend Shell
- [x]  Vite, React, TypeScript, Tailwind CSS, and shadcn/ui
- [x] Configure React Router with main pages (Dashboard, Transactions, Tags, Fetch)
- [x] Build API client (`lib/api.ts`) with typed responses for backend communication
- [x] Implement transaction table component with tag assignment UI
- [x] Build the tag manager page (create, color, delete)

## Phase 3 — Analytics
- [x] Develop Analytics API endpoints (by-tag, monthly, overview)
- [x] Build the Dashboard using Recharts (donut chart, bar chart, overview cards)
- [x] Wire up the outlier toggle and ensure analytics re-fetch on change

## Phase 4 — Polish
- [ ] Add manual sync button and consent flow redirect UI
- [ ] Display untagged transactions count and implement quick-tag workflow
- [ ] Add date range filter across all relevant views
- [ ] Improve global error handling and UI loading states
