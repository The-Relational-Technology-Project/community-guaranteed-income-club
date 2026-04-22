
## Demo the payment UX by generating a fresh monthly assignment

Because this mode is read-only, the next step is to switch to implementation mode and perform the demo run in the app. The current code already supports the full flow once a run is created.

### What I will do
1. Log in as an admin/steward account.
2. Open **Admin → Math**.
3. Click **Run Now** / **Confirm & Run** to generate this month’s `calculation_runs` entry and `transactions`.
4. Log in as a member demo account (Maya or another sender) and open:
   - **/home** to see the new “Your connection this month” card
   - **/transactions** to see the full send/receive card UI
5. Verify the payment journey end-to-end:
   - recipient photo/name appears
   - amount appears
   - favorite third space appears if present
   - Venmo button opens the connection prompt dialog
   - “I’ve sent this” / confirmation control works
   - in-person handoff toggle works

### What the current UX should show
Based on the existing code:
- **Admin trigger location:** `src/components/admin/AdminMathView.tsx`
  - primary CTA: **Run Now** / **Run Again**
  - confirmation modal: **Confirm & Run**
- **Member payment experience:** `src/pages/MemberHome.tsx`
  - monthly assignment card
  - optional Venmo link with human note
  - sender confirmation button
- **Detailed transaction experience:** `src/pages/Transactions.tsx`
  - all transactions list
  - Venmo prompt dialog
  - in-person meetup opt-in
  - confirmation checkbox

### Likely outcomes
- If there are already active participants with income data, the run should immediately create demo transactions.
- If the selected member is a **receiver** this month, they will not see a Venmo send CTA on Home; in that case I’ll switch to a member who is a **sender** so you can see the payment UX specifically.
- If a run already exists for this month, the admin view warns that running again creates duplicates, so I’ll first verify whether using the newest run is enough for the demo or whether a clean demo path is needed.

### If anything blocks the demo
I’ll check these in order:
1. Member statuses are `active`
2. At least 2 active members exist
3. Income values are present
4. Transactions were inserted for the latest run
5. The chosen demo member is a sender, not only a receiver

### Optional cleanup after the demo
If you want a cleaner steward handoff, after validating the UX I can make a follow-up improvement pass to:
- add a dedicated **“Preview payment experience as sender”** admin shortcut
- prevent accidental duplicate monthly runs
- surface the newest assignment more clearly on the member home page

### Files already supporting this flow
- `src/components/admin/AdminMathView.tsx`
- `src/pages/MemberHome.tsx`
- `src/pages/Transactions.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/contexts/AuthContext.tsx`

### Deliverable after approval
I’ll run the demo calculation, verify the sender-side payment UI, and report back exactly what the member sees step by step.
