# Community Guaranteed Income Club

**A guaranteed income, guaranteed by your community.** Neighbors pooling funds so that every member receives a guaranteed monthly income — started in Baltimore, designed to spread, chapter by chapter.

This is the web app for the Community Guaranteed Income Club (CGIC): member onboarding and cards, a contribution and transaction ledger, events and a community board, and a steward (admin) dashboard. It is open source under the MIT license, stewarded and maintained by the [Relational Tech Project](https://www.relationaltechproject.org).

## Credits

Community Guaranteed Income Club concept created by **Alex Zhu**.

Platform co-created by **Alex Zhu, Tyler Heath, Deborah Tien, and Josh Nesbit**.

The code is stewarded and maintained by the [Relational Tech Project](https://www.relationaltechproject.org).

## License

The code is licensed under the [MIT License](LICENSE). The "Community Guaranteed Income Club" name and the crest/wordmark are not covered by the MIT license — please don't use them in ways that suggest your deployment is the Community Guaranteed Income Club or is endorsed by its creators or stewards.

## Tech stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) — Postgres, Auth, and Edge Functions — for the backend
- [Resend](https://resend.com/) for transactional email

## Running locally

```bash
npm install
npm run dev
```

The app reads its Supabase connection from `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). These are the public, RLS-protected anon credentials, safe to ship in the browser. To run your own chapter, point them at your own Supabase project and apply the migrations in `supabase/migrations/`.

The edge functions in `supabase/functions/` expect these secrets to be set in your Supabase project:

- `RESEND_API_KEY` — for sending email via Resend
- `ADMIN_NOTIFY_EMAIL` — where new-signup notifications are routed (your chapter's steward)
- `SEND_EMAIL_HOOK_SECRET` — for branded auth emails (optional)
