export type Intent = 'action' | 'reading' | 'receipt';

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
	intent: Intent;
	category: CategoryKey;
	priority: Priority;
	unread: boolean;
	timestamp: string;
	timeGroup: string;
	gist: string;
	summary: string[];
	sender: string;
	senderInitials: string;
	avatar: string;
	tags: string[];
	messages: EmailMessage[];
}
