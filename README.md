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

```

## Architecture notes

**Public submissions never touch the database directly.** The browser uploads the poster to Supabase Storage, then POSTs form data + a Turnstile token to the `submit-fest` Edge Function, which verifies the CAPTCHA server-side, re-validates every field, and inserts using the service role key — status is always forced to `pending` regardless of what the client sends.

**Admin actions run from the browser** against Supabase directly, gated by RLS + an authenticated admin session (public sign-up is disabled, so only real admin accounts ever reach the authenticated role).

**Reject and unlist are hard deletes**, not status changes — a Postgres `CHECK` constraint on `fests.status` only allows `'pending'`/`'approved'`, so anything else fails silently on `.update()`. Deletes are audited via a `fest_removals` log table, written *before* the delete so a mid-request failure can't lose the record.


## License / credits

Built as a free, independent, ad-free directory for Kerala's college fest scene. Support: `helpfestkerala@gmail.com`
