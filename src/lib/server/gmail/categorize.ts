import type { CategoryKey, Group, Priority, Thread, EmailMessage } from '$lib/types';

const AVATARS = [
	'bg-violet-100 text-violet-700',
	'bg-sky-100 text-sky-700',
	'bg-rose-100 text-rose-700',
	'bg-amber-100 text-amber-700',
	'bg-teal-100 text-teal-700',
	'bg-slate-100 text-slate-700',
	'bg-indigo-100 text-indigo-700'
];

export function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
	return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function avatarFor(seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
	return AVATARS[h % AVATARS.length]!;
}

export function parseFromHeader(from: string): { name: string; email: string } {
	const match = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^\s<>]+@[^\s<>]+)>?$/);
	if (!match) return { name: from.trim() || 'Unknown', email: '' };
	const name = (match[1] || match[2] || 'Unknown').trim().replace(/^"|"$/g, '');
	const email = (match[2] || '').trim().toLowerCase();
	return { name: name || email || 'Unknown', email };
}

export function formatTimestamp(date: Date): { timestamp: string; timeGroup: string; daysAgo: number } {
	const now = new Date();
	const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startMsg = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const daysAgo = Math.max(0, Math.round((startToday.getTime() - startMsg.getTime()) / 86_400_000));

	const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	if (daysAgo === 0) return { timestamp: time, timeGroup: 'Today', daysAgo };
	if (daysAgo === 1) return { timestamp: `Yesterday ${time}`, timeGroup: 'Yesterday', daysAgo };
	if (daysAgo < 7) {
		const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
		return { timestamp: `${weekday} ${time}`, timeGroup: 'This week', daysAgo };
	}
	const stamp = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	return { timestamp: stamp, timeGroup: 'Earlier', daysAgo };
}

export interface CategorizedMail {
	group: Group;
	category: CategoryKey;
	priority: Priority;
	gist: string;
	summary: string[];
	tags: string[];
	merchant?: string;
	readMin?: number;
}

const ORDER_HINTS =
	/\b(order|shipped|shipping|delivery|delivered|tracking|invoice|receipt|purchase|parcel|out for delivery|your package)\b/i;
const ORDER_SENDERS =
	/\b(amazon|flipkart|myntra|shopify|ebay|etsy|walmart|target|nike|adidas|apple\.com|bestbuy|ikea|swiggy|zomato|uber\s?eats|doordash|instacart)\b/i;
const ACTION_HINTS =
	/\b(please\s+(review|confirm|approve|respond|reply|sign)|action required|rsvp|waiting on you|can you|need your|deadline|eod|asap|sign off|approval)\b/i;
const CATCHUP_HINTS =
	/\b(newsletter|unsubscribe|digest|weekly roundup|just for you|top stories|noreply|no-reply)\b/i;
const URGENT_HINTS = /\b(urgent|asap|immediately|today only|final notice)\b/i;

export function heuristicCategorize(input: {
	subject: string;
	snippet: string;
	sender: string;
	senderEmail: string;
	listUnsubscribe?: boolean;
}): CategorizedMail {
	const hay = `${input.subject}\n${input.snippet}\n${input.sender}\n${input.senderEmail}`;
	const domain = input.senderEmail.split('@')[1] ?? '';

	if (input.listUnsubscribe || CATCHUP_HINTS.test(hay) || /mailchimp|substack|beehiiv|medium\.com/i.test(domain)) {
		return {
			group: 'catchup',
			category: 'updates',
			priority: 'low',
			gist: input.snippet.slice(0, 160) || input.subject,
			summary: [input.snippet.slice(0, 200) || 'Newsletter / FYI — nothing needed from you.'],
			tags: ['FYI'],
			readMin: Math.max(1, Math.round((input.snippet.length || 80) / 500))
		};
	}

	if (ORDER_HINTS.test(hay) || ORDER_SENDERS.test(hay)) {
		const merchant =
			input.sender.replace(/\s*(orders?|no-?reply|store|support).*$/i, '').trim() ||
			domain.split('.')[0] ||
			'Store';
		return {
			group: 'orders',
			category: 'finance',
			priority: 'normal',
			gist: input.snippet.slice(0, 160) || input.subject,
			summary: [input.snippet.slice(0, 200) || 'Order / delivery update.'],
			tags: ['Order'],
			merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1)
		};
	}

	if (ACTION_HINTS.test(hay) || URGENT_HINTS.test(hay)) {
		return {
			group: 'action',
			category: URGENT_HINTS.test(hay) ? 'urgent' : 'work',
			priority: URGENT_HINTS.test(hay) ? 'urgent' : 'high',
			gist: input.snippet.slice(0, 160) || input.subject,
			summary: [input.snippet.slice(0, 200) || 'Looks like this still needs a response from you.'],
			tags: URGENT_HINTS.test(hay) ? ['Urgent'] : ['Needs reply']
		};
	}

	return {
		group: 'other',
		category: 'updates',
		priority: 'low',
		gist: input.snippet.slice(0, 160) || input.subject,
		summary: [input.snippet.slice(0, 200) || 'Low-signal mail.'],
		tags: []
	};
}

export function toClientThread(row: {
	id: string;
	subject: string;
	group: Group;
	category: CategoryKey;
	priority: Priority;
	unread: boolean;
	done: boolean;
	archived: boolean;
	daysAgo: number;
	timestamp: string;
	timeGroup: string;
	gist: string;
	summary: string[] | unknown;
	sender: string;
	senderInitials: string;
	avatar: string;
	tags: string[] | unknown;
	messages: unknown;
	merchant: string | null;
	readMin: number | null;
}): Thread {
	return {
		id: row.id,
		subject: row.subject,
		group: row.group,
		category: row.category,
		priority: row.priority,
		unread: row.unread,
		done: row.done,
		archived: row.archived,
		daysAgo: row.daysAgo,
		timestamp: row.timestamp,
		timeGroup: row.timeGroup,
		gist: row.gist,
		summary: Array.isArray(row.summary) ? (row.summary as string[]) : [],
		sender: row.sender,
		senderInitials: row.senderInitials,
		avatar: row.avatar,
		tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
		messages: Array.isArray(row.messages) ? (row.messages as EmailMessage[]) : [],
		merchant: row.merchant ?? undefined,
		readMin: row.readMin ?? undefined
	};
}
