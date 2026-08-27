# Prism — Inbox, reimagined

Prism is a mobile-first web app that rethinks what an email inbox can look like. Instead of one
more folder-and-list client, it explores **three distinct, AI-native inbox experiences** and lets
you switch between them freely:

1. **The Contextual Stream** (`/stream`) — Timeline & Bubbles. Mail is grouped by intent
   (Action Required, Reading, Receipts) on a vertical timeline. Each conversation is a
   glassmorphic, expandable "bubble" with an AI-generated gist, so you can get the point without
   opening a single email.
2. **The Priority Grid** (`/grid`) — Card-based navigation. A bento-style dashboard: one bold
   hero card for whatever AI thinks matters most, and a grid of smaller monochrome tiles for
   everything else. Feels like a personalized news feed.
3. **The Focused Arc** (`/arc`) — Gestural & minimalist. An editorial, serif-heavy "brief" you
   read one story at a time, with a bottom-anchored pill dock ("the Arc") for swiping between
   Work / Personal / Urgent / Updates, plus horizontal swipe gestures on the reading canvas.

The flow is: **splash screen → simple start page → pick a concept → inbox.** Every inbox screen
has a small switcher so you can jump between all three concepts (or back to the start) at any
time — handy for comparing them side by side.

This is a first-draft prototype: all inbox content is mocked (`src/lib/data/emails.ts`), light
mode only, and built for phone-sized viewports first (tablet/desktop and native iOS/Android are
future work).

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
  lib/
    components/
      shared/              # Avatar, ConceptSwitcher, PrismMark (logo)
      stream/ grid/ arc/    # concept-specific building blocks
    data/
      emails.ts            # mock inbox data shared by all three concepts
      categories.ts intents.ts concepts.ts
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
