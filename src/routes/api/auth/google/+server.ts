import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import type { RequestHandler } from './$types';
import { googleAuthUrl } from '$lib/server/auth/google';
import { getAppUrl } from '$lib/server/env';

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
	const state = randomBytes(16).toString('hex');
	const secure = getAppUrl().startsWith('https://');

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: 600
	});

	const next = url.searchParams.get('next') || '/stream';
	cookies.set('oauth_next', next, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: 600
	});

	// reconnecting a signed-in user: preselect their account so it's one tap
	const loginHint = url.searchParams.get('reconnect') === '1' ? locals.user?.email : undefined;

	throw redirect(302, googleAuthUrl(state, loginHint));
};
