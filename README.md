# Prism — Inbox, reimagined

Prism is a mobile-first web app that rethinks what an email inbox can look like. Instead of one
more folder-and-list client, it explores **three distinct, AI-native inbox experiences** and lets
you switch between them freely:

1. **The Contextual Stream** (`/stream`) — Timeline & Bubbles. Mail is grouped by what it needs
   from you, and every group has its own interaction: **Needs Action** (read or unread, still
   pending — mark ✓ done to dismiss), **Orders & Deliveries** (sub-grouped by store with one-tap
   "Clear all" per merchant), **Catch Up** (newsletters & FYI with read-time estimates and
   "mark all read"), and **Everything Else**. Read mail stays visible, greyed out.
2. **The Priority Grid** (`/grid`) — Card-based navigation. A bento-style dashboard: one bold
   hero card for whatever AI thinks matters most, and a grid of smaller monochrome tiles for
   everything else. Feels like a personalized news feed.
3. **The Focused Arc** (`/arc`) — Gestural & minimalist. An editorial, serif-heavy "brief" you
   read one story at a time, with a bottom-anchored pill dock ("the Arc") for swiping between
   Work / Personal / Urgent / Updates, plus horizontal swipe gestures on the reading canvas.

The flow is: **splash screen → simple start page → pick a concept → inbox.** Every inbox screen
has a small switcher so you can jump between all three concepts (or back to the start) at any
time — handy for comparing them side by side.

Every view also links to **AI search** (`/search`): describe a mail loosely ("the pdf marcus
sent about the timeline", "amazon refund last month") and Prism scores the whole mailbox against
it, defaulting to the past month, and explains how it interpreted your query and why each result
matched.

To feel honest at real-inbox scale, the prototype simulates a mailbox of **~1,400 mails
(~200 unread)**: hand-authored conversations (`src/lib/data/emails.ts`) plus a deterministic
generated long tail (`src/lib/data/bulk.ts`). Read/unread, mark-done, and clear-merchant state is
held in a reactive store (`src/lib/state/inbox.svelte.ts`).

Known senders show a **brand mark** on their mail cards (Amazon, Myntra, Swiggy, Flipkart,
GitHub, Slack, Stripe, Google Drive…) — standing in for the logo a real client would pull from
the mail itself — so mail is recognizable at a glance; humans keep initials avatars
(`src/lib/data/senderIcons.ts`).

AI summaries are **specific, not generic**: an order mail tells you what was ordered, for how
much, to which address, and when it arrives. When a mail contains an external link, it surfaces
as a **button on the summary card** (Track package, Pay $84.20, Open Figma file…). And Prism
flags **suspicious mail**: two authored phishing examples (a fake customs-fee demand and a fake
bank-verification threat) are marked ⚠ Suspicious in every view, with the reasons spelled out
and the dangerous link withheld instead of rendered as a button.

This is an early prototype: light mode only, built for phone-sized viewports first
(tablet/desktop and native iOS/Android are future work).

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) + Svelte 5 (runes)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript
- No backend — everything is static mock data for this iteration

## Getting started

```bash
pnpm install
pnpm run dev
```

Open the printed local URL in your browser and use a mobile device-width viewport (or your
browser's device toolbar) — the UI is designed at ~375–430px wide first.

Other scripts:

```bash
pnpm run build   # production build
pnpm run preview # preview the production build
pnpm run check   # type-check + svelte-check
pnpm run gen:icons # regenerate static/ favicon set from src/lib/assets/favicon.svg
```

## Project structure

```
src/
  routes/
    +page.svelte          # splash screen
    start/                 # simple start page
    choose/                # pick one of the 3 concepts
    stream/                # Contextual Stream: list + /stream/[id] thread view
    grid/                  # Priority Grid: dashboard + /grid/[id] detail view
    arc/                   # Focused Arc: "The Prism Brief" list + /arc/[id] focused reader
    search/                # AI search over the whole mailbox
  lib/
    components/
      shared/              # Avatar, ConceptSwitcher, PrismMark (logo)
      stream/ grid/ arc/    # concept-specific building blocks
    data/
      emails.ts            # hand-authored demo conversations
      bulk.ts              # deterministic ~1,400-mail long tail
      categories.ts groups.ts concepts.ts
    state/
      inbox.svelte.ts      # reactive inbox: read/done/archive state + AI search scoring
    types.ts
```

All three concepts read from the **same mock dataset** — the differentiator is purely the UI/UX,
per the brief that "the UI is the main issue."

## Notes / assumptions for this first iteration

- Light mode only, as requested. Dark mode, real auth, and a real mail backend are intentionally
  out of scope for now.
- "AI" summaries, gists, and smart-reply suggestions are pre-written mock content standing in for
  what a real summarization pipeline would produce.
- Compose, search, and account settings are not wired up yet (compose is a visual affordance only
  on the Arc list screen).
- `@sveltejs/adapter-auto` is used so the app can be deployed to most common targets without
  extra config; swap it for a specific adapter once a hosting target is chosen.
