
# Admin transaction visibility, member history, steward-managed accounts

Scope this round: feedback items **#1, #2, #3, and the no-email accessibility item** (as steward-managed accounts). Holding **#4 nudge automation, #5 Resend/Lovable Emails, #6 magic links** — all blocked on choosing the email domain. SMS-based accounts deferred until Twilio is connected.

---

## #1 — Admin: Sent & Received side-by-side per member

**Edit `src/components/admin/AdminMembersTab.tsx`**
- Convert the existing single-row member table into rows that **expand** on click (chevron toggle), revealing a per-member panel.
- New component `src/components/admin/MemberTransactionPanel.tsx`:
  - Two columns: **Sent** (left) and **Received** (right).
  - Each column lists transactions newest-first, grouped by `calculation_runs.run_date` (month header).
  - Shows: counterparty name + photo, amount, sender-confirmed ✓ / receiver-confirmed ✓ badges, `created_at`.
  - Footer totals: lifetime sent, lifetime received, net.
  - Empty state per column ("No sends yet" / "No receipts yet").
- Query: one `transactions` select filtered by `sender_id.eq.{id},receiver_id.eq.{id}` plus a profiles lookup map (already in props) and a runs map (already in props). No new RPC.

## #2 — Admin: Global transactions ledger

**Edit `src/pages/admin/AdminDashboard.tsx`**
- Add a new tab **Transactions** (icon: `ArrowLeftRight`) between Math and Emails.
- New component `src/components/admin/AdminTransactionsTab.tsx`:
  - Full table of every `transactions` row, joined with sender + receiver profile (name, photo).
  - Filters: run (dropdown of recent runs), confirmation status (all / pending sender / pending receiver / fully confirmed), free-text search on member names.
  - Each row: date · sender → receiver · amount · sender-confirmed badge · receiver-confirmed badge · row actions menu.
  - Row action: **"Mark sender confirmed (manual)"** / **"Mark receiver confirmed (manual)"** — admin override that writes `is_confirmed_*` + `confirmed_*_at = now()`. RLS already permits admins via the `Admins can manage transactions`-style policies; the existing UPDATE policies cover sender/receiver self-confirm — we'll add a small admin UPDATE policy via migration so admins can override either side.
  - CSV export button (client-side) for the currently-filtered set.

**Migration**: add policy `Admins can update any transaction` on `transactions` for `UPDATE` using `has_role(auth.uid(), 'admin')`.

## #3 — Member profile: transaction & confirmation history

**Edit `src/pages/Profile.tsx`**
- Below the existing form, add a new section using new component `src/components/profile/TransactionHistory.tsx`.
- Shows the signed-in user's own transactions, grouped by month (run), split into **You sent** / **You received**.
- Each item: counterparty name + photo, amount, your confirmation status with a quick "Mark sent" / "Mark received" inline action when still pending (re-uses the same update logic that `Transactions.tsx` already uses, so we'll factor a tiny shared helper `src/lib/confirmTransaction.ts`).
- Footer: lifetime totals (sent / received / count of months participated).
- No schema change. RLS already lets a user select their own transactions.

## No-email accessibility — Steward-managed accounts

The lead admin asked for accessibility for people without email. We're handling it as **steward-created accounts with placeholder emails**. SMS comes later when Twilio is wired.

**Migration**
- Add column `profiles.is_steward_managed boolean not null default false`.
- Add column `profiles.contact_method text` (`'email' | 'phone' | 'in_person'`, default `'email'`) — informational; the auth row still uses an email under the hood.
- Add column `profiles.contact_notes text` — free text for steward (e.g. "call Tuesdays after 5pm", "drops by the library").

**Admin UI — `AdminMembersTab.tsx`**
- New button **"Add member without email"** opens a dialog (`src/components/admin/AddManagedMemberDialog.tsx`):
  - Fields: name (required), phone, ZIP, contact method (`phone` / `in_person`), contact notes, post-tax monthly income, Venmo handle.
  - Submission calls a new edge function `admin-create-managed-member` that:
    1. Verifies the caller is admin (validates JWT + checks `user_roles`).
    2. Creates an `auth.users` row via the service-role admin API with a synthetic email `managed-{shortid}@no-email.local` and a random password (never surfaced).
    3. The existing `handle_new_user` trigger creates the matching `profiles` row.
    4. Patches the new profile with the dialog's fields + `is_steward_managed = true` + `contact_method` + `contact_notes`.
    5. Returns the profile id.
  - On success, refresh the members list and toast.
- Members table: show a small **"Steward-managed"** badge next to managed members and surface `contact_method` + `contact_notes` in the expanded panel from #1 so the steward knows how to actually reach them at handoff time.

**Member-experience implications**
- Steward-managed members can still appear as senders/receivers in `transactions` exactly like normal members — the algorithm in `AdminMembersTab.runCalculation` doesn't care.
- Confirmation buttons for them are clicked **by the steward** from the new admin transactions ledger (#2's manual-confirm action). No member-side login required.

**Edge function** `supabase/functions/admin-create-managed-member/index.ts`
- Standard CORS + JSON validation (Zod).
- Uses `SUPABASE_SERVICE_ROLE_KEY` (already a secret).
- Will be deployed automatically.

## Holds — confirming what we're NOT doing this pass

- **#4 Auto-nudge after n+2 days unconfirmed** — needs an email sender. Hold until domain.
- **#5 Resend vs Lovable Emails** — will recommend Lovable Emails (built-in, no key) when we get to it; final call after domain pick.
- **#6 Magic links** — already partially built into login/signup but the magic-link delivery itself rides on whichever email setup we land on. Hold the deeper work until domain.
- **SMS accessibility** — held for Twilio.

## Files

**Created**
- `src/components/admin/MemberTransactionPanel.tsx`
- `src/components/admin/AdminTransactionsTab.tsx`
- `src/components/admin/AddManagedMemberDialog.tsx`
- `src/components/profile/TransactionHistory.tsx`
- `src/lib/confirmTransaction.ts`
- `supabase/functions/admin-create-managed-member/index.ts`

**Edited**
- `src/components/admin/AdminMembersTab.tsx` (expandable rows + Add managed-member CTA + badges)
- `src/pages/admin/AdminDashboard.tsx` (new Transactions tab, fetch wiring)
- `src/pages/Profile.tsx` (mount TransactionHistory)
- `src/pages/Transactions.tsx` (refactor confirm logic to use shared helper — no UX change)

**Migrations**
1. `profiles`: add `is_steward_managed`, `contact_method`, `contact_notes`.
2. `transactions`: add `Admins can update any transaction` RLS policy.

No changes to: auth flow, calculation algorithm, existing member nav, mock event/board data.

## Verification checklist

- Admin → Members: clicking a member row expands to two-column Sent/Received history with totals.
- Admin → Transactions: every transaction visible, filterable by run + status, searchable by name, manual-confirm overrides write to DB and reflect immediately.
- Profile (any signed-in member): "Your transaction history" section shows their own past sends/receipts grouped by month with inline confirm for pending items.
- Admin can add a member with no email; that member shows up in the roster with a "Steward-managed" badge, gets included in the next monthly calculation, and the steward can mark their transactions confirmed manually.
- No regressions in `/demo`, magic-link login, or admin login.
