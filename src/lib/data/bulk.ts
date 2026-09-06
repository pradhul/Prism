import type { Thread, CategoryKey, Group } from '$lib/types';

/**
 * Deterministic generator for the long tail of a realistic mailbox (~1,400 mails).
 * Everything is seeded so server and client render identical data (no hydration
 * mismatches) and the demo is stable between visits.
 *
 * Summaries are intentionally specific — what was ordered, for how much, to which
 * address, arriving when — because a summary that just repeats the subject line
 * is useless.
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

const goods = [
	'Wireless mouse',
	'Yoga mat',
	'Phone case (clear)',
	'LED desk strip',
	'Insulated water bottle',
	'Notebook set ×3',
	'Desk organizer',
	'Running socks ×4',
	'Bluetooth earbuds',
	'Ceramic mug'
];
const fashion = [
	'Slim-fit jeans',
	'Cotton crew tee ×2',
	'Running shoes',
	'Denim jacket',
	'Ankle socks ×5',
	'Linen shirt',
	'Canvas sneakers',
	'Hooded sweatshirt'
];
const dishes = [
	'Paneer tikka bowl',
	'Margherita pizza',
	'Chicken burrito',
	'Ramen (spicy miso)',
	'Butter chicken + naan',
	'Veg thali',
	'Falafel wrap'
];
const restaurants = ['Burrito Barn', 'Green Bowl', 'Pizza 101', 'Noodle House', 'The Curry Club', 'Taco Verde'];
const addresses = ['Home — 14 Rosewood Lane, Apt 3B', 'Office — 4th floor, Indigo Park'];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Rich {
	subject: string;
	gist: string;
	summary: string[];
	body: string[];
	actionLink?: { label: string; url: string };
}

type RichFn = () => Rich;

function goodsOrder(store: string, currency: string, pool: string[] = goods): Rich {
	const item = pick(pool);
	const amt = `${currency}${currency === '₹' ? between(199, 2499) : between(9, 89)}`;
	const addr = pick(addresses);
	const orderNo = `${between(1000, 9999)}-${between(10, 99)}`;
	const kind = rand();
	if (kind < 0.45) {
		const day = pick(weekdays);
		return {
			subject: `Your ${store} order is on the way`,
			gist: `${item} (${amt}) shipped to ${addr.split(' — ')[0]} — arriving ${day}.`,
			summary: [
				`Order #${orderNo}: ${item.toLowerCase()} — ${amt} total.`,
				`Shipping to ${addr}.`,
				`Arriving ${day} via standard delivery.`
			],
			body: [`Your order #${orderNo} (${item.toLowerCase()}, ${amt}) has shipped to ${addr}.`, `Estimated arrival: ${day}.`],
			actionLink: { label: 'Track package', url: `https://${store.toLowerCase()}.example.com/track/${orderNo}` }
		};
	} else if (kind < 0.8) {
		return {
			subject: `Delivered: your ${store} order`,
			gist: `${item} (${amt}) delivered to ${addr.split(' — ')[0]} — return window open for 14 days.`,
			summary: [
				`Order #${orderNo}: ${item.toLowerCase()} — ${amt}.`,
				`Delivered to ${addr}.`,
				'Return window open for 14 days if anything is wrong.'
			],
			body: [`Your order #${orderNo} (${item.toLowerCase()}) was delivered to ${addr}.`],
			actionLink: { label: 'View order', url: `https://${store.toLowerCase()}.example.com/orders/${orderNo}` }
		};
	}
	return {
		subject: `Refund processed for your ${store} return`,
		gist: `${amt} refunded for the returned ${item.toLowerCase()} — back on your card in 3–5 days.`,
		summary: [
			`Refund of ${amt} approved for order #${orderNo} (${item.toLowerCase()}).`,
			'Amount returns to your original payment method in 3–5 business days.'
		],
		body: [`We've processed your refund of ${amt} for order #${orderNo}.`],
		actionLink: { label: 'View refund', url: `https://${store.toLowerCase()}.example.com/refunds/${orderNo}` }
	};
}

function foodOrder(app: string): Rich {
	const dish = pick(dishes);
	const rest = pick(restaurants);
	const amt = `₹${between(180, 720)}`;
	const addr = pick(addresses).split(' — ')[0];
	const orderNo = `${between(10000, 99999)}`;
	if (rand() < 0.7) {
		return {
			subject: `Order delivered: ${rest}`,
			gist: `${dish} from ${rest} (${amt}) delivered to ${addr} — rate it if it was good.`,
			summary: [`${dish} from ${rest} — ${amt}.`, `Delivered to ${addr}.`, 'Rating request included — optional.'],
			body: [`Your order #${orderNo} from ${rest} (${dish}, ${amt}) was delivered to ${addr}. Enjoy!`],
			actionLink: { label: 'View receipt', url: `https://${app.toLowerCase().replace(/\s/g, '')}.example.com/orders/${orderNo}` }
		};
	}
	return {
		subject: `${between(20, 60)}% off your next ${app} order`,
		gist: `A promo coupon for ${app} — valid on orders above ₹${between(199, 399)}, expires in 7 days.`,
		summary: [`Discount coupon for your next ${app} order.`, `Minimum order ₹${between(199, 399)} · expires in 7 days.`],
		body: ['A limited-time discount on your next order. Terms apply.'],
		actionLink: { label: 'Claim offer', url: `https://${app.toLowerCase().replace(/\s/g, '')}.example.com/offers` }
	};
}

function appleReceipt(): Rich {
	const item = pick(['iCloud+ 200GB', 'Apple Music', 'Apple TV+', 'Apple One']);
	const amt = `$${pick(['2.99', '5.99', '9.99', '16.95'])}`;
	return {
		subject: 'Your receipt from Apple',
		gist: `${item} renewed — ${amt}/month on the card ending 4471, next billing in 30 days.`,
		summary: [`${item} subscription renewed for ${amt}.`, 'Billed to the card ending 4471.', 'Next renewal in 30 days.'],
		body: [`Subscription: ${item}. Amount: ${amt}. Payment method: card ending 4471.`],
		actionLink: { label: 'Manage subscription', url: 'https://apple.example.com/subscriptions' }
	};
}

interface MerchantSpec {
	name: string;
	initials: string;
	avatar: string;
	count: number;
	make: RichFn;
}

const merchants: MerchantSpec[] = [
	{ name: 'Amazon', initials: 'AZ', avatar: 'bg-amber-100 text-amber-700', count: 120, make: () => goodsOrder('Amazon', '$') },
	{ name: 'Swiggy', initials: 'SW', avatar: 'bg-orange-100 text-orange-700', count: 96, make: () => foodOrder('Swiggy') },
	{ name: 'Flipkart', initials: 'FK', avatar: 'bg-blue-100 text-blue-700', count: 60, make: () => goodsOrder('Flipkart', '₹') },
	{ name: 'Myntra', initials: 'MY', avatar: 'bg-pink-100 text-pink-700', count: 52, make: () => goodsOrder('Myntra', '₹', fashion) },
	{ name: 'Uber Eats', initials: 'UE', avatar: 'bg-emerald-100 text-emerald-700', count: 48, make: () => foodOrder('Uber Eats') },
	{ name: 'Zomato', initials: 'ZO', avatar: 'bg-rose-100 text-rose-700', count: 40, make: () => foodOrder('Zomato') },
	{ name: 'Apple', initials: 'AP', avatar: 'bg-slate-100 text-slate-700', count: 12, make: appleReceipt }
];

const topics = [
	'AI chips and who actually profits',
	'design systems at scale',
	'the local-first movement',
	'why onboarding flows fail',
	'rate cuts and what they mean for startups',
	'editorial UIs replacing feeds',
	'the end of the folder metaphor',
	'shipping faster with smaller teams',
	'developer tools consolidation',
	'ambient computing patterns'
];

function newsletterIssue(name: string): Rich {
	const t1 = pick(topics);
	let t2 = pick(topics);
	while (t2 === t1) t2 = pick(topics);
	const readMin = between(2, 7);
	return {
		subject: `${name === 'Morning Brew' ? '☕ ' : name === 'TLDR' ? 'TLDR: ' : ''}${t1[0].toUpperCase() + t1.slice(1)}`,
		gist: `This issue covers ${t1} and ${t2} — about a ${readMin}-minute read.`,
		summary: [
			`Lead story: ${t1}.`,
			`Also inside: ${t2}.`,
			`Roughly ${readMin} minutes to read end to end.`
		],
		body: [`In this issue: ${t1}, plus a shorter piece on ${t2}.`],
		actionLink: { label: 'Read in browser', url: `https://${name.toLowerCase().replace(/\s/g, '')}.example.com/latest` }
	};
}

interface NewsletterSpec {
	name: string;
	initials: string;
	avatar: string;
	count: number;
}

const newsletters: NewsletterSpec[] = [
	{ name: 'Morning Brew', initials: 'MB', avatar: 'bg-sky-100 text-sky-700', count: 84 },
	{ name: 'TLDR', initials: 'TL', avatar: 'bg-violet-100 text-violet-700', count: 90 },
	{ name: 'The Interface', initials: 'TI', avatar: 'bg-blue-100 text-blue-700', count: 66 },
	{ name: 'Medium Daily', initials: 'MD', avatar: 'bg-neutral-200 text-neutral-700', count: 84 },
	{ name: 'LinkedIn News', initials: 'LN', avatar: 'bg-indigo-100 text-indigo-700', count: 78 },
	{ name: 'Substack Weekly', initials: 'SB', avatar: 'bg-amber-100 text-amber-700', count: 78 }
];

const people = ['Nina', 'Priya', 'Dev', 'Sam', 'Marcus', 'Ana'];

const otherMakers: Record<string, RichFn> = {
	GitHub: () => {
		const n = between(100, 999);
		const branch = pick(['tidy-sidebar', 'fix-auth-redirect', 'bump-deps', 'stream-groups', 'search-scoring']);
		const kind = rand();
		if (kind < 0.5) {
			const files = between(2, 14);
			return {
				subject: `[prism] PR #${n} was merged`,
				gist: `PR #${n} (${branch}) merged into main by ${pick(people)} — ${files} files changed.`,
				summary: [`PR #${n} “${branch}” merged into main.`, `${files} files changed, +${between(20, 400)}/−${between(5, 120)} lines.`],
				body: [`Pull request #${n} (${branch}) was merged into main.`],
				actionLink: { label: 'Open PR', url: `https://github.example.com/prism/pull/${n}` }
			};
		}
		return {
			subject: `[prism] Review requested on PR #${n}`,
			gist: `${pick(people)} asked for your review on PR #${n} (${branch}).`,
			summary: [`Review requested on PR #${n} “${branch}”.`, 'CI is green — waiting only on review.'],
			body: [`Your review was requested on pull request #${n}.`],
			actionLink: { label: 'Review PR', url: `https://github.example.com/prism/pull/${n}` }
		};
	},
	Jira: () => {
		const n = between(100, 999);
		const status = pick(['In Review', 'Done', 'Blocked', 'In Progress']);
		return {
			subject: `PRSM-${n}: status changed to ${status}`,
			gist: `PRSM-${n} moved to ${status} by ${pick(people)}.`,
			summary: [`Ticket PRSM-${n} is now ${status}.`, `Updated by ${pick(people)} · sprint 24.`],
			body: [`PRSM-${n} status changed to ${status}.`],
			actionLink: { label: 'Open ticket', url: `https://jira.example.com/browse/PRSM-${n}` }
		};
	},
	Slack: () => {
		const ch = pick(['#design', '#eng', '#announcements', '#random']);
		const count = between(2, 9);
		return {
			subject: `You have ${count} unread mentions in ${ch}`,
			gist: `${count} mentions in ${ch} — latest from ${pick(people)} about ${pick(['tokens', 'the release', 'standup', 'the offsite'])}.`,
			summary: [`${count} unread mentions in ${ch}.`, `Most recent from ${pick(people)}.`],
			body: [`You were mentioned ${count} times in ${ch}.`],
			actionLink: { label: 'Open Slack', url: 'https://slack.example.com' }
		};
	},
	'Google Drive': () => {
		const doc = pick(['Roadmap 2027', 'Q3 Plan', 'Interview notes', 'Design review deck']);
		return {
			subject: `“${doc}” was shared with you`,
			gist: `${pick(people)} shared “${doc}” with comment access.`,
			summary: [`“${doc}” shared by ${pick(people)}.`, 'You have comment access.'],
			body: [`${pick(people)} shared the document “${doc}” with you.`],
			actionLink: { label: 'Open document', url: 'https://drive.example.com/shared' }
		};
	},
	Calendar: () => {
		const meeting = pick(['Design sync', 'Sprint planning', '1:1 with Nina', 'Roadmap review', 'All hands']);
		const day = pick(weekdays);
		const hour = between(9, 16);
		return {
			subject: `Invitation: ${meeting} (${day})`,
			gist: `${meeting} on ${day} at ${hour}:30, 30 minutes, ${between(2, 9)} attendees.`,
			summary: [`${meeting} — ${day} ${hour}:30–${hour + 1}:00.`, `${between(2, 9)} attendees · Room ${between(1, 6)}A.`],
			body: [`You've been invited to ${meeting} on ${day} at ${hour}:30.`],
			actionLink: { label: 'View invite', url: 'https://calendar.example.com/invite' }
		};
	}
};

interface OtherSpec {
	name: string;
	initials: string;
	avatar: string;
	category: CategoryKey;
	count: number;
}

const otherSenders: OtherSpec[] = [
	{ name: 'GitHub', initials: 'GH', avatar: 'bg-neutral-200 text-neutral-700', category: 'work', count: 140 },
	{ name: 'Jira', initials: 'JI', avatar: 'bg-blue-100 text-blue-700', category: 'work', count: 110 },
	{ name: 'Slack', initials: 'SL', avatar: 'bg-violet-100 text-violet-700', category: 'work', count: 90 },
	{ name: 'Google Drive', initials: 'GD', avatar: 'bg-emerald-100 text-emerald-700', category: 'updates', count: 70 },
	{ name: 'Calendar', initials: 'CA', avatar: 'bg-teal-100 text-teal-700', category: 'updates', count: 110 }
];

function makeThread(opts: {
	id: string;
	rich: Rich;
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
		subject: opts.rich.subject,
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
		gist: opts.rich.gist,
		summary: opts.rich.summary,
		actionLink: opts.rich.actionLink,
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
				body: [...opts.rich.body, 'This is an automated message — no reply is needed.']
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
					rich: m.make(),
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
					rich: newsletterIssue(n.name),
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
					rich: otherMakers[o.name](),
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
