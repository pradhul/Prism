import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { getDatabaseUrl } from '$lib/server/env';
import * as schema from './schema';

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | undefined;
let _sql: NeonQueryFunction<false, false> | undefined;
let schemaReady: Promise<void> | undefined;

export function getSql(): NeonQueryFunction<false, false> {
	if (_sql) return _sql;
	const url = getDatabaseUrl();
	if (!url) throw new Error('DATABASE_URL (or POSTGRES_URL) is not configured');
	_sql = neon(url);
	return _sql;
}

export function getDb(): Db {
	if (_db) return _db;
	_db = drizzle(getSql(), { schema });
	return _db;
}

/** Creates tables on first use so deploys work without a separate migrate step. */
export async function ensureSchema() {
	if (!schemaReady) {
		schemaReady = (async () => {
			const sql = getSql();
			await sql`
				CREATE TABLE IF NOT EXISTS users (
					id TEXT PRIMARY KEY,
					email VARCHAR(320) NOT NULL UNIQUE,
					name TEXT,
					picture TEXT,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)
			`;
			await sql`
				CREATE TABLE IF NOT EXISTS oauth_tokens (
					user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
					access_token TEXT NOT NULL,
					refresh_token TEXT NOT NULL,
					expires_at TIMESTAMPTZ NOT NULL,
					scope TEXT,
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)
			`;
			await sql`
				CREATE TABLE IF NOT EXISTS threads (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
					gmail_thread_id TEXT NOT NULL,
					gmail_message_id TEXT NOT NULL,
					subject TEXT NOT NULL DEFAULT '(no subject)',
					snippet TEXT NOT NULL DEFAULT '',
					sender TEXT NOT NULL DEFAULT 'Unknown',
					sender_email TEXT,
					sender_initials VARCHAR(4) NOT NULL DEFAULT '?',
					avatar TEXT NOT NULL DEFAULT 'bg-slate-100 text-slate-700',
					"group" TEXT NOT NULL DEFAULT 'other',
					category TEXT NOT NULL DEFAULT 'updates',
					priority TEXT NOT NULL DEFAULT 'normal',
					unread BOOLEAN NOT NULL DEFAULT TRUE,
					done BOOLEAN NOT NULL DEFAULT FALSE,
					archived BOOLEAN NOT NULL DEFAULT FALSE,
					days_ago INTEGER NOT NULL DEFAULT 0,
					timestamp TEXT NOT NULL DEFAULT '',
					time_group TEXT NOT NULL DEFAULT 'Earlier',
					gist TEXT NOT NULL DEFAULT '',
					summary JSONB NOT NULL DEFAULT '[]'::jsonb,
					tags JSONB NOT NULL DEFAULT '[]'::jsonb,
					messages JSONB NOT NULL DEFAULT '[]'::jsonb,
					merchant TEXT,
					read_min INTEGER,
					internal_date TIMESTAMPTZ,
					synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					UNIQUE (user_id, gmail_thread_id)
				)
			`;
			await sql`CREATE INDEX IF NOT EXISTS threads_user_group_idx ON threads (user_id, "group")`;
		})();
	}
	await schemaReady;
}
