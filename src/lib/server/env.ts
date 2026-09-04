import { env } from '$env/dynamic/private';

export function requireEnv(name: string): string {
	const value = env[name];
	if (!value) throw new Error(`Missing environment variable: ${name}`);
	return value;
}

export function getAppUrl(): string {
	return env.APP_URL?.replace(/\/$/, '') || 'http://localhost:5173';
}

export function getDatabaseUrl(): string | undefined {
	return (
		env.DATABASE_URL ||
		env.POSTGRES_URL ||
		env.POSTGRES_PRISMA_URL ||
		env.NEON_DATABASE_URL ||
		undefined
	);
}
