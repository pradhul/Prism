import { inbox, deleteThread } from './inbox.svelte';
import type { Thread } from '$lib/types';

/**
 * Gmail-style tags (labels) + the rules that apply them automatically.
 *
 * A thread's visible tags = its own manual tags + tags applied by enabled
 * rules. Rule tags are computed live, so toggling a rule updates every pill
 * in the UI instantly.
 */

export interface Tag {
	name: string;
	/** tailwind classes for the pill */
	pill: string;
	/** small dot / accent color */
	dot: string;
}

const PALETTE: Omit<Tag, 'name'>[] = [
	{ pill: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-400' },
	{ pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-400' },
	{ pill: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-400' },
	{ pill: 'bg-pink-50 text-pink-700 ring-pink-200', dot: 'bg-pink-400' },
	{ pill: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-400' },
	{ pill: 'bg-teal-50 text-teal-700 ring-teal-200', dot: 'bg-teal-400' },
	{ pill: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-400' },
	{ pill: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-400' }
];

export const tagStore = $state({
	tags: [
		{ name: 'Work', ...PALETTE[0] },
		{ name: 'Personal', ...PALETTE[4] },
		{ name: 'Finance', ...PALETTE[1] },
		{ name: 'Food', ...PALETTE[2] },
		{ name: 'Shopping', ...PALETTE[3] },
		{ name: 'Travel', ...PALETTE[5] }
	] as Tag[]
});

export function tagMeta(name: string): Tag {
	return (
		tagStore.tags.find((t) => t.name === name) ?? {
			name,
			pill: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
			dot: 'bg-neutral-400'
		}
	);
}

export function createTag(name: string): Tag | undefined {
	const clean = name.trim();
	if (!clean || tagStore.tags.some((t) => t.name.toLowerCase() === clean.toLowerCase())) return undefined;
	const tag = { name: clean, ...PALETTE[tagStore.tags.length % PALETTE.length] };
	tagStore.tags.push(tag);
	return tag;
}

export function deleteTag(name: string) {
	tagStore.tags = tagStore.tags.filter((t) => t.name !== name);
	for (const thread of inbox.threads) {
		if (thread.tags.includes(name)) thread.tags = thread.tags.filter((t) => t !== name);
	}
	// rules that only existed to apply this tag go with it
	ruleStore.rules = ruleStore.rules.filter((r) => r.action.tag !== name);
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

export interface Rule {
	id: string;
	enabled: boolean;
	match: { senderIncludes: string[] };
	action: { tag?: string; markRead?: boolean };
}

let nextRuleId = 100;

export const ruleStore = $state({
	rules: [
		{ id: 'r-food', enabled: true, match: { senderIncludes: ['Swiggy', 'Zomato', 'Uber Eats'] }, action: { tag: 'Food' } },
		{ id: 'r-shopping', enabled: true, match: { senderIncludes: ['Amazon', 'Flipkart', 'Myntra'] }, action: { tag: 'Shopping' } },
		{ id: 'r-finance', enabled: true, match: { senderIncludes: ['Stripe', 'Apple', 'Security Alerts', 'City Power'] }, action: { tag: 'Finance' } },
		{ id: 'r-work', enabled: true, match: { senderIncludes: ['GitHub', 'Jira', 'Slack'] }, action: { tag: 'Work' } },
		{ id: 'r-travel', enabled: true, match: { senderIncludes: ['Airline Alerts'] }, action: { tag: 'Travel' } }
	] as Rule[]
});

/** Built-in AI behaviors, shown alongside rules so the inbox isn't a black box. */
export const builtinRules = [
	{
		title: 'Group mail by intent',
		detail: 'Every mail lands in Needs Action, Orders & Deliveries, Catch Up or Everything Else based on what it asks of you.'
	},
	{
		title: 'Keep action mail pending',
		detail: 'Mail that needs something from you stays in Needs Action for 14 days — even after you read it — until you mark it done.'
	},
	{
		title: 'Sub-group orders by store',
		detail: 'Order and delivery mail is stacked per store (Amazon, Swiggy, Myntra…) so a whole store can be cleared in one tap.'
	},
	{
		title: 'Flag suspicious mail',
		detail: 'Sender-domain mismatches, false urgency and credential requests get a ⚠ Suspicious flag, and their links are withheld.'
	}
];

export function ruleMatches(rule: Rule, thread: Thread): boolean {
	return rule.match.senderIncludes.some(
		(s) =>
			thread.sender.toLowerCase().includes(s.toLowerCase()) ||
			(thread.merchant ?? '').toLowerCase().includes(s.toLowerCase())
	);
}

export function ruleHits(rule: Rule): number {
	return inbox.threads.filter((t) => ruleMatches(rule, t)).length;
}

/** Plain-language sentence describing what a rule does. */
export function ruleSentence(rule: Rule): { when: string; then: string } {
	const senders = rule.match.senderIncludes;
	const list =
		senders.length === 1 ? senders[0] : `${senders.slice(0, -1).join(', ')} or ${senders[senders.length - 1]}`;
	const actions: string[] = [];
	if (rule.action.tag) actions.push(`tag it ${rule.action.tag}`);
	if (rule.action.markRead) actions.push('mark it as read');
	return { when: `When mail arrives from ${list}`, then: actions.join(' and ') };
}

export function toggleRule(id: string) {
	const r = ruleStore.rules.find((r) => r.id === id);
	if (r) r.enabled = !r.enabled;
}

export function deleteRule(id: string) {
	ruleStore.rules = ruleStore.rules.filter((r) => r.id !== id);
}

export function addRule(senders: string | string[], action: { tag?: string; markRead?: boolean }): Rule | undefined {
	const list = (Array.isArray(senders) ? senders : [senders]).map((s) => s.trim()).filter(Boolean);
	if (list.length === 0 || (!action.tag && !action.markRead)) return undefined;
	const rule: Rule = {
		id: `r-${nextRuleId++}`,
		enabled: true,
		match: { senderIncludes: list },
		action
	};
	ruleStore.rules.push(rule);
	// mark-read rules act on existing matches right away
	if (action.markRead) {
		for (const t of inbox.threads) {
			if (ruleMatches(rule, t)) t.unread = false;
		}
	}
	return rule;
}

/* ------------------------------------------------------------------ */
/* AI-assisted rule drafting: turn a loose sentence into a rule.       */
/* ------------------------------------------------------------------ */

export interface RuleDraft {
	senders: string[];
	action: { tag?: string; markRead?: boolean };
	/** the tag doesn't exist yet and will be created on confirm */
	tagIsNew: boolean;
}

/**
 * Parses free text like "tag Netflix mails as Entertainment" or
 * "mark TLDR newsletters as read" into a structured rule proposal.
 * (Stands in for a real LLM call — the interaction is the point.)
 */
export function parseRuleDraft(text: string): RuleDraft | null {
	const raw = text.trim();
	if (!raw) return null;
	const lower = ` ${raw.toLowerCase()} `;

	const markRead = /(mark|set)[^.]{0,24}read|as read|skip (the )?inbox|mute|silence/.test(lower);

	// tag name: prefer "as/into/under/with X", else a tag name mentioned verbatim
	let tagRaw: string | undefined;
	const asMatches = [...lower.matchAll(/\b(?:as|into|under|with)\s+([a-z][a-z0-9&-]{1,18})/g)];
	if (asMatches.length > 0) {
		const candidate = asMatches[asMatches.length - 1][1];
		if (candidate !== 'read') tagRaw = candidate;
	}
	if (!tagRaw) {
		const known = tagStore.tags.find((t) => lower.includes(` ${t.name.toLowerCase()} `));
		if (known) tagRaw = known.name;
	}
	if (!tagRaw && !markRead && /\b(?:tag|label)\s+(?:it|them|these)?\s*([a-z][a-z0-9&-]{1,18})\s*$/.test(lower)) {
		tagRaw = lower.match(/\b(?:tag|label)\s+(?:it|them|these)?\s*([a-z][a-z0-9&-]{1,18})\s*$/)![1];
	}

	const SKIP = new Set([
		'tag', 'label', 'mark', 'mute', 'silence', 'mails', 'mail', 'emails', 'email', 'as', 'read',
		'from', 'the', 'and', 'or', 'it', 'them', 'these', 'into', 'under', 'with', 'then', 'move',
		'put', 'skip', 'inbox', 'newsletter', 'newsletters', 'new', 'a', 'an', 'my', 'to', 'set'
	]);

	const senders: string[] = [];
	const pushSender = (value: string) => {
		const s = value.trim().replace(/[.,!?]+$/, '');
		if (s.length < 2 || SKIP.has(s.toLowerCase())) return;
		if (tagRaw && s.toLowerCase() === tagRaw.toLowerCase()) return;
		if (senders.some((x) => x.toLowerCase() === s.toLowerCase())) return;
		senders.push(s);
	};

	const knownSenders = new Set<string>();
	for (const t of inbox.threads) {
		if (t.merchant) knownSenders.add(t.merchant);
		knownSenders.add(t.sender.split('·')[0].trim());
	}
	for (const s of knownSenders) {
		if (s.length < 3) continue;
		if (lower.includes(s.toLowerCase())) pushSender(s);
	}

	if (senders.length === 0) {
		const fromMatch = raw.match(/from\s+([A-Za-z0-9 .&'-]{2,30})/i);
		if (fromMatch) {
			fromMatch[1]
				.replace(/\b(and|then|tag|label|mark|as|into|under|move|put|read)\b.*$/i, '')
				.split(/\s*(?:,|&|and|or)\s*/i)
				.forEach(pushSender);
		}
	}

	if (senders.length === 0) {
		const afterVerb = raw.match(
			/\b(?:tag|label|mark|mute|silence)\s+(.+?)(?:\s+(?:as|into|under|with|read|mails?|emails?|newsletters?)\b)/i
		);
		if (afterVerb) afterVerb[1].split(/\s*(?:,|&|and|or)\s*/i).forEach(pushSender);
	}

	if (senders.length === 0) {
		const muteOnly = raw.match(/\b(?:mute|silence)\s+([A-Za-z0-9 .&'-]{2,30})$/i);
		if (muteOnly) pushSender(muteOnly[1]);
	}

	if (senders.length === 0) return null;

	if (markRead && !tagRaw) return { senders, action: { markRead: true }, tagIsNew: false };
	if (!tagRaw) return null;

	const existing = tagStore.tags.find((t) => t.name.toLowerCase() === tagRaw!.toLowerCase());
	const tagName = existing ? existing.name : tagRaw.charAt(0).toUpperCase() + tagRaw.slice(1);
	return {
		senders,
		action: { tag: tagName, ...(markRead ? { markRead: true } : {}) },
		tagIsNew: !existing
	};
}

export function confirmRuleDraft(draft: RuleDraft): Rule | undefined {
	if (draft.action.tag && draft.tagIsNew) createTag(draft.action.tag);
	return addRule(draft.senders, draft.action);
}

/** Archive ("delete") every non-archived mail carrying this tag. */
export function deleteTagged(tag: string): number {
	let n = 0;
	for (const t of inbox.threads) {
		if (!t.archived && effectiveTags(t).includes(tag)) {
			deleteThread(t.id);
			n++;
		}
	}
	return n;
}

/* ------------------------------------------------------------------ */
/* Effective tags                                                      */
/* ------------------------------------------------------------------ */

/** Manual tags + tags applied by enabled rules (deduped, manual first). */
export function effectiveTags(thread: Thread): string[] {
	const out = [...thread.tags];
	for (const rule of ruleStore.rules) {
		if (!rule.enabled || !rule.action.tag) continue;
		if (!out.includes(rule.action.tag) && ruleMatches(rule, thread)) out.push(rule.action.tag);
	}
	return out;
}

/** Which rule (if any) applies this tag to this thread — for "via rule" hints. */
export function tagSource(thread: Thread, tag: string): 'manual' | 'rule' | null {
	if (thread.tags.includes(tag)) return 'manual';
	for (const rule of ruleStore.rules) {
		if (rule.enabled && rule.action.tag === tag && ruleMatches(rule, thread)) return 'rule';
	}
	return null;
}

export function tagCount(name: string): number {
	let n = 0;
	for (const t of inbox.threads) {
		if (!t.archived && effectiveTags(t).includes(name)) n++;
	}
	return n;
}

export function toggleThreadTag(threadId: string, tag: string) {
	const t = inbox.threads.find((t) => t.id === threadId);
	if (!t) return;
	if (t.tags.includes(tag)) t.tags = t.tags.filter((x) => x !== tag);
	else t.tags = [...t.tags, tag];
}
