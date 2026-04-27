# From Demo → Functional App: Clean Slate + Magic Link Auth

This pass turns the platform from a steward demo into a real app for ~150 members, while preserving a one-click demo experience behind a footer link.

---

## 1. Strip dummy data, keep Maya as the demo persona

**Keep**
- `maya@test.com` profile (the linked demo experience)
- `admin@test.com` profile (real steward account — kept so you can log in as steward)
- `email_templates` rows (real config)
- Storage buckets, schema, RLS, triggers, functions

**Delete (via insert-tool DELETE statements)**
- All `transactions` rows
- All `calculation_runs` rows
- All `profile_history` rows
- All `waitlist` rows
- All `profiles` rows EXCEPT Maya and Admin
- The corresponding `auth.users` rows for the deleted profiles (Alex, Jordan, Taylor, Sam, Dana, Casey) so emails free up
- All `user_roles` rows for deleted users (admin role for `admin@test.com` is preserved)

**Re-seed for the demo persona only**
- A single `calculation_runs` row dated this month
- 2 `transactions` rows for Maya: one she sends (to admin), one she receives (from admin) — so `/home`, `/transactions`, `/card` all show populated state when entering as the demo user

**Mock data files** (`src/data/mockMember.ts`) — keep as-is. Events and Board are still mock by design (called out in earlier handoff doc); they render the same whether you're the demo user or a real new member. Real persistence is a separate follow-up.

---

## 2. Magic link auth

Add **passwordless email login** alongside existing email/password.

**Login page (`src/pages/Login.tsx`)**
- New tabbed UI: "Magic Link" (default) and "Password"
- Magic link tab: single email field + "Send me a sign-in link" button → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/home', shouldCreateUser: false } })`
- Toast on success: "Check your email for a sign-in link"
- Password tab: existing email/password form (kept for the steward and as fallback)
- Remove the two big "Demo as Maya / Demo as Steward" buttons from this page (the demo entry point moves to the footer — see §3)

**Signup page (`src/pages/Signup.tsx`)**
- Add a prominent option at the top: "Sign up with a magic link instead" → expands a single-field magic-link signup using `signInWithOtp` with `shouldCreateUser: true` and the new-user metadata (name only at this stage). For the rich profile fields (income, ZIP, Venmo, etc.), redirect to `/profile` after first sign-in with a one-time "Finish your profile" banner so members aren't blocked at the door.
- Keep the existing 2-step email/password signup as the alternate path.

**`/auth/callback` handling**
- Supabase magic links land at `emailRedirectTo` (`/home`) with the session already established by the SDK on `onAuthStateChange`. No new route needed — `AuthContext` already handles this.

**Email templates**
- Magic link emails currently use Lovable's default templates. **No template scaffolding in this pass** — defaults work and ship the magic link immediately. We can brand them later (separate ask).
- Confirm in Cloud → Auth that "Enable email confirmations" stays on and "Enable magic link" is on. (No tool change needed if defaults; flagging so the steward verifies.)

---

## 3. "Try the demo" footer link

In `src/components/Layout.tsx` footer:
- Add a small link: **"Try a live demo →"** that navigates to a new `/demo` route.
- New page `src/pages/Demo.tsx`: brief explainer ("Sign in as Maya to see what a member sees") + one button that runs the existing `signInWithPassword({ email: 'maya@test.com', password: 'test1234' })` and routes to `/home`. Also a smaller "Sign in as the steward" button for admin demo.
- This is the ONLY remaining entry point for hardcoded demo credentials. Keeps the rest of the app feeling like a clean product.

---

## 4. Files touched

**Edited**
- `src/pages/Login.tsx` — tabbed magic link / password, remove demo buttons
- `src/pages/Signup.tsx` — add magic-link option at top
- `src/components/Layout.tsx` — footer "Try a live demo" link
- `src/App.tsx` — register `/demo` route (public)

**Created**
- `src/pages/Demo.tsx` — one-click demo entry for Maya / Steward

**Database (insert-tool, not migrations — data only)**
- DELETE transactions, calculation_runs, profile_history, waitlist
- DELETE profiles + auth.users + user_roles for the 6 non-demo seed accounts
- INSERT 1 calculation_run + 2 transactions for Maya so the demo lands on populated screens

**No schema changes.** No new tables, no new RLS, no migrations.

---

## 5. Out of scope (call out for next pass)

- Branded magic link email template (defer — defaults work; brand later via auth email scaffolding)
- Real persistence for Events / Board / Ways to show up
- Password reset flow (`/reset-password`) — **strongly recommend as the very next pass** before onboarding 150 real members
- Wiring up actual transactional email send on monthly run
- Removing the steward backdoor on `/demo` once you have real admin credentials in production

---

## 6. After-the-fact verification checklist

- `/` clean — no member photos pre-loaded except Maya in the demo flow
- Footer shows "Try a live demo" link
- `/demo` lands you in as Maya in one click; `/home` and `/transactions` show real data
- `/login` magic link tab sends a real email; clicking the link logs you in to `/home`
- `/signup` magic link path creates an `auth.users` + `profiles` row, redirects to `/profile` with a "finish your profile" hint
- Existing `admin@test.com` / `test1234` password login still works and reaches `/admin`