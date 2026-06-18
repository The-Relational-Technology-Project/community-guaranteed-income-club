
This is a large batch. Below is grouped by area. Tell me to skip anything or split into phases.

## 1. Admin management
- Add an **Admins** sub-tab in `/admin` that lists current admins (joins `user_roles` + `profiles`) and the `admin_allowlist` (pending-by-email).
- Alex can: add an email to `admin_allowlist` (auto-promotes existing users immediately via a new `promote_existing_admin` step; pre-existing trigger handles future signups), or revoke an admin (delete `user_roles` row + remove allowlist entry).
- README/About: short note explaining "How to add an admin" for Alex.

## 2. Landing page
- New **Donate** CTA section: a card linking to `https://venmo.com/fuzzywonton` with copy "Support the Club — Venmo @fuzzywonton (not tax-deductible, very much appreciated)."
- Replace the hard-coded stats strip with live numbers:
  - **Members**: count of `profiles` where `participant_status='active'`.
  - **$ moved**: sum of `transactions.amount` from finalized runs **+ baseline $21,000**.
  - **Gatherings**: count of `events` rows (all time).
  - **% completed**: `is_confirmed_sender` / total transactions (keep "100%" fallback if no data).

## 3. Auth/login email
- Confirm `FROM_ADDRESS` already reads `Baltimore Community Guaranteed Income Club <notifications@communityguaranteedincome.club>` — change sender display name to **"Community Guaranteed Income Club"** (drop "Baltimore").
- Rewrite the `magiclink`/`login` template in `auth-email-hook` to match brand voice (warmer, club tone, "see you soon" footer, gathering nod). Apply the same brand polish to signup/recovery/invite templates.
- Redeploy `auth-email-hook`. No new Resend key needed (`RESEND_API_KEY` already set).

## 4. Gatherings (rename Events)
- Rename page title and nav link "Events" → "Gatherings". Keep `/events` route for now (no broken links).
- Tabs at top: **Upcoming** (default, `date >= today`) and **Past** (descending).
- **RSVP**: new `event_rsvps` table (`event_id`, `user_id`, `created_at`, unique pair). Members tap "I'll be there" / "Can't make it". Card shows attendee avatars + count, with a "See who's going" popover listing names linking to roster profiles.

## 5. Offers & needs board
- Seed 3 **example** posts (the haircuts/BWI/admin role copy from the screenshot), authored by a synthetic "Example" badge, and label them visually as "EXAMPLE" so members know.
- Member home: replace `mockBoardPosts` with a live query of the 3 most recent `board_posts` (examples included). Auto-refreshes via reload on focus.
- **Archive/complete**: add `archived_at`, `archived_by`, `helped_by` (FK to profiles, nullable) columns to `board_posts`. Creators and admins see an "Archive" button; archiving opens a small dialog asking "Who helped / took this up?" (searchable list of club members, optional skip). Archived posts are hidden from the board by default; admins get a "Show archived" toggle.
- Author name on each post is a link to `/roster?member=<id>` (Roster page opens the member dialog by query param).

## 6. About page admin
- New `AdminContentTab` (extend the existing one) gives admins a rich textarea editor for each `site_content` row in section `about` (story, what's a chapter, how it works, beyond money). Save updates `body` + `updated_by`.
- About page swaps the hard-coded cards for these `site_content` rows, falling back to current copy if a row is missing.

## 7. Member home wiring
- "Your connection this month" already pulls from `transactions`; add a live `supabase.channel` subscription so it refreshes when the admin runs the math or when the user confirms a send.
- "Welcome a new member → say hi": opens the newest-active member's roster profile dialog (Roster route with query param).
- "Host a small skill share": navigates to `/events?new=1` which auto-opens the create-event modal.
- "Lend a hand with a task": navigates to `/board?filter=need`.
- "Check in on a neighbor": calls `send-email` edge function with a new kind `check_in_intent`, which emails `ADMIN_NOTIFY_EMAIL` (Alex) with the member's name + a short note field.

## 8. Profile contact preferences
- New optional profile fields: `preferred_contact_method` (enum: text/call/email/signal/none), `contact_handle` (free text). Profile page shows these with a note: "Visible to other club members." Roster member dialog displays them.

## 9. Rename Roster → Our Club / Directory + network viz
- Sidebar nav: "Community Roster" → "**Club Directory**". Roster page header: "**Our Club**" with subtitle "Directory + network".
- Add a second tab on the Our Club page: **Network**, rendering an anonymized force-directed graph (using `react-force-graph-2d`) where:
  - Each node = one active member (no name/ID label, just a colored dot).
  - Edges drawn when any of: there's a `transactions` row between the two, both attended the same `event` (via `event_rsvps`), or one is the `helped_by` on the other's archived board post.
- Hovering a node shows total connection count only (still anonymous).

## Technical notes
- Migrations needed (one batched migration):
  - `event_rsvps` table + RLS (members read all, insert/delete own).
  - `board_posts`: add `archived_at timestamptz`, `archived_by uuid`, `helped_by uuid` + policy update so creator/admin can update.
  - `profiles`: add `preferred_contact_method text`, `contact_handle text`.
  - `site_content` seed rows for `section='about'` (4 cards).
  - SQL function `promote_existing_admin(email)` for the Admins tab.
- New edge function kind in `send-email`: `check_in_intent` → ADMIN_NOTIFY_EMAIL.
- New deps: `react-force-graph-2d` (and its `d3-force` peer).
- Files touched (approx): `App.tsx`, `Landing.tsx`, `Layout.tsx`/`MemberLayout.tsx` (nav rename), `MemberHome.tsx`, `Roster.tsx` (+ split into tabs), `Board.tsx`, `Events.tsx`, `About.tsx`, `Profile.tsx`, `admin/AdminDashboard.tsx`, new `admin/AdminAdminsTab.tsx`, `admin/AdminContentTab.tsx` (extend), edge functions `send-email/index.ts`, `auth-email-hook/index.ts`, `_shared/email.ts`.

## Open questions before I build
1. **Donate CTA placement**: dedicated section between Calculator and final CTA, or a smaller block inside the final CTA? (I'll default to its own section.)
2. **Network graph**: is the public-roster page (members-only, but still shows real names elsewhere on the same page) the right home? Or should the graph be admin-only? (Default: members-only, anonymous nodes as you described.)
3. **Examples on the board**: keep them forever, or auto-hide once there are ≥ 5 real posts? (Default: keep, just labeled.)

If those defaults work, say "go" and I'll execute. Otherwise tell me the tweak and I'll re-plan.
