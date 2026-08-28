/**
 * Smart groups. Unlike folders, each group implies a different interaction:
 * - action:  read or unread, still waiting on the user (mark done to dismiss)
 * - orders:  transactional mail grouped by merchant (clear a merchant in one tap)
 * - catchup: newsletters & FYI — nothing expected from the user (mark all read)
 * - other:   everything else, mostly already-read low-signal mail
 */
export type Group = 'action' | 'orders' | 'catchup' | 'other';

export type CategoryKey = 'work' | 'personal' | 'urgent' | 'finance' | 'updates';

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export interface CategoryMeta {
	key: CategoryKey;
	label: string;
	accent: string;
	tint: string;
}

export interface EmailMessage {
	id: string;
	sender: string;
	senderInitials: string;
	avatar: string;
	time: string;
	body: string[];
	highlighted?: boolean;
	attachment?: { name: string; size: string };
}

export interface Thread {
	id: string;
	subject: string;
	group: Group;
	category: CategoryKey;
	priority: Priority;
	unread: boolean;
	/** action mail: the user marked it handled */
	done: boolean;
	/** orders: dismissed via "clear all" for a merchant */
	archived: boolean;
	/** how many days ago the last message arrived (0 = today) */
	daysAgo: number;
	timestamp: string;
	timeGroup: string;
	gist: string;
	summary: string[];
	sender: string;
	senderInitials: string;
	avatar: string;
	tags: string[];
	messages: EmailMessage[];
	/** orders: which store/service it belongs to */
	merchant?: string;
	/** catchup: estimated reading time in minutes */
	readMin?: number;
	/** hand-authored demo threads (surfaced in Grid hero / Arc brief) */
	curated?: boolean;
}
