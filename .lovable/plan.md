# Rebrand: Community Guaranteed Income Club

Rename the app from "The Baltimore Mutualist Club" to **Community Guaranteed Income Club** (CGIC), positioned as starting in Baltimore but designed to spread. Return to the previously approved Mamdani/Oatly-inspired vibrant aesthetic (per `mem://style/branding-aesthetic`), still distinctly non-SaaSy.

## Naming & voice

- **Full name**: Community Guaranteed Income Club
- **Short name**: CGIC (used sparingly, e.g. referral codes)
- **Current chapter**: "Baltimore chapter" — referenced in copy but no longer the brand. Future-proof for multi-tenant chapters (Baltimore is the first).
- **Tagline options** (we'll pick one): "A guaranteed income, guaranteed by your community." / "Neighbors funding neighbors, every month."
- **Domain**: communityguaranteedincome.club (update meta tags / OG)

## Visual identity (return to Mamdani/Oatly vibe)

- **Palette** (HSL tokens in `src/index.css`):
  - Primary: Electric Blue `220 90% 56%`
  - Accent: Warm Orange `18 88% 58%`
  - Pop: Bright Yellow `48 96% 60%`
  - Fresh: Deep Green `155 50% 38%`
  - Background: Off-white cream `42 60% 96%`
  - Foreground: Near-black ink `220 20% 12%`
  - Card: White `0 0% 100%`
- **Typography**: Space Grotesk (display/headings, replaces Lora) + DM Sans (body, replaces Inter). Update Google Fonts import + `tailwind.config.ts` font families.
- **Shapes & motion**: Bold color blocks, overlapping circles (community), organic SVG wave dividers between sections (replaces current dot pattern hero), gentle hover-pop. Keep generous border radius.
- **Logo / crest**: Existing `crest.png` was made for the Mutualist Club. Replace the wordmark in headers with a typographic CGIC mark — bold Space Grotesk lockup with a small circle motif (3 overlapping circles in blue/orange/yellow representing the pooled flow). Build as inline SVG component (`src/components/Wordmark.tsx`) so it scales and recolors cleanly. Keep `crest.png` available but de-emphasize until a new mark is commissioned.

## Pages & components to update

1. **`index.html`** — title, description, OG tags → "Community Guaranteed Income Club".
2. **`src/index.css`** — swap palette tokens, swap font import to Space Grotesk + DM Sans, keep utility classes (`pattern-dots`, `card-gradient`) but retune colors. Add an `svg-wave` divider utility.
3. **`tailwind.config.ts`** — update `fontFamily.serif/display` → Space Grotesk; `body/sans` → DM Sans.
4. **`src/components/Wordmark.tsx`** (new) — typographic logo + small circles SVG mark, replaces crest+text in `Layout.tsx` and `MemberLayout.tsx`.
5. **`src/components/Layout.tsx`** — replace name string, swap crest for Wordmark, footer tagline ("All flourishing is mutual." → keep, it still fits), nav buttons unchanged.
6. **`src/components/MemberLayout.tsx`** — same wordmark swap.
7. **`src/pages/Landing.tsx`** — full visual refresh:
   - Hero: bold headline in Space Grotesk, blue background block with yellow/orange accent shapes, "Baltimore chapter — first of many" eyebrow.
   - Stats strip: keep, restyle in primary blue with yellow numerals.
   - Story section: keep Kimmerer quote.
   - How it works cards: bold colored cards (blue/orange/yellow backgrounds rotating).
   - Calculator: cleaner, more colorful result reveal.
   - Replace `pattern-dots` hero bg with an SVG wave divider between sections.
   - CTA section: orange or yellow block instead of current primary.
8. **`src/pages/About.tsx`** — rename, reframe story as "Started in Baltimore, designed to spread." Add a short "What's a chapter?" paragraph.
9. **`src/pages/MemberCard.tsx`** — update card design: "Community Guaranteed Income Club" header, "Baltimore Chapter" subline, referral code prefix changes from `BMC-` → `CGIC-`. Keep wallet placeholders.
10. **`src/pages/MemberHome.tsx`, `Profile.tsx`, `Transactions.tsx`** — replace any "Baltimore Mutualist Club" / "BMC" strings; update tone strings if any reference the old name.
11. **`src/components/admin/AdminMembersTab.tsx`** — string updates only.
12. **`src/pages/Demo.tsx`** — keep as-is functionally; update brand strings.

## Multi-tenant readiness (light touch, no schema changes yet)

- Centralize chapter config in `src/lib/chapter.ts`:
  ```ts
  export const CHAPTER = { name: "Baltimore", slug: "baltimore", city: "Baltimore, MD" };
  export const ORG = { name: "Community Guaranteed Income Club", short: "CGIC", domain: "communityguaranteedincome.club" };
  ```
  Use these constants in Layout, Landing, About, MemberCard. When we go multi-tenant, this becomes a hook backed by the DB.
- No DB migration this round. Schema-level chapter scoping is a future pass.

## Out of scope this pass

- New crest illustration (placeholder typographic mark for now; can commission art later).
- Custom domain DNS setup (separate flow when ready).
- Multi-tenant DB schema (tracked for later).
- Any auth, transactions, or admin logic changes.

## Files to create / edit

**Create**: `src/components/Wordmark.tsx`, `src/lib/chapter.ts`
**Edit**: `index.html`, `src/index.css`, `tailwind.config.ts`, `src/components/Layout.tsx`, `src/components/MemberLayout.tsx`, `src/pages/Landing.tsx`, `src/pages/About.tsx`, `src/pages/MemberCard.tsx`, `src/pages/MemberHome.tsx`, `src/pages/Profile.tsx`, `src/pages/Transactions.tsx`, `src/components/admin/AdminMembersTab.tsx`, `src/pages/Demo.tsx`

After approval I'll also update the project memory (`mem://index.md`, `mem://style/branding-aesthetic`) to reflect the new name and reaffirm the Mamdani palette/fonts.
