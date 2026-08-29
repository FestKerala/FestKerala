# Fest Kerala 🎉

**Pinterest for college fests.** A free, ad-free, community-driven directory of college festivals across all 14 districts of Kerala — cultural, technical, arts, music, dance, and business events, all in one place.

Live at: [fest-kerala.vercel.app](https://fest-kerala.vercel.app)

---

## What it is

Colleges and organizers submit their fest — poster, dates, registration link, category tags — through a public form. Every submission goes into a moderation queue and only appears on the site once an admin approves it. No logins required to browse or submit; no ads, ever.

## Features

- **Masonry discovery grid** — responsive 1/2/3-column layout, balanced shortest-column-first placement
- **Detail pages** — two-column layout per fest (`/fest/:id`) with poster, dates, district, description, and registration/share actions
- **Search & filters** — by district, category tag, and free-text search across fest name, college, district, and tags
- **Spam-protected public submissions** — Cloudflare Turnstile CAPTCHA + server-side validation via a Supabase Edge Function, so nothing hits the database directly from the browser
- **Admin moderation panel** — pending/live tabs, inline editing, single and bulk approve/reject/unlist
- **Status lookup** — organizers get a private link (`/status/:id`) to check their submission's review status without an account
- **Self-serve UPI support** — a lightweight "Support us" flow (QR + deep link) in place of a card-based donation platform

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Backend | Supabase (Postgres, Edge Functions / Deno, Row-Level Security, Storage) |
| Spam protection | Cloudflare Turnstile |
| Hosting | Vercel |

## Project structure

```
src/
├── App.tsx                 # Home page: header, filters, masonry grid, post form, support section
├── FestDetail.tsx          # Per-fest detail page (/fest/:id)
├── types.ts                # Fest type, district/category constants, tag styling
├── main.tsx                # Router setup
├── index.css               # Global styles, Tailwind theme, Kerala-motif background
├── pages/
│   ├── Admin.tsx            # Auth gate → login or dashboard
│   ├── AdminLogin.tsx        # Admin sign-in form
│   ├── AdminDashboard.tsx    # Moderation queue: pending/live tabs, inline edit, bulk actions
│   └── StatusLookup.tsx      # Public status page for organizers
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── useAuth.ts           # Admin session hook
supabase/
└── functions/
    └── submit-fest/
        └── index.ts          # Edge Function: verifies Turnstile token, validates, inserts as 'pending'
```

## Architecture notes

**Public submissions never touch the database directly.** The browser uploads the poster to Supabase Storage, then POSTs form data + a Turnstile token to the `submit-fest` Edge Function, which verifies the CAPTCHA server-side, re-validates every field, and inserts using the service role key — status is always forced to `pending` regardless of what the client sends.

**Admin actions run from the browser** against Supabase directly, gated by RLS + an authenticated admin session (public sign-up is disabled, so only real admin accounts ever reach the authenticated role).

**Reject and unlist are hard deletes**, not status changes — a Postgres `CHECK` constraint on `fests.status` only allows `'pending'`/`'approved'`, so anything else fails silently on `.update()`. Deletes are audited via a `fest_removals` log table, written *before* the delete so a mid-request failure can't lose the record.

## Local development

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Required environment variables (from your Supabase project → Settings → API):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge Function secrets (set via `supabase secrets set`, never committed):
- `TURNSTILE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deploying an Edge Function change

```bash
supabase functions deploy submit-fest
```
Edge Functions don't hot-reload from a normal push — any change to `supabase/functions/submit-fest/index.ts` needs an explicit redeploy.

## Contributing workflow

1. Branch off `main` (no direct pushes)
2. Push your branch, open a PR
3. **Check the Vercel preview URL Vercel auto-comments on the PR before merging** — this catches issues that a local dev server won't
4. Merge via GitHub, then `git checkout main && git pull`

## Roadmap (V2)

- Magic edit/status links via a `manage_token` UUID (possession-as-credential, no second auth system)
- Resubmission flow for rejected/expired fests
- District digest or demand-side recommendations
- Basic organizer analytics through the magic link
- Deadline-aware urgency badges
- Duplicate/spam flagging in the moderation queue
- Improved empty-state design (currently the highest-priority UX gap)

## Known limitations

- The UPI support flow is trust-based, not verified — there's no payment gateway confirming a donation actually succeeded
- No `manage_token` yet, so organizers can't self-edit a submission after it's sent
- Storage bucket relies on client-side file-size/MIME validation rather than a Storage-level RLS policy (Supabase Storage doesn't populate metadata at INSERT time, so metadata-based RLS isn't reliable here)

## License / credits

Built as a free, independent, ad-free directory for Kerala's college fest scene. Support: `helpfestkerala@gmail.com`
