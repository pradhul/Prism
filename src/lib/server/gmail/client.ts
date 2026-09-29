import { eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '$lib/server/db';
import { oauthTokens } from '$lib/server/db/schema';
import { GoogleReauthRequiredError, isReauthRequired, refreshAccessToken } from '$lib/server/auth/google';

/** Whether we still hold a Gmail grant for this user (false after a dead token was dropped). */
export async function hasGmailGrant(userId: string): Promise<boolean> {
	await ensureSchema();
	const db = getDb();
	const [row] = await db
		.select({ userId: oauthTokens.userId })
		.from(oauthTokens)
		.where(eq(oauthTokens.userId, userId))
		.limit(1);
	return Boolean(row);
}

/** Forget a grant Google no longer honours so every later call asks to reconnect instead of retrying it. */
export async function dropGmailGrant(userId: string): Promise<void> {
	await ensureSchema();
	await getDb().delete(oauthTokens).where(eq(oauthTokens.userId, userId));
}

export async function getValidAccessToken(userId: string): Promise<string> {
	await ensureSchema();
	const db = getDb();
	const [row] = await db.select().from(oauthTokens).where(eq(oauthTokens.userId, userId)).limit(1);
	if (!row) throw new GoogleReauthRequiredError('no_grant', 'Gmail is not connected for this account');

	const skewMs = 60_000;
	if (row.expiresAt.getTime() - skewMs > Date.now()) {
		return row.accessToken;
	}

	let refreshed;
	try {
		refreshed = await refreshAccessToken(row.refreshToken);
	} catch (err) {
		if (isReauthRequired(err)) await dropGmailGrant(userId);
		throw err;
	}
	const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
	await db
		.update(oauthTokens)
		.set({
			accessToken: refreshed.access_token,
			expiresAt,
			scope: refreshed.scope ?? row.scope,
			updatedAt: new Date()
		})
		.where(eq(oauthTokens.userId, userId));

	return refreshed.access_token;
}

export interface GmailHeader {
	name: string;
	value: string;
}

export interface GmailMessageMeta {
	id: string;
	threadId: string;
	snippet: string;
	internalDate: string;
	labelIds?: string[];
	payload?: {
		headers?: GmailHeader[];
		mimeType?: string;
		body?: { data?: string; size?: number };
		parts?: Array<{ mimeType?: string; body?: { data?: string }; parts?: unknown[] }>;
	};
}

function header(headers: GmailHeader[] | undefined, name: string): string {
	return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

export function getHeader(msg: GmailMessageMeta, name: string): string {
	return header(msg.payload?.headers, name);
}

export async function listRecentMessageIds(
	accessToken: string,
	opts: { maxResults?: number; query?: string } = {}
): Promise<Array<{ id: string; threadId: string }>> {
	const params = new URLSearchParams({
		maxResults: String(opts.maxResults ?? 60),
		q: opts.query ?? 'newer_than:30d'
	});
	const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) {
		const text = await res.text();
		if (res.status === 401) throw new GoogleReauthRequiredError(`gmail_401: ${text.slice(0, 200)}`);
		throw new Error(`Gmail list failed: ${res.status} ${text}`);
	}
	const data = (await res.json()) as { messages?: Array<{ id: string; threadId: string }> };
	return data.messages ?? [];
}

export async function getMessage(accessToken: string, id: string): Promise<GmailMessageMeta> {
	const params = new URLSearchParams({ format: 'full' });
	const res = await fetch(
		`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?${params}`,
		{ headers: { Authorization: `Bearer ${accessToken}` } }
	);
	if (!res.ok) {
		const text = await res.text();
		if (res.status === 401) throw new GoogleReauthRequiredError(`gmail_401: ${text.slice(0, 200)}`);
		throw new Error(`Gmail get failed: ${res.status} ${text}`);
	}
	return res.json();
}

function decodeBodyData(data?: string): string {
	if (!data) return '';
	try {
		const normalized = data.replace(/-/g, '+').replace(/_/g, '/');
		return Buffer.from(normalized, 'base64').toString('utf8');
	} catch {
		return '';
	}
}

export function extractPlainText(msg: GmailMessageMeta): string {
	const payload = msg.payload;
	if (!payload) return msg.snippet || '';

	const walk = (part: {
		mimeType?: string;
		body?: { data?: string };
		parts?: Array<{ mimeType?: string; body?: { data?: string }; parts?: unknown[] }>;
	}): string => {
		if (part.mimeType === 'text/plain' && part.body?.data) {
			return decodeBodyData(part.body.data);
		}
		if (part.parts) {
			for (const child of part.parts) {
				const text = walk(child as typeof part);
				if (text) return text;
			}
		}
		if (part.mimeType === 'text/html' && part.body?.data) {
			return decodeBodyData(part.body.data)
				.replace(/<style[\s\S]*?<\/style>/gi, ' ')
				.replace(/<script[\s\S]*?<\/script>/gi, ' ')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
		}
		return '';
	};

	const text = walk(payload);
	return (text || msg.snippet || '').slice(0, 4000);
}
