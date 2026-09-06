import { inbox } from './inbox.svelte';
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
		{ id: 'r-finance', enabled: true, match: { senderIncludes: ['Stripe', 'Apple', 'First National Bank', 'City Power'] }, action: { tag: 'Finance' } },
		{ id: 'r-work', enabled: true, match: { senderIncludes: ['GitHub', 'Jira', 'Slack'] }, action: { tag: 'Work' } },
		{ id: 'r-travel', enabled: true, match: { senderIncludes: ['Skyline Airways'] }, action: { tag: 'Travel' } }
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

export function addRule(senderContains: string, action: { tag?: string; markRead?: boolean }): Rule | undefined {
	const clean = senderContains.trim();
	if (!clean || (!action.tag && !action.markRead)) return undefined;
	const rule: Rule = {
		id: `r-${nextRuleId++}`,
		enabled: true,
		match: { senderIncludes: [clean] },
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
