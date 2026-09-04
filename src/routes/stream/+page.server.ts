import type { PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '$lib/server/db';
import { threads } from '$lib/server/db/schema';
import { toClientThread } from '$lib/server/gmail/categorize';
import type { CategoryKey, Group, Priority, Thread } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { live: false as const, threads: null as Thread[] | null };
	}

	try {
		await ensureSchema();
		const db = getDb();
		const rows = await db
			.select()
			.from(threads)
			.where(eq(threads.userId, locals.user.id))
			.orderBy(desc(threads.internalDate));

		return {
			live: true as const,
			threads: rows.map((r) =>
				toClientThread({
					...r,
					group: r.group as Group,
					category: r.category as CategoryKey,
					priority: r.priority as Priority
				})
			)
		};
	} catch (err) {
		console.error('Failed to load live inbox', err);
		return { live: true as const, threads: [] as Thread[], loadError: true };
	}
};
