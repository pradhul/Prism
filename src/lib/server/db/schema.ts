import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core';
import type { CategoryKey, Group, Priority } from '$lib/types';

export const users = pgTable(
	'users',
	{
		id: text('id').primaryKey(),
		email: varchar('email', { length: 320 }).notNull(),
		name: text('name'),
		picture: text('picture'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [uniqueIndex('users_email_idx').on(t.email)]
);

export const oauthTokens = pgTable('oauth_tokens', {
	userId: text('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	accessToken: text('access_token').notNull(),
	refreshToken: text('refresh_token').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	scope: text('scope'),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const threads = pgTable(
	'threads',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		gmailThreadId: text('gmail_thread_id').notNull(),
		gmailMessageId: text('gmail_message_id').notNull(),
		subject: text('subject').notNull().default('(no subject)'),
		snippet: text('snippet').notNull().default(''),
		sender: text('sender').notNull().default('Unknown'),
		senderEmail: text('sender_email'),
		senderInitials: varchar('sender_initials', { length: 4 }).notNull().default('?'),
		avatar: text('avatar').notNull().default('bg-slate-100 text-slate-700'),
		group: text('group').$type<Group>().notNull().default('other'),
		category: text('category').$type<CategoryKey>().notNull().default('updates'),
		priority: text('priority').$type<Priority>().notNull().default('normal'),
		unread: boolean('unread').notNull().default(true),
		done: boolean('done').notNull().default(false),
		archived: boolean('archived').notNull().default(false),
		daysAgo: integer('days_ago').notNull().default(0),
		timestamp: text('timestamp').notNull().default(''),
		timeGroup: text('time_group').notNull().default('Earlier'),
		gist: text('gist').notNull().default(''),
		summary: jsonb('summary').$type<string[]>().notNull().default([]),
		tags: jsonb('tags').$type<string[]>().notNull().default([]),
		messages: jsonb('messages').$type<unknown[]>().notNull().default([]),
		merchant: text('merchant'),
		readMin: integer('read_min'),
		internalDate: timestamp('internal_date', { withTimezone: true }),
		syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [uniqueIndex('threads_user_gmail_idx').on(t.userId, t.gmailThreadId)]
);

export type DbUser = typeof users.$inferSelect;
export type DbThread = typeof threads.$inferSelect;
