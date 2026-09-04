import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { exchangeCode, fetchGoogleProfile } from '$lib/server/auth/google';
import { setSessionCookie } from '$lib/server/auth/session';
import { ensureSchema, getDb } from '$lib/server/db';
import { oauthTokens, users } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');
	const next = cookies.get('oauth_next') || '/stream';

	cookies.delete('oauth_state', { path: '/' });
	cookies.delete('oauth_next', { path: '/' });

	if (!code || !state || !storedState || state !== storedState) {
		throw redirect(302, '/start?error=oauth_state');
	}

	try {
		const tokens = await exchangeCode(code);
		const profile = await fetchGoogleProfile(tokens.access_token);

		if (!profile.email || !profile.sub) {
			throw redirect(302, '/start?error=no_profile');
		}

		await ensureSchema();
		const db = getDb();
		const userId = `google:${profile.sub}`;
		const now = new Date();

		await db
			.insert(users)
			.values({
				id: userId,
				email: profile.email,
				name: profile.name ?? null,
				picture: profile.picture ?? null,
				createdAt: now,
				updatedAt: now
			})
			.onConflictDoUpdate({
				target: users.id,
				set: {
					email: profile.email,
					name: profile.name ?? null,
					picture: profile.picture ?? null,
					updatedAt: now
				}
			});

		const [existing] = await db
			.select()
			.from(oauthTokens)
			.where(eq(oauthTokens.userId, userId))
			.limit(1);

		const refreshToken = tokens.refresh_token || existing?.refreshToken;
		if (!refreshToken) {
			throw redirect(302, '/start?error=no_refresh_token');
		}

		const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

		await db
			.insert(oauthTokens)
			.values({
				userId,
				accessToken: tokens.access_token,
				refreshToken,
				expiresAt,
				scope: tokens.scope ?? null,
				updatedAt: now
			})
			.onConflictDoUpdate({
				target: oauthTokens.userId,
				set: {
					accessToken: tokens.access_token,
					refreshToken,
					expiresAt,
					scope: tokens.scope ?? null,
					updatedAt: now
				}
			});

		setSessionCookie(cookies, userId, profile.email);

		throw redirect(302, `${next}${next.includes('?') ? '&' : '?'}sync=1`);
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 302) {
			throw err;
		}
		console.error('OAuth callback failed', err);
		throw redirect(302, '/start?error=oauth_failed');
	}
};
