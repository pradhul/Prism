import type { Thread } from './types';

export interface ReplyInfo {
	/** false for automated / suspicious senders */
	canReply: boolean;
	/** distinct people in the thread other than the user */
	participants: string[];
	/** more than one participant → offer Reply all */
	canReplyAll: boolean;
	/** why replying is off, for the UI hint */
	reason?: string;
}

const AUTOMATED_NAME = /\b(no-?reply|do-?not-?reply|alerts?|notifications?|newsletter|digest|team|support|updates?|daily|weekly)\b/i;
const AUTOMATED_BODY = /no reply is needed|do not reply|this is an automated/i;
const SELF = /^(you|me)$/i;

export function replyInfo(thread: Thread): ReplyInfo {
	if (thread.risk) {
		return { canReply: false, participants: [], canReplyAll: false, reason: 'Flagged suspicious — replying is disabled' };
	}
	const automated =
		thread.noReply === true ||
		(!thread.curated && AUTOMATED_NAME.test(thread.sender)) ||
		thread.messages.some((m) => m.body.some((p) => AUTOMATED_BODY.test(p)));
	if (automated) {
		return { canReply: false, participants: [], canReplyAll: false, reason: 'Sent from a no-reply address' };
	}
	const seen = new Set<string>();
	const participants: string[] = [];
	for (const m of thread.messages) {
		const name = m.sender.trim();
		if (!name || SELF.test(name) || seen.has(name.toLowerCase())) continue;
		seen.add(name.toLowerCase());
		participants.push(name);
	}
	if (participants.length === 0) participants.push(thread.sender);
	return { canReply: true, participants, canReplyAll: participants.length > 1 };
}
