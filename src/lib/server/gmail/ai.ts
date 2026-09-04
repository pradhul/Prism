import { generateObject } from 'ai';
import { z } from 'zod';
import type { CategorizedMail } from './categorize';

const resultSchema = z.object({
	group: z.enum(['action', 'orders', 'catchup', 'other']),
	category: z.enum(['work', 'personal', 'urgent', 'finance', 'updates']),
	priority: z.enum(['urgent', 'high', 'normal', 'low']),
	gist: z.string().max(220),
	summary: z.array(z.string().max(200)).max(3),
	tags: z.array(z.string().max(24)).max(3),
	merchant: z.string().max(64).optional(),
	readMin: z.number().int().min(1).max(30).optional()
});

/**
 * Optional AI polish via Vercel AI Gateway. Falls back silently if unavailable.
 */
export async function enhanceCategorization(input: {
	subject: string;
	snippet: string;
	sender: string;
	body: string;
	fallback: CategorizedMail;
}): Promise<CategorizedMail> {
	try {
		const { object } = await generateObject({
			model: 'openai/gpt-4.1-mini',
			schema: resultSchema,
			prompt: `You categorize email for Prism's timeline inbox.

Groups:
- action: still waiting on the user (reply, approve, RSVP, deadline)
- orders: purchases, shipping, receipts, deliveries (set merchant)
- catchup: newsletters / FYI / digests (nothing expected)
- other: routine low-signal notifications

Return a short gist (one sentence) and 1-3 summary bullets.

From: ${input.sender}
Subject: ${input.subject}
Snippet: ${input.snippet}
Body:
${input.body}`
		});

		return {
			group: object.group,
			category: object.category,
			priority: object.priority,
			gist: object.gist || input.fallback.gist,
			summary: object.summary?.length ? object.summary : input.fallback.summary,
			tags: object.tags ?? input.fallback.tags,
			merchant: object.merchant || input.fallback.merchant,
			readMin: object.readMin ?? input.fallback.readMin
		};
	} catch {
		return input.fallback;
	}
}
