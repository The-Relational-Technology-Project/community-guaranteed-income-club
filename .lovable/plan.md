## Goal
Address Alex's QA feedback so the Club is fully hand-off ready.

## A. Member home / dashboards
1. **"Your connections this month" fix** — debug the MemberHome query; add a Realtime subscription on `transactions` invalidating the query, and verify the month/run filter.
2. **Dynamic member count** — replace hardcoded "50 members strong" everywhere (`rg` across Landing, About, MemberHome, etc.) with live `count(active profiles)`.
3. **About link in member header** — add to `MemberLayout` top-right nav.
4. **Member-facing stats page** at `/stats` — stripped public version of admin dashboards (totals, distribution math, growth) — no per-person financials.

## B. Roster & Network
5. **Network graph for new members** — debug node build; ensure every active member becomes a node even with zero edges, ids match `profiles.id`, and `members_directory` includes recent additions.
6. **Hide search bar on Network tab** — render search only on Directory tab.
7. **Avatar circle aspect ratio** — fix mobile clipping (square wrapper + `object-cover`).
8. **Joined date** — show "Joined {Mon YYYY}" on roster cards and profile.
9. **Welcome-a-new-member prompt** → `/roster?filter=newcomers` (joined ≤ 90 days; fallback to last 3 joiners). Add filter chip.
10. **Referrals + gold stars** — `referred_by uuid` on profiles; computed count exposed via `members_directory`; show ★× count on roster card & profile **only when > 0**.
11. **Public activity stats per member** — counts of posts authored, responses, RSVPs; shown on profile & roster card.

## C. Profile / signup
12. **Payment selector** — dropdown {Venmo, Zelle, CashApp, Other} + handle input. Helper: "Please provide one — Venmo is default." Migrate existing `venmo_handle` data into new `payment_method`/`payment_handle` columns.
13. **Required signup fields** — name, phone, email, payment method+handle, ZIP, post-tax monthly income, profession, employment status, bio. Zod validation with clear errors.
14. **Referral code field on signup** — accept **any** of {code, name, phone, email}; server resolves to a `profiles.id` and stores in `referred_by`. Generate a short `referral_code` per profile for sharing.

## D. Community Board
15. **Comments on posts** — new `board_comments` (post_id, author_id, body) with GRANTs + RLS; threaded display under each post; Realtime invalidation.
16. **"Check in on a neighbor" auto-match** — pick a **random eligible** active member (exclude self & recently-matched), show match in-app, still email Alex. Log to new `neighbor_checkins` table.
17. **Undo Sent/Received** — clicking confirmed status again toggles it off; optimistic UI.

## E. Admin
18. **Neighbor check-in audit** under Admin → Members.
19. **Referral count column** on admin members view.

## Technical notes
- New tables (with GRANTs + RLS): `board_comments`, `neighbor_checkins`.
- New `profiles` columns: `referred_by uuid`, `referral_code text unique`, `payment_method text`, `payment_handle text`, (already has `created_at` → use as `joined_at`).
- Update `members_directory` view: add `joined_at`, `referred_by`, `referral_count`, `payment_method`, activity counts. Keep sensitive fields out.
- Realtime publication: ensure `transactions`, `board_posts`, `board_comments`, `event_rsvps` included.
- Undo toggle: flip `is_confirmed_sender/receiver` to false when already true.
- Newcomer logic in `Roster.tsx`: `joined_at >= now() - interval '90 days'`, else last 3 by `joined_at desc`.

## Execution order
1. DB migration (columns, tables, view, publication, grants, RLS).
2. Frontend: payment selector + required signup + referral code, profile/roster joined date & stars & activity stats.
3. Realtime + connections-this-month fix; dynamic member count; About nav; member stats page.
4. Network graph fix + Directory/Network search separation + avatar circle fix.
5. Board comments; neighbor auto-match + audit; undo Sent/Received.
6. Verify with build + Playwright smoke on key pages.