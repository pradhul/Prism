import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { and, eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '$lib/server/db';
import { threads } from '$lib/server/db/schema';

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) error(401, 'Sign in with Gmail first');

	const body = (await request.json()) as {
		unread?: boolean;
		done?: boolean;
		archived?: boolean;
	};

	await ensureSchema();
	const db = getDb();

	const patch: Partial<typeof threads.$inferInsert> = {};
	if (typeof body.unread === 'boolean') patch.unread = body.unread;
	if (typeof body.done === 'boolean') {
		patch.done = body.done;
		if (body.done) patch.unread = false;
	}
	if (typeof body.archived === 'boolean') {
		patch.archived = body.archived;
		if (body.archived) patch.unread = false;
	}

	if (Object.keys(patch).length === 0) error(400, 'No changes');

	const updated = await db
		.update(threads)
		.set(patch)
		.where(and(eq(threads.id, params.id), eq(threads.userId, locals.user.id)))
		.returning({ id: threads.id });

	if (updated.length === 0) error(404, 'Thread not found');
	return json({ ok: true });
};
