import { curatedThreads } from '$lib/data/emails';
import { bulkThreads } from '$lib/data/bulk';
import type { Thread, Group } from '$lib/types';

/**
 * Client-side reactive inbox. In a real product this would be backed by a mail
 * API; here it lets the prototype demonstrate group-specific interactions:
 * mark done, clear a merchant, mark a group read, mark read on open.
 */
export const inbox = $state({
	threads: [...curatedThreads, ...bulkThreads] as Thread[]
});

export function getThread(id: string): Thread | undefined {
	return inbox.threads.find((t) => t.id === id);
}

export function markRead(id: string) {
	const t = getThread(id);
	if (t) t.unread = false;
}

export function markDone(id: string, done = true) {
	const t = getThread(id);
	if (t) {
		t.done = done;
		if (done) t.unread = false;
	}
}

export function clearMerchant(merchant: string) {
	for (const t of inbox.threads) {
		if (t.group === 'orders' && t.merchant === merchant && !t.archived) {
			t.archived = true;
			t.unread = false;
		}
	}
}

export function markGroupRead(group: Group) {
	for (const t of inbox.threads) {
		if (t.group === group) t.unread = false;
	}
}

/* ------------------------------------------------------------------ */
/* Mock "AI" search: loose-context scoring over the whole mailbox.     */
/* ------------------------------------------------------------------ */

export interface SearchHit {
	thread: Thread;
	score: number;
	reasons: string[];
}

export interface SearchInterpretation {
	people: string[];
	stores: string[];
	keywords: string[];
	wantsAttachment: boolean;
	wantsUnread: boolean;
}

const STOPWORDS = new Set([
	'the', 'a', 'an', 'of', 'to', 'for', 'and', 'or', 'in', 'on', 'at', 'is', 'was', 'that',
	'this', 'me', 'my', 'i', 'about', 'with', 'from', 'sent', 'mail', 'email', 'emails',
	'find', 'show', 'get', 'one', 'some', 'any', 'it', 'had', 'has', 'have', 'there', 'their'
]);

const ATTACHMENT_WORDS = new Set(['pdf', 'attachment', 'attached', 'file', 'deck', 'slides', 'invoice', 'document', 'doc', 'zip']);
const UNREAD_WORDS = new Set(['unread', 'new']);

export function searchMail(query: string, scopeDays: number): { hits: SearchHit[]; interpretation: SearchInterpretation } {
	const tokens = query
		.toLowerCase()
		.split(/[^a-z0-9₹$#]+/)
		.filter((w) => w.length > 1 && !STOPWORDS.has(w));

	const wantsAttachment = tokens.some((t) => ATTACHMENT_WORDS.has(t));
	const wantsUnread = tokens.some((t) => UNREAD_WORDS.has(t));
	const contentTokens = tokens.filter((t) => !ATTACHMENT_WORDS.has(t) && !UNREAD_WORDS.has(t));

	const people = new Set<string>();
	const stores = new Set<string>();
	const hits: SearchHit[] = [];

	for (const thread of inbox.threads) {
		if (thread.daysAgo > scopeDays) continue;
		if (wantsUnread && !thread.unread) continue;

		let score = 0;
		const reasons: string[] = [];
		const sender = thread.sender.toLowerCase();
		const merchant = thread.merchant?.toLowerCase() ?? '';
		const subject = thread.subject.toLowerCase();
		const gist = (thread.gist + ' ' + thread.summary.join(' ')).toLowerCase();
		const body = thread.messages.map((m) => m.body.join(' ')).join(' ').toLowerCase();

		for (const token of contentTokens) {
			if (sender.includes(token)) {
				score += 3;
				people.add(thread.sender);
				if (!reasons.includes(`from ${thread.sender}`)) reasons.push(`from ${thread.sender}`);
			}
			if (merchant && merchant.includes(token)) {
				score += 2.5;
				stores.add(thread.merchant!);
				if (!reasons.includes(thread.merchant!)) reasons.push(thread.merchant!);
			}
			if (subject.includes(token)) {
				score += 2;
				if (!reasons.includes(`“${token}” in subject`)) reasons.push(`“${token}” in subject`);
			} else if (gist.includes(token)) {
				score += 1.5;
				if (!reasons.includes(`“${token}” in AI summary`)) reasons.push(`“${token}” in AI summary`);
			} else if (body.includes(token)) {
				score += 1;
				if (!reasons.includes(`“${token}” in message`)) reasons.push(`“${token}” in message`);
			}
		}

		if (wantsAttachment) {
			const att = thread.messages.find((m) => m.attachment);
			if (att) {
				score += 2;
				reasons.push(`has ${att.attachment!.name}`);
			} else if (contentTokens.length > 0 && score === 0) {
				continue;
			} else if (score > 0) {
				score -= 1.5;
			}
		}

		if (score > 0) {
			if (thread.risk) reasons.unshift('⚠ flagged suspicious');
			hits.push({ thread, score, reasons: reasons.slice(0, 3) });
		}
	}

	hits.sort((a, b) => b.score - a.score || a.thread.daysAgo - b.thread.daysAgo);

	return {
		hits: hits.slice(0, 25),
		interpretation: {
			people: [...people].slice(0, 3),
			stores: [...stores].slice(0, 3),
			keywords: contentTokens.slice(0, 6),
			wantsAttachment,
			wantsUnread
		}
	};
}
