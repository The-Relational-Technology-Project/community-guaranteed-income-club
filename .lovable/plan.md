

# Baltimore Mutualist Club — Major Rebrand & Member Experience Overhaul

A unified end-to-end demo: this site becomes the **public landing + admin** layer, with a fully fleshed-out **signed-in member experience** inspired by Baltimore Connect (relational, serif/cream aesthetic) and Baltimore Neighborly (mutual support cards). Mutual aid expands beyond payments into events, a community board, skills/offers, and help requests.

## 1. Brand & Aesthetic Refresh

- **Rename throughout** to **"The Baltimore Mutualist Club"** (page titles, nav, About, Landing, footer, email templates, meta tags).
- Adopt the **Connect aesthetic**: warm cream background, deep forest green primary, gold accent, Lora serif headings + Inter body. Replaces the current bold Mamdani/Oatly palette.
- Update `src/index.css` design tokens (HSL vars: cream `39 45% 93%` bg, forest `155 24% 23%` primary, gold `41 49% 56%` accent, smaller radius `0.75rem`).
- Update `tailwind.config.ts` font families: `serif: Lora`, `sans: Inter`. Add Google Fonts link in `index.html`.
- Copy the crest image (`user-uploads://ChatGPT_Image_Apr_20_2026_09_14_51_AM.png`) to `src/assets/crest.png` and feature it prominently on the **About** page (and as a small mark on the landing/membership card).

## 2. Landing Page — New Story

Rewrite `src/pages/Landing.tsx` in the Connect serif style with the new narrative:

- Hero: crest mark + "**The Baltimore Mutualist Club** — A community of Baltimoreans who actually show up for each other."
- **The new story** section: "There are people who care enough to join this. **100% of peer-to-peer payments get made.** We have fun and show up for each other — gatherings happen every month."
- Keep the interactive 7% calculator (re-skinned to the new tokens).
- Keep Robin Wall Kimmerer "Serviceberry" quotes (already added).
- "How it works" — peer-to-peer, no pooling, person-to-person via Venmo/Zelle.
- Stats strip: 50+ members · $23k+ moved · monthly gatherings · 100% completion.
- CTAs: **"Join the Club"** (→ /signup) and **"Chat with a member"** (→ /signup with note, or opens a Calendly-style placeholder dialog explaining a current member will reach out).
- Lineage line: "susu, tanda, hui, kye, tanomoshi — we're carrying it forward."

## 3. About Page — Crest

- Add the crest image at the top of `src/pages/About.tsx` (centered, ~280px).
- Soften copy to the new brand tone, keep Pilot Results & Goals cards, restyled.

## 4. New Signed-In Member Experience

Replace today's bare logged-in Index with a rich **member home** modeled on Connect's `Home.tsx` plus Neighborly's "Ways to show up" cards.

### New layout: `src/components/MemberLayout.tsx`
- Mobile bottom nav + desktop left rail with: **Home, Roster, Card, Events, Board, Profile**.
- Renders only for authenticated users; public pages keep the existing `Layout`.

### New page: `src/pages/MemberHome.tsx` (route `/home`)
Sections (all wired to live data where possible, mock fallback otherwise):
1. **Greeting** — "Hey, {firstName}" + "April 2026 · 50 members strong".
2. **This month's connection** — your assigned send (real `transactions` row for current month), with photo, third-space, $ amount, note textarea, Venmo/Zelle buttons, "I've sent this" checkbox (writes `is_confirmed_sender`). If no run yet, show a friendly empty state.
3. **Last month received from** — quote-style card.
4. **Upcoming gatherings** — 3 events with RSVP toggle (mock for now).
5. **Ways to show up** — 4 mutual-aid cards (Neighborly-style): new-member welcome, group learning, help-with-task, emotional support. Local state, optimistic toasts.
6. **Offers & needs board** preview — 3 most recent posts + "See full board".
7. **Your network** — "You've exchanged support with N members" + link to Roster.

### New page: `src/pages/MemberCard.tsx` (route `/card`)
Connect-style **digital membership card**:
- Forest gradient, gold ring, cream type, dot pattern overlay.
- Member photo, name, "Member since {month year}", referral code (auto-derived: `BMC-` + last 4 of user id).
- "Add to Apple/Google Wallet" buttons (toast: "Coming soon — screenshot for now").
- Copy referral code button.

### New page: `src/pages/Events.tsx` (route `/events`)
Full gatherings list with RSVP. Mock data initially (Spring Potluck, Skills Workshop, Monthly Hangout).

### New page: `src/pages/Board.tsx` (route `/board`)
Community Board with categorized posts (Offer / Need / Job lead) and a compose form. Mock data initially with a clear "demo data" note for the steward.

### Roster restyle
Keep the existing real-data roster but restyle to the new tokens; add a **skills/offers chip strip** at the top (mock skills until we add a column).

### Sign-in redirect
After login (and on `/`-while-authenticated), redirect to `/home` instead of leaving the user on the marketing landing.

## 5. Demo-ability End-to-End

- Seed mock data files for events, board posts, and "ways to show up" so the steward can click through immediately.
- Add a **"Demo as Maya"** quick-login chip on the Login page (pre-fills `maya@test.com` / `test1234`) so the steward gets in in one click.
- Verify the existing admin flow (Math → Run, Emails, KPI dashboard) is reachable from a small "Admin" link in the member nav when `isAdmin`.

## 6. Technical Details

**Files created**
- `src/assets/crest.png` (copied from upload)
- `src/components/MemberLayout.tsx`
- `src/pages/MemberHome.tsx`
- `src/pages/MemberCard.tsx`
- `src/pages/Events.tsx`
- `src/pages/Board.tsx`
- `src/data/mockMember.ts` (events, board posts, ways-to-show-up cards)

**Files edited**
- `src/index.css` — new HSL design tokens (cream/forest/gold).
- `tailwind.config.ts` — Lora/Inter font families.
- `index.html` — Google Fonts link, title, meta to "The Baltimore Mutualist Club".
- `src/pages/Landing.tsx` — full rewrite to Connect-style narrative + new story + interactive calculator restyled.
- `src/pages/About.tsx` — crest image at top, copy/style refresh.
- `src/pages/Roster.tsx` — restyle, add skills chip strip.
- `src/components/Layout.tsx` — auto-redirect authenticated users from `/` → `/home`; public-only nav.
- `src/pages/Login.tsx` — "Demo as Maya" one-click button.
- `src/App.tsx` — register `/home`, `/card`, `/events`, `/board` (all `ProtectedRoute`).
- Email templates table — replace "Society" wording with "Club".

**Data**
- No schema migrations required for this pass (events/board/skills are mock to keep demo fast). Real `transactions` and `profiles` continue to power the "this month's connection" card and Roster.
- Future follow-up (not in this pass): `events`, `event_rsvps`, `board_posts` tables.

**Routing flow**
```text
Public:   /  /about  /login  /signup
Member:   /home  /roster  /card  /events  /board  /profile  /transactions
Admin:    /admin   (link surfaced in member nav when isAdmin)
```

**Design tokens (key changes)**
```text
--background  39 45% 93%   (cream)
--foreground  155 36% 17%  (deep forest)
--primary     155 24% 23%
--accent      41 49% 56%   (gold)
--radius      0.75rem
serif: Lora · sans: Inter
```

## 7. Out of Scope (call out for later)

- Persisting events/board/RSVPs to the database (mock-first for demo speed).
- D3 network graph from Connect (heavy; defer unless you want it now).
- Wallet pass generation (placeholder toast).

