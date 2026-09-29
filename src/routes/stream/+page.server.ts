import type { PageServerLoad } from './$types';
import { desc, eq } from 'drizzle-orm';
import { ensureSchema, getDb } from '$lib/server/db';
import { threads } from '$lib/server/db/schema';
import { toClientThread } from '$lib/server/gmail/categorize';
import { hasGmailGrant } from '$lib/server/gmail/client';
import type { CategoryKey, Group, Priority, Thread } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { live: false as const, threads: null as Thread[] | null, needsReauth: false };
	}

	try {
		await ensureSchema();
		const db = getDb();
		const [rows, connected] = await Promise.all([
			db
				.select()
				.from(threads)
				.where(eq(threads.userId, locals.user.id))
				.orderBy(desc(threads.internalDate)),
			hasGmailGrant(locals.user.id)
		]);

		return {
			live: true as const,
			// signed in but Google no longer honours our grant (dropped after invalid_grant)
			needsReauth: !connected,
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
		return { live: true as const, threads: [] as Thread[], needsReauth: false, loadError: true };
	}
};
