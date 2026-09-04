import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ensureSchema, getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ user: null });
	}

	try {
		await ensureSchema();
		const db = getDb();
		const [row] = await db.select().from(users).where(eq(users.id, locals.user.id)).limit(1);
		return json({
			user: {
				id: locals.user.id,
				email: locals.user.email,
				name: row?.name ?? null,
				picture: row?.picture ?? null
			}
		});
	} catch {
		return json({
			user: {
				id: locals.user.id,
				email: locals.user.email,
				name: null,
				picture: null
			}
		});
	}
};
