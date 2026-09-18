# Arise Admin — Testing Guide

This covers the backend build-out and the frontend wiring done in this pass:
the admin portal previously ran entirely on mock data (every `lib/api/*.ts`
function had a `// TODO: API` comment); it now talks to a real backend
(`Arise-Backend`, built from scratch) for every page. Everything below was
verified end-to-end in a real browser before being written up — not assumed.

## 1. What changed

### New: the backend (`../Arise-Backend`)

A full Node/Express/TypeScript API, built to the exact contracts the frontend
already specified in its `TODO: API` comments — JWT auth (login/refresh/
logout), dashboard analytics, users, and tasks. It runs today against an
in-memory data store (no Supabase project exists yet) and is also
code-complete against a real Supabase/Postgres schema
(`Arise-Backend/supabase/migrations/0001_init.sql`), switchable with one env
var once you have Supabase credentials. Full API reference, setup, and a
42-check automated smoke test: **`Arise-Backend/TESTING.md`**.

### Changed: the frontend (`lib/api/*.ts`, `lib/auth/actions.ts`)

- `lib/api/dashboard.ts`, `lib/api/users.ts`, `lib/api/tasks.ts` — every mock
  function now calls the real backend and unwraps its `{ success, data }`
  envelope, via a new `unwrap()` helper in `lib/api/client.ts`.
- `lib/api/user-actions.ts`, `lib/api/task-actions.ts` — **new files.** The
  Users detail page's Ban/Unban, Adjust XP, and Reset Streak buttons, and the
  Review Queue's Approve/Reject buttons, previously only changed local React
  state (the click "worked" but reloading the page undid it). They now call
  real backend endpoints and persist.
- `lib/api/reward-eligibility.ts` — the task form's live reward-eligibility
  preview was split out of `lib/api/tasks.ts` into its own plain module (see
  §3 for why).
- `lib/auth/actions.ts` — `logoutAction` now revokes the refresh token on the
  backend instead of only clearing local cookies.
- `app/(dashboard)/tasks/_components/task-form.tsx` — fixed a pre-existing
  navigation race (see §3).

### Unchanged by design

Accent color and dark/light theme remain `localStorage`-only, as they already
were — there's no per-admin account concept for UI preferences here, and
nothing about this backend work required adding one.

## 2. Quick start

Two terminals:

```bash
# Terminal 1 — backend
cd Arise-Backend
npm install
cp .env.example .env
npm run dev              # listens on http://localhost:4000

# Terminal 2 — frontend
cd Arise-Admin
npm install
npm run dev              # listens on http://localhost:3000
```

No `.env.local` changes needed in `Arise-Admin` — `config/env.ts` already
defaults `NEXT_PUBLIC_API_URL` to `http://localhost:4000/api/v1`, matching
the backend's default port.

Open `http://localhost:3000/login` and sign in with:

```
email:    admin@arise.com
password: admin123
```

This is a real account seeded in the backend's data store (not the old
dev-mock cookie bypass — that fallback still exists in `lib/auth/actions.ts`
but only kicks in if the backend is genuinely unreachable).

> **Turbopack cache note:** if you get an unexpected 404 on a page that
> definitely exists (this happened once during verification), stop the dev
> server, delete `.next/`, and restart — a stale Turbopack cache was the
> cause, unrelated to any code change here.

## 3. Two real bugs found and fixed while verifying

Worth knowing about, since they explain non-obvious code changes:

1. **`app/(dashboard)/layout.tsx` calls `getUsers()`/`getTasks()` from a
   Client Component** (a `useEffect`, for a sidebar count). Once those
   functions made real authenticated HTTP calls, this broke silently: a
   Client Component importing a plain function bundles that function's code
   into the **browser**, where the login's `access_token` cookie is
   `httpOnly` and unreadable by JavaScript — so the request went out with no
   `Authorization` header and the backend correctly rejected it with 401,
   invisibly (the layout just never got its data). Fixed by marking every
   `lib/api/dashboard.ts` / `lib/api/users.ts` / `lib/api/tasks.ts` export a
   proper Server Function (`'use server'`), so it always runs server-side
   with access to the real httpOnly cookie regardless of which kind of
   component calls it. This is also why `deriveRewardEligibility` (a
   synchronous helper, not a network call) had to move to its own file —
   Next.js requires every export of a `'use server'` file to be an async
   function.
2. **`task-form.tsx`'s submit handler called `router.push(...)` immediately
   followed by `router.refresh()`.** Under the old mock functions (a
   synchronous in-memory array push) the race never mattered; once
   create/update involved a real network round trip, `refresh()` — which
   re-fetches the *current* route — raced with and reliably beat the
   pending navigation to the new route, so clicking "Create Task" silently
   left you on the form even though the task really was created (confirmed
   via backend logs — the detail page was being server-rendered while the
   browser's URL bar never moved). Fixed by dropping the redundant
   `refresh()`; the `push()` already fetches fresh data for the destination
   route.

## 4. Automated verification (already run)

A headless-Chromium script drove the actual running app through the full
login → dashboard → users → tasks → review-queue path, against a freshly
restarted backend and frontend (clean seed data, clean Turbopack cache).
Result: **8/8 checks passed, zero console/page errors.**

| # | Check | Result |
|---|---|---|
| 1 | Login succeeds; Dashboard renders real KPI/chart/table data from the backend | PASS |
| 2 | Users list shows all 26 seeded users (25 regular + the seeded admin) | PASS |
| 3 | Ban/Unban a user, reload the page, change is still there | PASS |
| 4 | Reset a user's streak with no errors | PASS |
| 5 | Tasks list shows all 15 seeded tasks | PASS |
| 6 | Creating a task via the New Task form redirects to its real detail page | PASS |
| 7 | Approving a review-queue item, reload the page, decision is still there | PASS |
| 8 | No browser console or page errors across the entire run | PASS |

Evidence screenshots from that run are in `testing-evidence/` in this repo:
dashboard with live data, the 26-user list, a persisted ban after reload, the
15-task list, and the review queue.

This confirms the wiring works: it does not replace you clicking through it
yourself once, which is what the rest of this document is for.

## 5. Manual test script

Do this once against the two servers from §2, freshly started.

### Auth
1. Go to `/login`. Try a wrong password → inline error, stays on the page.
2. Log in with `admin@arise.com` / `admin123` → redirected to `/` (Dashboard).
3. Reload any page → still logged in (session cookie persists).
4. Click your profile → Logout → redirected to `/login`; trying to visit `/`
   directly now redirects back to `/login` (this is `proxy.ts`'s route guard).

### Dashboard (`/`)
5. All KPI tiles, charts (MRR trend, DAU trend, streak drop-off, rank
   distribution, subscription donut, coupon tier chart), and tables
   (transactions, top referrers, referral activity, coupon activity, needs
   attention) render with data — no "undefined" or blank cards.

### Users (`/users`)
6. Total Users reads **26**. Filter/search the table.
7. Click a user → detail page loads their activity log, badges, rewards,
   feedback tabs.
8. Click **Ban User** → status badge flips to "banned", button now reads
   "Unban User". **Reload the page** — still banned. Click **Unban User** —
   reverts, and survives a reload too.
9. Click **Adjust XP**, enter a delta and a reason, Apply → XP total updates
   and survives a reload.
10. Click **Reset Streak**, confirm → current streak becomes 0 and survives
    a reload.

### Tasks (`/tasks`)
11. Total Tasks reads **15**.
12. Click **New Task**, fill in Title/Description/Tag/Unit/XP Reward, Create
    → redirects to the new task's real detail page (not back to the list or
    stuck on the form).
13. Edit an existing task, change something, Save Changes → redirects to its
    detail page with the change applied.
14. Go to **Tasks → Review Queue** (flagged GPS/photo submissions). Approve
    or Reject one → it moves to "Recently Decided". **Reload the page** —
    still there.

### Unaffected UI (previously shipped, unrelated to this backend work — smoke check only)
15. Accent color picker (profile menu) still switches instantly and persists
    across reload (it's `localStorage`, not backend-backed — by design).
16. Light/dark theme toggle still works.
17. Wide tables (Users, Tasks) still scroll horizontally with a sticky first
    column; KPI card grids don't crush their labels at laptop widths.

## 6. Known limitations

- **Supabase driver is untested live.** No Supabase project exists yet, so
  the backend runs on its in-memory driver (resets on restart — that's why
  "fresh restart" is called out above, not a bug). The Supabase-backed code
  path is written and type-checked but has never talked to a real database.
  Setup steps for when you're ready: `Arise-Backend/TESTING.md` §"Switching
  to real Supabase later".
- **Mobile-app-facing endpoints are out of scope here** (XP engine beyond
  manual admin adjustment, rewards/wallet, leaderboards, notifications, cron
  jobs) — this pass covered exactly the admin-portal surface the frontend
  already specified.
