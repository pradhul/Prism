import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { syncGmailForUser } from '$lib/server/gmail/sync';

export const config = {
	maxDuration: 60
};

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Sign in with Gmail first');

	try {
		const result = await syncGmailForUser(locals.user.id, { maxResults: 40 });
		return json(result);
	} catch (err) {
		console.error('Sync failed', err);
		error(500, err instanceof Error ? err.message : 'Sync failed');
	}
};
