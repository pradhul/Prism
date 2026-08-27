export interface Concept {
	id: 'stream' | 'grid' | 'arc';
	name: string;
	title: string;
	tagline: string;
	description: string;
	route: string;
	badge: string;
	swatch: string;
}

export const concepts: Concept[] = [
	{
		id: 'stream',
		name: 'The Contextual Stream',
		title: 'Timeline & Bubbles',
		tagline: 'Your day, grouped by intent.',
		description:
			'Folders and lists disappear. Mail flows as a timeline grouped by Action Required, Reading and Receipts — each conversation an expandable bubble with an AI gist.',
		route: '/stream',
		badge: 'Fluid · Glass',
		swatch: 'from-violet-400 via-sky-400 to-teal-300'
	},
	{
		id: 'grid',
		name: 'The Priority Grid',
		title: 'Card-Based Navigation',
		tagline: 'Your inbox as a news feed.',
		description:
			'A dashboard of cards. One bold hero card surfaces what AI thinks matters most; smaller tiles hold everything else. Scan it like a headline feed, not a queue.',
		route: '/grid',
		badge: 'Bold · Monochrome',
		swatch: 'from-neutral-900 via-neutral-700 to-neutral-400'
	},
	{
		id: 'arc',
		name: 'The Focused Arc',
		title: 'Gestural & Minimalist',
		tagline: 'One thing at a time.',
		description:
			'A single, editorial reading canvas. A bottom-anchored Arc lets you swipe between Work, Personal and Urgent one-handed — serif type, wide margins, zero noise.',
		route: '/arc',
		badge: 'Editorial · Serif',
		swatch: 'from-amber-200 via-rose-200 to-neutral-200'
	}
];

export function getConcept(id: string): Concept | undefined {
	return concepts.find((c) => c.id === id);
}
