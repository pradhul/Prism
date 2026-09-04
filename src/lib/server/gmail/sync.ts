import { ensureSchema, getDb } from '$lib/server/db';
import { threads } from '$lib/server/db/schema';
import {
	extractPlainText,
	getHeader,
	getMessage,
	getValidAccessToken,
	listRecentMessageIds
} from './client';
import {
	avatarFor,
	formatTimestamp,
	heuristicCategorize,
	initialsFromName,
	parseFromHeader
} from './categorize';
import type { EmailMessage } from '$lib/types';
import { enhanceCategorization } from './ai';

export async function syncGmailForUser(
	userId: string,
	opts: { maxResults?: number } = {}
): Promise<{ synced: number }> {
	await ensureSchema();
	const accessToken = await getValidAccessToken(userId);
	const listed = await listRecentMessageIds(accessToken, {
		maxResults: opts.maxResults ?? 50,
		query: 'newer_than:30d'
	});

	// Dedupe by thread — keep the newest message id per thread (list is newest-first).
	const byThread = new Map<string, string>();
	for (const m of listed) {
		if (!byThread.has(m.threadId)) byThread.set(m.threadId, m.id);
	}

	const db = getDb();
	let synced = 0;

	for (const [gmailThreadId, messageId] of byThread) {
		const msg = await getMessage(accessToken, messageId);
		const subject = getHeader(msg, 'Subject') || '(no subject)';
		const fromRaw = getHeader(msg, 'From');
		const { name: sender, email: senderEmail } = parseFromHeader(fromRaw);
		const listUnsubscribe = Boolean(getHeader(msg, 'List-Unsubscribe'));
		const bodyText = extractPlainText(msg);
		const snippet = (msg.snippet || bodyText.slice(0, 200)).trim();
		const internalMs = Number(msg.internalDate || Date.now());
		const internalDate = new Date(internalMs);
		const { timestamp, timeGroup, daysAgo } = formatTimestamp(internalDate);
		const unread = (msg.labelIds ?? []).includes('UNREAD');

		let categorized = heuristicCategorize({
			subject,
			snippet,
			sender,
			senderEmail,
			listUnsubscribe
		});

		try {
			categorized = await enhanceCategorization({
				subject,
				snippet,
				sender,
				body: bodyText.slice(0, 1500),
				fallback: categorized
			});
		} catch {
			// Keep heuristic result.
		}

		const message: EmailMessage = {
			id: msg.id,
			sender,
			senderInitials: initialsFromName(sender),
			avatar: avatarFor(senderEmail || sender),
			time: timestamp,
			body: bodyText
				.split(/\n+/)
				.map((l) => l.trim())
				.filter(Boolean)
				.slice(0, 12),
			highlighted: true
		};

		const rowId = `${userId.replace(/[^a-zA-Z0-9]+/g, '_')}_${gmailThreadId}`;

		await db
			.insert(threads)
			.values({
				id: rowId,
				userId,
				gmailThreadId,
				gmailMessageId: msg.id,
				subject,
				snippet,
				sender,
				senderEmail: senderEmail || null,
				senderInitials: initialsFromName(sender),
				avatar: avatarFor(senderEmail || sender),
				group: categorized.group,
				category: categorized.category,
				priority: categorized.priority,
				unread,
				done: false,
				archived: false,
				daysAgo,
				timestamp,
				timeGroup,
				gist: categorized.gist,
				summary: categorized.summary,
				tags: categorized.tags,
				messages: [message],
				merchant: categorized.merchant ?? null,
				readMin: categorized.readMin ?? null,
				internalDate,
				syncedAt: new Date()
			})
			.onConflictDoUpdate({
				target: [threads.userId, threads.gmailThreadId],
				set: {
					gmailMessageId: msg.id,
					subject,
					snippet,
					sender,
					senderEmail: senderEmail || null,
					senderInitials: initialsFromName(sender),
					avatar: avatarFor(senderEmail || sender),
					group: categorized.group,
					category: categorized.category,
					priority: categorized.priority,
					unread,
					daysAgo,
					timestamp,
					timeGroup,
					gist: categorized.gist,
					summary: categorized.summary,
					tags: categorized.tags,
					messages: [message],
					merchant: categorized.merchant ?? null,
					readMin: categorized.readMin ?? null,
					internalDate,
					syncedAt: new Date()
					// Preserve done/archived from prior syncs by not overwriting them.
				}
			});

		synced += 1;
	}

	return { synced };
}
