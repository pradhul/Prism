import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { getAppUrl, requireEnv } from '$lib/server/env';

const COOKIE = 'prism_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
	userId: string;
	email: string;
	exp: number;
}

function sign(payload: string): string {
	return createHmac('sha256', requireEnv('AUTH_SECRET')).update(payload).digest('base64url');
}

function cookieSecure(): boolean {
	return getAppUrl().startsWith('https://');
}

export function createSessionToken(userId: string, email: string): string {
	const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
	const body = Buffer.from(JSON.stringify({ userId, email, exp } satisfies SessionPayload)).toString(
		'base64url'
	);
	return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
	if (!token) return null;
	const [body, sig] = token.split('.');
	if (!body || !sig) return null;
	const expected = sign(body);
	try {
		const a = Buffer.from(sig);
		const b = Buffer.from(expected);
		if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	} catch {
		return null;
	}
	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
		if (!payload?.userId || !payload?.email || !payload?.exp) return null;
		if (payload.exp < Math.floor(Date.now() / 1000)) return null;
		return payload;
	} catch {
		return null;
	}
}

export function setSessionCookie(cookies: Cookies, userId: string, email: string) {
	cookies.set(COOKIE, createSessionToken(userId, email), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: cookieSecure(),
		maxAge: MAX_AGE_SEC
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(COOKIE, { path: '/' });
}

export function getSessionFromCookies(cookies: Cookies): SessionPayload | null {
	return readSessionToken(cookies.get(COOKIE));
}
