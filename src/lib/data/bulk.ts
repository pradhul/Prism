import type { Thread, CategoryKey, Group } from '$lib/types';

/**
 * Deterministic generator for the long tail of a realistic mailbox (~1,400 mails).
 * Everything is seeded so server and client render identical data (no hydration
 * mismatches) and the demo is stable between visits.
 */

function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const rand = mulberry32(20261104);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

/** Fixed "today" anchor so date labels line up with the hand-authored threads. */
const ANCHOR = new Date(2026, 10, 4);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateLabel(daysAgo: number): string {
	if (daysAgo === 0) return `${String(between(6, 21)).padStart(2, '0')}:${String(between(0, 59)).padStart(2, '0')}`;
	if (daysAgo === 1) return 'Yesterday';
	const d = new Date(ANCHOR);
	d.setDate(d.getDate() - daysAgo);
	return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function timeGroupOf(daysAgo: number): string {
	if (daysAgo === 0) return 'Today';
	if (daysAgo === 1) return 'Yesterday';
	if (daysAgo <= 7) return 'This week';
	return 'Earlier';
}

interface MerchantSpec {
	name: string;
	initials: string;
	avatar: string;
	count: number;
	subjects: string[];
	gists: string[];
}

const merchants: MerchantSpec[] = [
	{
		name: 'Amazon',
		initials: 'AZ',
		avatar: 'bg-amber-100 text-amber-700',
		count: 120,
		subjects: [
			'Your order has been delivered',
			'Order confirmed: arriving {day}',
			'Your package is out for delivery',
			'Refund issued for your return',
			'Rate your recent purchase',
			'Your invoice for order #{n}'
		],
		gists: [
			'Delivery confirmation — nothing needed from you.',
			'Order confirmed and on schedule.',
			'Refund of a returned item has been processed to your card.',
			'A feedback request for a recent order.'
		]
	},
	{
		name: 'Swiggy',
		initials: 'SW',
		avatar: 'bg-orange-100 text-orange-700',
		count: 96,
		subjects: [
			'Your order from {restaurant} is on the way',
			'Order delivered — enjoy your meal!',
			'₹75 off your next order 🎉',
			'Rate your order from {restaurant}',
			'Your Swiggy One membership receipt'
		],
		gists: [
			'Food delivery confirmation from a recent order.',
			'A promotional coupon — expires in 7 days.',
			'Rating request for a delivered order.'
		]
	},
	{
		name: 'Flipkart',
		initials: 'FK',
		avatar: 'bg-blue-100 text-blue-700',
		count: 60,
		subjects: [
			'Your Flipkart order is confirmed',
			'Delivered: your recent order',
			'Big Billion Days — early access inside',
			'Your refund has been credited'
		],
		gists: ['Order status update — no action needed.', 'A sale promotion.', 'Refund credited to original payment method.']
	},
	{
		name: 'Uber Eats',
		initials: 'UE',
		avatar: 'bg-emerald-100 text-emerald-700',
		count: 48,
		subjects: ['Your order receipt', 'Your order from {restaurant} has arrived', '30% off your next three orders'],
		gists: ['Receipt for a delivered order.', 'A promotional offer on upcoming orders.']
	},
	{
		name: 'Zomato',
		initials: 'ZO',
		avatar: 'bg-rose-100 text-rose-700',
		count: 40,
		subjects: ['Order delivered: {restaurant}', 'Your Zomato Gold renewal receipt', 'Weekend cravings? Flat 40% off'],
		gists: ['Delivery confirmation.', 'Membership renewal receipt.', 'A weekend promotion.']
	},
	{
		name: 'Apple',
		initials: 'AP',
		avatar: 'bg-slate-100 text-slate-700',
		count: 12,
		subjects: ['Your receipt from Apple', 'Your subscription renewal', 'Your invoice is ready'],
		gists: ['App Store / iCloud receipt — filed for your records.']
	}
];

const restaurants = ['Burrito Barn', 'Green Bowl', 'Pizza 101', 'Noodle House', 'The Curry Club', 'Taco Verde'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface NewsletterSpec {
	name: string;
	initials: string;
	avatar: string;
	count: number;
	subjects: string[];
}

const newsletters: NewsletterSpec[] = [
	{
		name: 'Morning Brew',
		initials: 'MB',
		avatar: 'bg-sky-100 text-sky-700',
		count: 84,
		subjects: [
			'☕ Markets wobble, chips rally',
			'☕ The week ahead in tech and money',
			'☕ Why everyone is talking about rates again',
			'☕ Your Tuesday briefing'
		]
	},
	{
		name: 'TLDR',
		initials: 'TL',
		avatar: 'bg-violet-100 text-violet-700',
		count: 90,
		subjects: [
			'TLDR: new model drops, browser wars, dev tools',
			'TLDR: the quiet rise of local-first apps',
			'TLDR: what shipped this week',
			'TLDR: AI, rockets, and a big acquisition'
		]
	},
	{
		name: 'The Interface',
		initials: 'TI',
		avatar: 'bg-blue-100 text-blue-700',
		count: 66,
		subjects: [
			'5 interface patterns worth stealing',
			'The case against infinite scroll',
			'Design systems are eating the world',
			'Editorial UIs are back'
		]
	},
	{
		name: 'Medium Daily',
		initials: 'MD',
		avatar: 'bg-neutral-200 text-neutral-700',
		count: 84,
		subjects: [
			'Stories picked for you',
			'What we’re reading this week',
			'Top highlights from writers you follow'
		]
	},
	{
		name: 'LinkedIn News',
		initials: 'LN',
		avatar: 'bg-indigo-100 text-indigo-700',
		count: 78,
		subjects: [
			'You appeared in 12 searches this week',
			'Trending in your network',
			'Jobs you may be interested in',
			'Your network is talking about hiring'
		]
	},
	{
		name: 'Substack Weekly',
		initials: 'SB',
		avatar: 'bg-amber-100 text-amber-700',
		count: 78,
		subjects: ['New post from a writer you follow', 'Your weekly digest', 'Most-read essays this week']
	}
];

interface OtherSpec {
	name: string;
	initials: string;
	avatar: string;
	category: CategoryKey;
	count: number;
	subjects: string[];
}

const otherSenders: OtherSpec[] = [
	{
		name: 'GitHub',
		initials: 'GH',
		avatar: 'bg-neutral-200 text-neutral-700',
		category: 'work',
		count: 140,
		subjects: [
			'[prism] PR #{n} was merged',
			'[prism] New review requested on PR #{n}',
			'[prism] CI failed on main',
			'Your Dependabot digest'
		]
	},
	{
		name: 'Jira',
		initials: 'JI',
		avatar: 'bg-blue-100 text-blue-700',
		category: 'work',
		count: 110,
		subjects: ['PRSM-{n} was assigned to you', 'Sprint 24 has started', 'PRSM-{n}: status changed to Done', 'Weekly sprint summary']
	},
	{
		name: 'Slack',
		initials: 'SL',
		avatar: 'bg-violet-100 text-violet-700',
		category: 'work',
		count: 90,
		subjects: ['You have 3 unread mentions in #design', 'Notification digest from your workspaces', 'New message in #announcements']
	},
	{
		name: 'Google Drive',
		initials: 'GD',
		avatar: 'bg-emerald-100 text-emerald-700',
		category: 'updates',
		count: 70,
		subjects: ['“Roadmap 2027” was shared with you', 'Comment resolved in “Q3 Plan”', 'Storage is 80% full'],
	},
	{
		name: 'Calendar',
		initials: 'CA',
		avatar: 'bg-teal-100 text-teal-700',
		category: 'updates',
		count: 110,
		subjects: ['Invitation: Design sync ({day})', 'Updated: Sprint planning', 'Reminder: 1:1 with Nina tomorrow']
	}
];

function fill(template: string): string {
	return template
		.replace('{restaurant}', pick(restaurants))
		.replace('{day}', pick(days))
		.replaceAll('{n}', String(between(100, 999)));
}

function makeThread(opts: {
	id: string;
	subject: string;
	gist: string;
	sender: string;
	initials: string;
	avatar: string;
	group: Group;
	category: CategoryKey;
	unreadChance: number;
	merchant?: string;
	readMin?: number;
}): Thread {
	const daysAgo = between(0, 60);
	const unread = rand() < opts.unreadChance;
	const timestamp = dateLabel(daysAgo);
	return {
		id: opts.id,
		subject: opts.subject,
		group: opts.group,
		category: opts.category,
		priority: 'low',
		unread,
		done: false,
		archived: false,
		daysAgo,
		curated: false,
		merchant: opts.merchant,
		readMin: opts.readMin,
		timestamp,
		timeGroup: timeGroupOf(daysAgo),
		gist: opts.gist,
		summary: [opts.gist],
		sender: opts.sender,
		senderInitials: opts.initials,
		avatar: opts.avatar,
		tags: [],
		messages: [
			{
				id: 'm1',
				sender: opts.sender,
				senderInitials: opts.initials,
				avatar: opts.avatar,
				time: timestamp,
				body: [opts.gist, 'This is an automated message — no reply is needed.']
			}
		]
	};
}

function build(): Thread[] {
	const out: Thread[] = [];

	for (const m of merchants) {
		for (let i = 0; i < m.count; i++) {
			out.push(
				makeThread({
					id: `order-${m.name.toLowerCase().replace(/\s/g, '')}-${i}`,
					subject: fill(pick(m.subjects)),
					gist: pick(m.gists),
					sender: m.name,
					initials: m.initials,
					avatar: m.avatar,
					group: 'orders',
					category: 'finance',
					unreadChance: 0.12,
					merchant: m.name
				})
			);
		}
	}

	for (const n of newsletters) {
		for (let i = 0; i < n.count; i++) {
			out.push(
				makeThread({
					id: `news-${n.name.toLowerCase().replace(/\s/g, '')}-${i}`,
					subject: fill(pick(n.subjects)),
					gist: 'An issue of a newsletter you subscribe to. Prism can summarize it when you have time.',
					sender: n.name,
					initials: n.initials,
					avatar: n.avatar,
					group: 'catchup',
					category: 'updates',
					unreadChance: 0.24,
					readMin: between(2, 7)
				})
			);
		}
	}

	for (const o of otherSenders) {
		for (let i = 0; i < o.count; i++) {
			out.push(
				makeThread({
					id: `misc-${o.name.toLowerCase().replace(/\s/g, '')}-${i}`,
					subject: fill(pick(o.subjects)),
					gist: 'A routine notification. Prism keeps these out of your way.',
					sender: o.name,
					initials: o.initials,
					avatar: o.avatar,
					group: 'other',
					category: o.category,
					unreadChance: 0.08
				})
			);
		}
	}

	// Newest first, stable-ish ordering inside a day
	return out.sort((a, b) => a.daysAgo - b.daysAgo);
}

export const bulkThreads: Thread[] = build();
