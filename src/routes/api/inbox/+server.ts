import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { desc, eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '$lib/server/db';
import { threads } from '$lib/server/db/schema';
import { toClientThread } from '$lib/server/gmail/categorize';
import type { Group, CategoryKey, Priority } from '$lib/types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Sign in with Gmail first');

	await ensureSchema();
	const db = getDb();
	const rows = await db
		.select()
		.from(threads)
		.where(eq(threads.userId, locals.user.id))
		.orderBy(desc(threads.internalDate));

	return json({
		source: 'gmail',
		threads: rows.map((r) =>
			toClientThread({
				...r,
				group: r.group as Group,
				category: r.category as CategoryKey,
				priority: r.priority as Priority
			})
		)
	});
};
