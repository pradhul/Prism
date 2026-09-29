// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: { id: string; email: string } | null;
		}
		// interface PageData {}
		interface PageState {
			/** in-place overlay on the Stream, driven by shallow routing so Back closes it */
			sheet?:
				| { kind: 'thread'; id: string; /** opened from the search sheet, which stays underneath */ under?: 'search' }
				| { kind: 'search' }
				| { kind: 'manage' };
		}
		// interface Platform {}
	}
}

export {};
