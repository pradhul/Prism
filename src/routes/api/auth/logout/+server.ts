import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSessionCookie } from '$lib/server/auth/session';

export const POST: RequestHandler = async ({ cookies }) => {
	clearSessionCookie(cookies);
	return new Response(null, { status: 204 });
};

export const GET: RequestHandler = async ({ cookies }) => {
	clearSessionCookie(cookies);
	throw redirect(302, '/start');
};
