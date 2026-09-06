import type { Handle } from '@sveltejs/kit';
import { getSessionFromCookies } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	const session = getSessionFromCookies(event.cookies);
	event.locals.user = session
		? { id: session.userId, email: session.email }
		: null;
	return resolve(event);
};
