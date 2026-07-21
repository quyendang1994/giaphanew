# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Gia Phả OS is a self-hosted Vietnamese family-tree (gia phả) manager. Each deployment stores all data in the owner's own Supabase project — there is no central backend the maintainer controls. The UI is entirely in Vietnamese; keep user-facing strings and code comments in Vietnamese to match the existing codebase.

## Commands

The README documents `bun`, but the repo has `package-lock.json` (npm). Either works; scripts are identical.

- `npm run dev` — start dev server at http://localhost:3000
- `npm run build` — production build (set `BUILD_STANDALONE=1` for a standalone/Docker output; default is Vercel)
- `npm run lint` — ESLint (`eslint-config-next`)
- `npx tsc --noEmit` — typecheck; **this is the primary correctness gate — there is no test suite**. Run it after nontrivial changes.

## Required environment (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — core; without them the app redirects everything to `/missing-db-config`.
- `SITE_NAME`, `EXAMPLE_EMAIL`, `EXAMPLE_PASSWORD`, `DEMO_DOMAIN` — optional, read in [app/config.ts](app/config.ts). When the host matches `DEMO_DOMAIN`, the login page prefills demo credentials and disables signup.
- Push notifications (optional): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.

`NEXT_PUBLIC_*` vars are inlined at build time — on Vercel they must exist **before** the build, and changing them requires a redeploy.

## Database

The complete schema lives in [docs/schema.sql](docs/schema.sql) and must be run manually in the Supabase SQL Editor — it is idempotent (guarded with `IF NOT EXISTS` / `DROP POLICY IF EXISTS`, no `DROP TABLE`). **Any schema change belongs in this file**, since it is the only source of truth users re-run to set up or migrate a deployment.

Core tables: `profiles` (role + activation, 1:1 with `auth.users`), `persons` (the family-tree entity), `person_details_private` (admin-only sensitive fields), `relationships`, `custom_events`, `gallery_items`, `push_subscriptions`.

Security model is **enforced in the database via RLS, not in the app**:
- `public.is_admin()` / `public.is_editor()` SECURITY DEFINER functions back every write policy. All authenticated users can read `persons`/`relationships`; only admins/editors can write.
- `person_details_private` (phone, occupation, residence) is **admin-read-only** by policy — members and editors never receive these fields, which is why they're optional on the `Person` type.
- The `handle_new_user` trigger auto-creates a `profiles` row on signup: **the first user ever becomes an active admin; everyone else is an inactive member** awaiting approval. `handle_first_user_confirmation` auto-confirms that first user's email.

Because RLS is the real gate, server-side role checks in actions are defense-in-depth / better error messages, not the primary control.

## Architecture

**Next.js 16 App Router, React 19, Tailwind v4** (config is CSS-first in [app/globals.css](app/globals.css) via `@theme` — there is no `tailwind.config.js`; design tokens like `--color-tertiary`, `.btn-*`, `.card-feature`, `.bg-antique` are defined there).

### Three ways data is accessed — know which layer you're in

1. **Server Components** read via [utils/supabase/queries.ts](utils/supabase/queries.ts). `getSupabase`, `getUser`, `getProfile`, `getIsAdmin` are wrapped in React `cache()` so a single request reuses one client and one auth lookup. Prefer these over ad-hoc clients in server code.
2. **Server Actions** (`"use server"`, in [app/actions/](app/actions/)) handle mutations (member CRUD, import/export, user admin). They re-check role, then `revalidatePath`. Note the UUID-validation guard in [app/actions/member.ts](app/actions/member.ts) before interpolating IDs into PostgREST `.or()` filters — replicate this pattern for any `.or()` filter built from user input.
3. **Client Components** use [utils/supabase/client.ts](utils/supabase/client.ts) (`createBrowserClient`). Both client and server factories return a **dummy no-op client when env vars are missing** so rendering never crashes pre-config — mutations against it fail with "Missing Supabase configuration".

A fourth, privileged path: [utils/supabase/admin.ts](utils/supabase/admin.ts) creates a **service-role client that bypasses RLS**. It is server-only and used exclusively by the cron route (no user session). Never import it into anything reaching the client.

### Auth & session flow

Login/signup and Facebook OAuth happen **browser → Supabase directly** ([app/login/page.tsx](app/login/page.tsx)); OAuth returns to [app/auth/callback/route.ts](app/auth/callback/route.ts) which exchanges the code for a session cookie. [proxy.ts](proxy.ts) (Next.js middleware) runs [utils/supabase/middleware.ts](utils/supabase/middleware.ts) on every request to refresh the session, gate `/dashboard/*`, redirect logged-in users away from `/login`, and detect an uninitialized DB (routing to `/setup`). [app/dashboard/layout.tsx](app/dashboard/layout.tsx) additionally blocks members whose `is_active` is false with a "waiting for approval" screen, and wraps children in `UserProvider`.

### Family-tree domain logic (the heart of the app, all client-side helpers in `utils/`)

- **Relationships are edges, not tree pointers.** `persons` + `relationships` form a graph; [utils/treeHelpers.ts](utils/treeHelpers.ts) `buildAdjacencyLists` converts the flat `relationships` array into spouse/children maps once, then the tree/mindmap views ([components/FamilyTree.tsx](components/FamilyTree.tsx), [components/MindmapTree.tsx](components/MindmapTree.tsx), D3-based) render from those. Marriage edges are bidirectional; child edges point parent→child.
- **`generation` and `birth_order` are computed, then persisted.** [components/LineageManager.tsx](components/LineageManager.tsx) (admin "Thứ tự gia phả") traverses the graph to assign generation depth and sibling order, and writes them back to `persons`. Kinship and tree layout depend on these being correct.
- **Kinship terminology** ([utils/kinshipHelpers.ts](utils/kinshipHelpers.ts)) is the signature feature: given two people it computes the correct Vietnamese address terms (Bác/Chú/Cô/Dì/…) in both directions, using generation distance plus `birth_order`/`birth_year` seniority. This is genuinely complex Vietnamese-specific logic — read it fully before touching.
- **Dates are stored as separate year/month/day integers** (partial dates allowed) and support both solar and lunar death dates. Lunar conversion uses `lunar-javascript`; see [utils/dateHelpers.ts](utils/dateHelpers.ts) and [utils/eventHelpers.ts](utils/eventHelpers.ts).
- **Import/export** ([app/actions/data.ts](app/actions/data.ts), [utils/gedcom.ts](utils/gedcom.ts), [utils/csv.ts](utils/csv.ts)) supports JSON backup, CSV, and GEDCOM. DB-managed fields are stripped on import.

### Push notifications

PWA is enabled ([app/manifest.ts](app/manifest.ts)) with service worker [public/sw.js](public/sw.js). Members opt in via [components/PushNotificationToggle.tsx](components/PushNotificationToggle.tsx) on the events page, storing a subscription per device. Two triggers send Web Push (VAPID, via [utils/push/server.ts](utils/push/server.ts)): [app/api/push/notify-event/route.ts](app/api/push/notify-event/route.ts) fires when a custom event is created (excluding the creator), and [app/api/push/cron/route.ts](app/api/push/cron/route.ts) runs from Vercel Cron ([vercel.json](vercel.json)) twice daily — 7am VN reminds today+tomorrow events, 6pm VN reminds only tomorrow's. The cron authenticates via `CRON_SECRET` and computes dates in `Asia/Ho_Chi_Minh`; test it manually with `?slot=morning|evening`. iOS only receives push when the app is added to the home screen (iOS 16.4+).
