import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncGmailForUser } from '$lib/server/gmail/sync';
import { dropGmailGrant } from '$lib/server/gmail/client';
import { isReauthRequired } from '$lib/server/auth/google';
import { reconnectGmailUrl } from '$lib/reconnect';

export const config = {
	maxDuration: 60
};

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Sign in with Gmail first');

	try {
		const result = await syncGmailForUser(locals.user.id, { maxResults: 40 });
		return json(result);
	} catch (err) {
		if (isReauthRequired(err)) {
			// the grant is dead; forget it so the UI stops retrying and offers a reconnect
			await dropGmailGrant(locals.user.id).catch(() => {});
			console.warn('Gmail reauth required', locals.user.id, err.reason);
			return json(
				{
					code: 'reauth_required',
					message: 'Gmail access expired or was revoked. Reconnect to keep syncing.',
					reconnectUrl: reconnectGmailUrl('/stream')
				},
				{ status: 401 }
			);
		}
		console.error('Sync failed', err);
		error(500, err instanceof Error ? err.message : 'Sync failed');
	}
};
