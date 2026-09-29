import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncGmailForUser } from '$lib/server/gmail/sync';
import { dropGmailGrant } from '$lib/server/gmail/client';
import { isReauthRequired } from '$lib/server/auth/google';
import { reauthCopy, reconnectGmailUrl } from '$lib/reconnect';

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
			const reason = err.reason.startsWith('insufficient_scope')
				? 'insufficient_scope'
				: err.reason === 'no_grant'
					? 'no_grant'
					: 'revoked';
			// a dead grant is forgotten so the UI stops retrying it; a grant that merely
			// lacks the mail scope is a valid sign-in and stays until the user re-consents
			if (reason === 'revoked') await dropGmailGrant(locals.user.id).catch(() => {});
			console.warn('Gmail reauth required', locals.user.id, err.reason);
			return json(
				{
					code: 'reauth_required',
					reason,
					message: reauthCopy(reason).message,
					reconnectUrl: reconnectGmailUrl('/stream')
				},
				{ status: 401 }
			);
		}
		console.error('Sync failed', err);
		error(500, err instanceof Error ? err.message : 'Sync failed');
	}
};
