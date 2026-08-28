import type { Thread } from '$lib/types';

const avatars = {
	violet: 'bg-violet-100 text-violet-700',
	blue: 'bg-sky-100 text-sky-700',
	rose: 'bg-rose-100 text-rose-700',
	amber: 'bg-amber-100 text-amber-700',
	teal: 'bg-teal-100 text-teal-700',
	slate: 'bg-slate-100 text-slate-700',
	indigo: 'bg-indigo-100 text-indigo-700'
};

/**
 * Hand-authored demo threads. These are the "interesting" conversations that the
 * Grid hero and the Arc brief surface. The long tail of a realistic mailbox
 * (~1,400 mails) is generated in `bulk.ts` and merged in the inbox store.
 */
export const curatedThreads: Thread[] = [
	{
		id: 'marcus-timeline',
		subject: 'Client wants an updated Q3 timeline + slide sign-off',
		group: 'action',
		category: 'work',
		priority: 'urgent',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		timestamp: '09:15',
		timeGroup: 'Today',
		gist: 'Client needs a new Q3 delivery timeline and formal approval on the slide deck before you present — by end of day.',
		summary: [
			'Client requested an updated timeline for the Q3 metrics delivery.',
			'Approval is needed on the final slide deck attached.',
			'Needs a response by EOD today to stay on schedule.'
		],
		sender: 'Marcus Vance',
		senderInitials: 'MV',
		avatar: avatars.rose,
		tags: ['Deadline today'],
		messages: [
			{
				id: 'm1',
				sender: 'Sarah Jenkins',
				senderInitials: 'SJ',
				avatar: avatars.violet,
				time: 'Yesterday, 14:32',
				body: [
					"Here's the initial draft of the presentation. Let me know if the direction aligns with the board's expectations before I polish it further."
				]
			},
			{
				id: 'm2',
				sender: 'Marcus Vance',
				senderInitials: 'MV',
				avatar: avatars.rose,
				time: 'Today, 09:15',
				highlighted: true,
				body: [
					'Hi team,',
					'Thanks for sending over the draft. The direction is solid, but the client just reached out and requested an updated timeline specifically for the Q3 metrics delivery.',
					'They also need formal approval on the final slide deck before we present.',
					'Can someone review and confirm by EOD today?',
					'Best,\nMarcus'
				],
				attachment: { name: 'Q3_Metrics_v2.pdf', size: '2.4 MB' }
			}
		]
	},
	{
		id: 'sarah-vc-report',
		subject: 'Q3 Venture Capital Report & Analysis',
		group: 'catchup',
		category: 'work',
		priority: 'high',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		readMin: 4,
		timestamp: '09:42',
		timeGroup: 'Today',
		gist: 'The latest metrics show a 20% jump in mobile engagement — worth a skim before the Q3 review.',
		summary: [
			'User engagement across mobile platforms is up 20% quarter over quarter.',
			'Retention on the new onboarding flow outperformed projections.',
			'Full board review needs your sign-off on the final Q3 numbers.'
		],
		sender: 'Sarah Jenkins',
		senderInitials: 'SJ',
		avatar: avatars.violet,
		tags: ['Investments'],
		messages: [
			{
				id: 'm1',
				sender: 'Sarah Jenkins',
				senderInitials: 'SJ',
				avatar: avatars.violet,
				time: 'Today, 09:42',
				highlighted: true,
				body: [
					'Hi — sharing the Q3 venture report ahead of tomorrow’s review.',
					'The headline is a 20% increase in engagement across mobile, driven mostly by the new onboarding flow. Retention in week one is also up meaningfully.',
					'Full breakdown attached. Would love your read before we finalize the numbers for the board.'
				],
				attachment: { name: 'Q3_VC_Report.pdf', size: '3.1 MB' }
			}
		]
	},
	{
		id: 'design-figma',
		subject: 'Figma prototypes updated for review',
		group: 'action',
		category: 'work',
		priority: 'normal',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		timestamp: '10:15',
		timeGroup: 'Today',
		gist: 'New onboarding flow prototypes are ready — three variants, your feedback wanted by Thursday.',
		summary: [
			'Three onboarding flow variants are ready for review.',
			'Design team is leaning toward variant B for its shorter path to value.',
			'Feedback requested by Thursday standup — you read this but haven’t replied yet.'
		],
		sender: 'Design Team',
		senderInitials: 'DT',
		avatar: avatars.blue,
		tags: ['Design'],
		messages: [
			{
				id: 'm1',
				sender: 'Priya (Design)',
				senderInitials: 'PD',
				avatar: avatars.blue,
				time: 'Today, 10:15',
				highlighted: true,
				body: [
					'Pushed three variants of the new onboarding flow to the shared Figma file.',
					'Leaning toward variant B — it gets people to their first inbox view two taps faster.',
					'Would love thoughts before Thursday’s standup.'
				]
			}
		]
	},
	{
		id: 'marketing-campaign',
		subject: 'Q4 Campaign assets — final approval needed',
		group: 'action',
		category: 'work',
		priority: 'high',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 5,
		curated: true,
		timestamp: 'Oct 30',
		timeGroup: 'Earlier',
		gist: 'Final Q4 campaign assets are ready to ship — read 5 days ago but your sign-off is still pending.',
		summary: [
			'All Q4 campaign creative has been finalized across print, email and social.',
			'Legal has already cleared the copy.',
			'Only your approval is blocking the go-live — pending for 5 days.'
		],
		sender: 'Marketing',
		senderInitials: 'MK',
		avatar: avatars.amber,
		tags: ['Marketing'],
		messages: [
			{
				id: 'm1',
				sender: 'Marketing Team',
				senderInitials: 'MK',
				avatar: avatars.amber,
				time: 'Oct 30, 16:04',
				highlighted: true,
				body: [
					'Final assets for the Q4 campaign are attached — print, email and social sizes all included.',
					'Legal signed off this morning. We just need your final approval to schedule the launch for Monday.'
				],
				attachment: { name: 'Q4_Campaign_Final.zip', size: '18 MB' }
			}
		]
	},
	{
		id: 'alex-lunch',
		subject: 'Lunch tomorrow at the new bistro?',
		group: 'action',
		category: 'personal',
		priority: 'low',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 1,
		curated: true,
		timestamp: 'Yesterday',
		timeGroup: 'Yesterday',
		gist: 'Alex asked about lunch tomorrow at the new place on 5th — you read it but never told him a time.',
		summary: [
			'Alex is proposing lunch tomorrow at the new bistro on 5th.',
			'He asked what time works — no reply sent yet.'
		],
		sender: 'Alex B.',
		senderInitials: 'AB',
		avatar: avatars.teal,
		tags: ['Personal'],
		messages: [
			{
				id: 'm1',
				sender: 'Alex B.',
				senderInitials: 'AB',
				avatar: avatars.teal,
				time: 'Yesterday, 18:20',
				highlighted: true,
				body: [
					'Hey, just wondering if you wanted to grab lunch tomorrow?',
					'That new place on 5th finally opened and I heard their brutalist little bakery counter is worth the walk. Let me know what time works.'
				]
			}
		]
	},
	{
		id: 'itops-maintenance',
		subject: 'Server maintenance scheduled for this weekend',
		group: 'other',
		category: 'updates',
		priority: 'low',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 6,
		curated: true,
		timestamp: 'Oct 29',
		timeGroup: 'Earlier',
		gist: 'Routine maintenance this Saturday, 1–3am — brief downtime expected, no action needed.',
		summary: [
			'Scheduled maintenance window: Saturday 1:00–3:00am.',
			'Brief downtime expected on internal tools only.',
			'No action required from your team.'
		],
		sender: 'IT Ops',
		senderInitials: 'IT',
		avatar: avatars.slate,
		tags: ['System'],
		messages: [
			{
				id: 'm1',
				sender: 'IT Ops',
				senderInitials: 'IT',
				avatar: avatars.slate,
				time: 'Oct 29, 08:00',
				body: [
					'Heads up — we’re running routine server maintenance this Saturday between 1:00 and 3:00am.',
					'You may see brief downtime on internal tools. No action is needed on your end.'
				]
			}
		]
	},
	{
		id: 'stripe-receipt',
		subject: 'Your receipt for Prism Pro — $12.00',
		group: 'orders',
		category: 'finance',
		priority: 'low',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		merchant: 'Subscriptions',
		timestamp: '06:02',
		timeGroup: 'Today',
		gist: 'Monthly Prism Pro subscription renewed — $12.00 charged to your card ending 4471.',
		summary: ['Subscription renewed for another month.', 'Card ending 4471 was charged $12.00.'],
		sender: 'Stripe · Prism',
		senderInitials: 'ST',
		avatar: avatars.indigo,
		tags: ['Receipt'],
		messages: [
			{
				id: 'm1',
				sender: 'Stripe · Prism',
				senderInitials: 'ST',
				avatar: avatars.indigo,
				time: 'Today, 06:02',
				body: ['Your Prism Pro subscription has renewed.', 'Amount charged: $12.00 · Card ending 4471.']
			}
		]
	},
	{
		id: 'amazon-shipped',
		subject: 'Your order has shipped 📦',
		group: 'orders',
		category: 'finance',
		priority: 'low',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		merchant: 'Amazon',
		timestamp: '07:40',
		timeGroup: 'Today',
		gist: 'Desk lamp and cables are on the way — arriving Thursday via standard shipping.',
		summary: ['Order #4471-99 has shipped.', 'Estimated delivery: Thursday.'],
		sender: 'Amazon',
		senderInitials: 'AZ',
		avatar: avatars.amber,
		tags: ['Delivery'],
		messages: [
			{
				id: 'm1',
				sender: 'Amazon',
				senderInitials: 'AZ',
				avatar: avatars.amber,
				time: 'Today, 07:40',
				body: ['Good news — your order is on its way.', 'Desk lamp, USB-C cable ×2. Arriving Thursday.']
			}
		]
	},
	{
		id: 'hr-benefits',
		subject: 'Health benefits enrollment ends Friday',
		group: 'action',
		category: 'work',
		priority: 'high',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		timestamp: '08:05',
		timeGroup: 'Today',
		gist: 'Open enrollment closes Friday at 5pm — you have not yet selected a plan for next year.',
		summary: [
			'Open enrollment window closes Friday at 5:00pm.',
			'No plan selection on file yet for next year.',
			'Takes about 10 minutes to complete in the HR portal.'
		],
		sender: 'People Team',
		senderInitials: 'PT',
		avatar: avatars.rose,
		tags: ['Deadline Friday'],
		messages: [
			{
				id: 'm1',
				sender: 'People Team',
				senderInitials: 'PT',
				avatar: avatars.rose,
				time: 'Today, 08:05',
				highlighted: true,
				body: [
					'Friendly reminder — open enrollment for health benefits closes this Friday at 5:00pm.',
					'We don’t see a plan selection on file for you yet. It takes about 10 minutes in the portal — don’t let it lapse.'
				]
			}
		]
	},
	{
		id: 'priya-lease',
		subject: 'Lease renewal — a couple of questions',
		group: 'action',
		category: 'personal',
		priority: 'high',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 1,
		curated: true,
		timestamp: 'Yesterday',
		timeGroup: 'Yesterday',
		gist: 'Your landlord sent the renewal terms and needs a decision on the 12-month option by next week.',
		summary: [
			'Renewal offer: 12-month lease at a 4% increase.',
			'A month-to-month option is available at a higher rate.',
			'Landlord needs your decision by next Monday.'
		],
		sender: 'Priya (Landlord)',
		senderInitials: 'PL',
		avatar: avatars.teal,
		tags: ['Personal'],
		messages: [
			{
				id: 'm1',
				sender: 'Priya (Landlord)',
				senderInitials: 'PL',
				avatar: avatars.teal,
				time: 'Yesterday, 11:30',
				highlighted: true,
				body: [
					'Hi! Wanted to send over the lease renewal terms ahead of your end date.',
					'12 months at a 4% increase, or month-to-month at a higher rate if you’d rather stay flexible.',
					'No rush, but I’d love to know your decision by next Monday so I can update the paperwork.'
				]
			}
		]
	},
	{
		id: 'bank-signin',
		subject: 'Unusual sign-in detected on your account',
		group: 'action',
		category: 'urgent',
		priority: 'urgent',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		timestamp: '06:51',
		timeGroup: 'Today',
		gist: 'A new sign-in from an unrecognized device in Austin, TX. Confirm it was you or secure your account now.',
		summary: [
			'New sign-in from an unrecognized device in Austin, TX.',
			'If this wasn’t you, secure your account immediately.',
			'Two-factor authentication was not required for this sign-in.'
		],
		sender: 'Security Alerts',
		senderInitials: 'SA',
		avatar: avatars.rose,
		tags: ['Security'],
		messages: [
			{
				id: 'm1',
				sender: 'Security Alerts',
				senderInitials: 'SA',
				avatar: avatars.rose,
				time: 'Today, 06:51',
				highlighted: true,
				body: [
					'We noticed a new sign-in to your account from a device we don’t recognize in Austin, TX.',
					'If this was you, no action is needed. If not, please secure your account right away and review recent activity.'
				]
			}
		]
	},
	{
		id: 'coach-progress',
		subject: 'Your weekly progress summary',
		group: 'catchup',
		category: 'personal',
		priority: 'low',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 1,
		curated: true,
		readMin: 2,
		timestamp: 'Yesterday',
		timeGroup: 'Yesterday',
		gist: 'Four workouts logged this week, up from two — coach left a note about Saturday’s long run.',
		summary: [
			'Four workouts completed this week, up from two last week.',
			'Coach suggests an easy pace for Saturday’s long run.'
		],
		sender: 'Coach Dana',
		senderInitials: 'CD',
		avatar: avatars.teal,
		tags: ['Fitness'],
		messages: [
			{
				id: 'm1',
				sender: 'Coach Dana',
				senderInitials: 'CD',
				avatar: avatars.teal,
				time: 'Yesterday, 19:00',
				body: [
					'Nice week — four sessions logged, double last week’s count.',
					'For Saturday’s long run, keep it conversational pace. We’ll pick up intensity next week.'
				]
			}
		]
	},
	{
		id: 'digest-newsletter',
		subject: 'The Interface: 5 product design ideas worth stealing',
		group: 'catchup',
		category: 'updates',
		priority: 'low',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 1,
		curated: true,
		readMin: 5,
		timestamp: 'Yesterday',
		timeGroup: 'Yesterday',
		gist: 'This week’s roundup covers ambient AI patterns, editorial inbox UIs, and better empty states.',
		summary: [
			'Roundup of five interface patterns from recent product launches.',
			'Includes a section on ambient AI and editorial-style content UIs.'
		],
		sender: 'The Interface',
		senderInitials: 'TI',
		avatar: avatars.blue,
		tags: ['Newsletter'],
		messages: [
			{
				id: 'm1',
				sender: 'The Interface',
				senderInitials: 'TI',
				avatar: avatars.blue,
				time: 'Yesterday, 07:00',
				body: [
					'This week: five interface patterns worth stealing, from ambient AI to editorial-style reading UIs replacing dense inbox lists.'
				]
			}
		]
	},
	{
		id: 'recruiter-pm',
		subject: 'Thinking of you for a Senior PM role',
		group: 'catchup',
		category: 'work',
		priority: 'normal',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 6,
		curated: true,
		readMin: 2,
		timestamp: 'Oct 29',
		timeGroup: 'Earlier',
		gist: 'A recruiter reached out about a Senior PM role at a Series C startup — open to a quick chat.',
		summary: [
			'Senior PM opening at a Series C fintech startup.',
			'Recruiter is offering a 15-minute intro call, no obligation.'
		],
		sender: 'Jordan (Recruiter)',
		senderInitials: 'JR',
		avatar: avatars.violet,
		tags: ['Opportunity'],
		messages: [
			{
				id: 'm1',
				sender: 'Jordan (Recruiter)',
				senderInitials: 'JR',
				avatar: avatars.violet,
				time: 'Oct 29, 15:10',
				body: [
					'Came across your profile and thought of you for a Senior PM role at a Series C fintech startup.',
					'No pressure at all — happy to do a quick 15-minute call if you’re curious.'
				]
			}
		]
	},
	{
		id: 'flight-gate',
		subject: 'Gate change for your flight tomorrow',
		group: 'action',
		category: 'urgent',
		priority: 'urgent',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 0,
		curated: true,
		timestamp: '05:30',
		timeGroup: 'Today',
		gist: 'Flight 208 to SFO moved from Gate B12 to C4 — same departure time, boarding pass updated.',
		summary: [
			'Gate changed from B12 to C4.',
			'Departure time unchanged at 7:45am.',
			'Updated boarding pass is attached.'
		],
		sender: 'Airline Alerts',
		senderInitials: 'AA',
		avatar: avatars.rose,
		tags: ['Travel'],
		messages: [
			{
				id: 'm1',
				sender: 'Airline Alerts',
				senderInitials: 'AA',
				avatar: avatars.rose,
				time: 'Today, 05:30',
				highlighted: true,
				body: [
					'Your flight 208 to SFO has moved gates — from B12 to C4.',
					'Departure time is unchanged at 7:45am. Updated boarding pass attached.'
				],
				attachment: { name: 'Boarding_Pass.pdf', size: '210 KB' }
			}
		]
	},
	{
		id: 'utility-bill',
		subject: 'Your electricity bill is due in 3 days',
		group: 'action',
		category: 'finance',
		priority: 'normal',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 3,
		curated: true,
		timestamp: 'Nov 1',
		timeGroup: 'Earlier',
		gist: '$84.20 due November 5th — autopay is off, you opened this 3 days ago but haven’t paid yet.',
		summary: ['Amount due: $84.20.', 'Due date: November 5th.', 'Autopay is currently disabled on this account.'],
		sender: 'City Power & Light',
		senderInitials: 'CP',
		avatar: avatars.amber,
		tags: ['Bill'],
		messages: [
			{
				id: 'm1',
				sender: 'City Power & Light',
				senderInitials: 'CP',
				avatar: avatars.amber,
				time: 'Nov 1, 09:00',
				body: ['Your balance of $84.20 is due November 5th.', 'Autopay is off — please pay manually to avoid a late fee.']
			}
		]
	},
	{
		id: 'lead-1on1',
		subject: '1:1 notes and action items',
		group: 'action',
		category: 'work',
		priority: 'normal',
		unread: false,
		done: false,
		archived: false,
		daysAgo: 4,
		curated: true,
		timestamp: 'Oct 31',
		timeGroup: 'Earlier',
		gist: 'Notes from your 1:1 — three follow-ups still open, including scoping the inbox redesign spike.',
		summary: [
			'Follow-up 1: scope the inbox redesign spike by Friday.',
			'Follow-up 2: share updated roadmap slide with design.',
			'Follow-up 3: schedule user interviews for next sprint.'
		],
		sender: 'Nina (Manager)',
		senderInitials: 'NM',
		avatar: avatars.indigo,
		tags: ['1:1'],
		messages: [
			{
				id: 'm1',
				sender: 'Nina (Manager)',
				senderInitials: 'NM',
				avatar: avatars.indigo,
				time: 'Oct 31, 17:15',
				body: [
					'Good chat today — recapping the three things we agreed on:',
					'1) Scope the inbox redesign spike by Friday. 2) Share the updated roadmap slide with design. 3) Schedule user interviews for next sprint.'
				]
			}
		]
	},
	{
		id: 'wedding-rsvp',
		subject: 'RSVP reminder — deadline this weekend',
		group: 'action',
		category: 'personal',
		priority: 'high',
		unread: true,
		done: false,
		archived: false,
		daysAgo: 2,
		curated: true,
		timestamp: 'Nov 2',
		timeGroup: 'Earlier',
		gist: 'The venue needs a final headcount by Sunday — your RSVP is still pending.',
		summary: [
			'RSVP deadline is this Sunday at midnight.',
			'Final headcount is needed for catering.',
			'You can update meal preference in the same form.'
		],
		sender: 'Maya & Tom',
		senderInitials: 'MT',
		avatar: avatars.teal,
		tags: ['Wedding'],
		messages: [
			{
				id: 'm1',
				sender: 'Maya & Tom',
				senderInitials: 'MT',
				avatar: avatars.teal,
				time: 'Nov 2, 12:00',
				highlighted: true,
				body: [
					'Quick reminder that RSVPs are due this Sunday at midnight!',
					'The venue needs our final headcount for catering. If you haven’t already, please confirm and pick a meal preference.'
				]
			}
		]
	}
];
