import type { Group } from '$lib/types';

export interface GroupMeta {
	label: string;
	hint: string;
	color: string;
	/** what interaction this group offers, shown as a helper line */
	interaction: string;
}

export const groupMeta: Record<Group, GroupMeta> = {
	action: {
		label: 'Needs Action',
		hint: 'Read or unread — still waiting on you · past 2 weeks',
		color: 'text-rose-500',
		interaction: 'Tap ✓ when handled and it disappears'
	},
	orders: {
		label: 'Orders & Deliveries',
		hint: 'Grouped by store — clear a whole store in one tap',
		color: 'text-amber-500',
		interaction: 'Clear all per store'
	},
	catchup: {
		label: 'Catch Up',
		hint: 'Newsletters & FYI — nothing is expected from you',
		color: 'text-violet-500',
		interaction: 'Mark all read'
	},
	other: {
		label: 'Everything Else',
		hint: 'Routine notifications, mostly already read',
		color: 'text-slate-400',
		interaction: ''
	}
};

export const groupOrder: Group[] = ['action', 'orders', 'catchup', 'other'];
