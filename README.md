# Prism — Inbox, reimagined

Prism is a mobile-first web app that rethinks what an email inbox can look like. The current
iteration focuses on one experience, **the Contextual Stream** (`/stream`): mail grouped by what
it needs from you, each group with its own interaction — **Needs Action** (read or unread, still
pending — mark ✓ done to dismiss), **Orders & Deliveries** (sub-grouped by store with one-tap
"Clear all" per merchant), **Catch Up** (newsletters & FYI with read-time estimates and
"mark all read"), and **Everything Else**. Read mail stays visible, greyed out.

The flow is: **splash screen → simple start page → the Stream.** (Two earlier alternative
concepts — a card grid and a gestural reader — were removed from the app for now to keep it
focused; they live in git history.)

**Tags & rules** (`/manage`): Gmail-style tags show as small pills next to the New/Read state on
every mail. Tags can be created inline, pinned to any mail from its detail view ("+ Tag"), and
managed centrally. Rules are shown in plain language ("When mail arrives from Swiggy, Zomato or
Uber Eats → tag it Food"), each with a live match count, an on/off toggle (pills update
everywhere instantly), delete, and a small two-field builder for new rules. Built-in AI behaviors
(intent grouping, per-store order stacks, 14-day action pinning, phishing flags) are listed on
the same screen so the inbox is never a black box.

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
    stream/                # Contextual Stream: list + /stream/[id] thread view
    search/                # AI search over the whole mailbox
    manage/                # Tags & Rules management
  lib/
    components/
      shared/              # Avatar, PrismMark (logo)
      stream/               # Stream building blocks
    data/
      emails.ts            # hand-authored demo conversations
      bulk.ts              # deterministic ~1,400-mail long tail
      senderIcons.ts       # brand marks for known senders
      categories.ts groups.ts
    state/
      inbox.svelte.ts      # reactive inbox: read/done/archive state + AI search scoring
      organize.svelte.ts   # tags + rules: create/delete, toggle, effective-tag computation
    types.ts
```

## Notes / assumptions for this first iteration

- Light mode only, as requested. Dark mode, real auth, and a real mail backend are intentionally
  out of scope for now.
- "AI" summaries, gists, and smart-reply suggestions are pre-written mock content standing in for
  what a real summarization pipeline would produce.
- Compose, search, and account settings are not wired up yet (compose is a visual affordance only
  on the Arc list screen).
- `@sveltejs/adapter-auto` is used so the app can be deployed to most common targets without
  extra config; swap it for a specific adapter once a hosting target is chosen.
