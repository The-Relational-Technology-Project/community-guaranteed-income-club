

# Baltimore Community Guaranteed Income Program -- Build Plan

## Overview

A web app where community members sign up, manage their own profiles, and each month an admin clicks a button to calculate income redistribution. Participants get personalized transaction notifications showing who to pay/receive, with deep links to Venmo/PayPal and confirmation checkboxes. Built on an external Supabase project with the same 7%-pool-and-redistribute algorithm you currently run in Python.

---

## Architecture

```text
┌─────────────────────────────────────────────┐
│  Public Pages (no auth)                     │
│  - Landing / About                          │
│  - Sign Up (creates account + profile)      │
│  - Pilot Results / Events info              │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Member Pages (auth required)               │
│  - My Profile (edit income, bio, photo)     │
│  - Roster (grid of smiling faces + bios)    │
│  - My Transactions (current month)          │
│    → personalized: photo of sender/receiver │
│    → Venmo deep link + confirmation checkbox│
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Admin Pages (admin role required)          │
│  - Dashboard: all members, statuses         │
│  - Run Calculation button (or schedule)     │
│  - Transaction history & audit log          │
│  - Waitlist management                      │
│  - Integrations (PayPal/Venmo API keys)     │
└─────────────────────────────────────────────┘
```

---

## Database Schema (Supabase)

**profiles** -- one per user, linked to `auth.users`
- id (FK to auth.users), name, email, phone, venmo_handle, zelle_info, zip_code, post_tax_monthly_income, student_loan_payment, profession, employment_status, bio, photo_url, is_verified, participant_status (active / waitlisted / inactive), created_at, updated_at

**profile_history** -- audit trail (trigger-populated on every update)
- id, profile_id, changed_fields (jsonb), old_values (jsonb), new_values (jsonb), changed_at, changed_by

**user_roles** -- standard roles table (admin, member)

**calculation_runs** -- each time the redistribution is calculated
- id, run_date (month), average_income, total_pool, status (draft/finalized), created_by, created_at

**transactions** -- individual send/receive assignments per run
- id, run_id, sender_id, receiver_id, amount, venmo_deep_link, is_confirmed_sender, is_confirmed_receiver, confirmed_at, created_at

**waitlist** -- people who signed up but are net receivers waiting for balance
- id, profile_id, joined_at, activated_at, status (waiting/activated)

---

## Key Features, Step by Step

### Phase 1: Foundation
1. **Connect external Supabase** and create the database schema (migrations + RLS policies)
2. **Auth**: Email/password signup with profile creation in one flow. Collect: name, contact, Venmo, ZIP, income, loans, profession, employment status, bio, photo upload
3. **Landing page**: Program description, how it works (inspired by Co Mingle's explanation), sign-up CTA
4. **Info pages**: Pilot results from April 2025, upcoming events

### Phase 2: Member Experience
5. **My Profile page**: Edit your own info, see change history. Income updates trigger audit log
6. **Roster page**: Grid/card view of all active participants -- photo, name, bio, profession, ZIP. Income and loans hidden
7. **My Transactions page**: After calculation runs, shows personalized cards with the other person's photo and name, amount, Venmo deep link button (`venmo://paycharge?txn=pay&recipients=HANDLE&amount=X&note=Community%20Income`), and a confirmation checkbox

### Phase 3: Admin & Calculation
8. **Admin dashboard**: View all members, toggle participant status, manage waitlist, approve new signups
9. **Redistribution engine** (Edge Function): Implements the 7% algorithm:
   - Take each active participant's income x 0.07
   - Sum into pool, divide equally among all active participants
   - Difference = what each person sends or receives
   - Pair senders to receivers to minimize number of transactions
   - Populate transactions table
10. **Run button + optional scheduling**: Admin clicks to run for current month. Future: toggle for automatic 1st-of-month execution via pg_cron
11. **Transaction history**: Full audit view of all months, amounts redistributed, confirmation status

### Phase 4: Waitlist & Verification
12. **Waitlist logic**: New signups who would be net receivers go to waitlist. When a net giver joins, waitlisted receivers can be activated to maintain balance
13. **Verification flow**: Mark members as verified (someone in group vouches). Future: ZIP-code matching for intro conversations with existing members

### Phase 5: Payments Integration
14. **PayPal/Venmo API** integration via Edge Function for automated payouts (same pattern as your Peps project -- store API keys as secrets, admin triggers payouts)
15. **Venmo deep links** as the simpler default for peer-to-peer sending

### Phase 6: Notifications
16. **Email notifications** when transactions are calculated -- personalized with sender/receiver details, amounts, and action links

---

## Technical Details

- **Redistribution algorithm** ported to TypeScript in a Supabase Edge Function. Same math: `contribution = income * 0.07`, `share = total_pool / num_participants`, `net = share - contribution`. Positive net = receive, negative = send. Transaction pairing minimizes transfers.
- **Audit trail**: Postgres trigger on `profiles` table writes to `profile_history` on every UPDATE, capturing old/new values and timestamp.
- **Venmo deep links**: `venmo://paycharge?txn=pay&recipients=${handle}&amount=${amount}&note=Baltimore%20GI%20Program`. Falls back to `https://venmo.com/` web URL on desktop.
- **Photo storage**: Supabase Storage bucket with RLS -- members can upload/update their own photo.
- **RLS policies**: Members read own profile + roster view (limited fields). Only admins can change participant_status or run calculations. Transaction confirmations editable only by the sender/receiver of that transaction.
- **No animal aliases needed** -- the new system shows real names only to authenticated members, and transaction details are private to the two parties involved.

---

## Build Order (Implementation Sequence)

1. Connect Supabase + create all migrations
2. Landing page + auth flow + profile creation
3. Member profile editing + roster
4. Admin dashboard + member management
5. Redistribution Edge Function + run button
6. Transaction cards with Venmo links + confirmations
7. Audit history + waitlist logic
8. PayPal/Venmo API integration
9. Email notifications
10. Info pages (pilot results, events)

