<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';

	const cardSwatches = [
		'from-violet-400 via-sky-400 to-teal-300',
		'from-amber-300 via-rose-300 to-violet-300',
		'from-teal-300 via-sky-300 to-indigo-300'
	];

	const error = $derived(page.url.searchParams.get('error'));
	const signedIn = $derived(Boolean(page.data.user));

	const errorMessage = $derived.by(() => {
		switch (error) {
			case 'oauth_state':
				return 'Sign-in was interrupted. Please try again.';
			case 'no_refresh_token':
				return 'Google did not return a refresh token. Revoke Prism access in your Google Account and try again.';
			case 'oauth_failed':
				return 'Could not connect Gmail. Check Google OAuth settings and try again.';
			case 'no_profile':
				return 'Google did not return an email profile.';
			default:
				return error ? 'Something went wrong during sign-in.' : null;
		}
	});
</script>

<svelte:head>
	<title>Prism — Get started</title>
</svelte:head>

<div class="safe-top safe-bottom flex h-dvh w-full flex-col bg-paper px-6">
	<div class="flex items-center gap-2 pt-6">
		<PrismMark size={26} />
		<span class="font-serif text-lg font-medium text-ink">Prism</span>
	</div>

	<div class="flex flex-1 flex-col items-center justify-center gap-8 py-8">
		<div class="relative h-40 w-full max-w-xs">
			{#each cardSwatches as swatch, i (swatch)}
				<div
					class="absolute inset-x-6 top-2 h-32 rounded-[26px] bg-gradient-to-br shadow-glass ring-1 ring-black/5 {swatch}"
					style={`transform: translateY(${i * 10}px) rotate(${(i - 1) * 6}deg) scale(${1 - i * 0.04}); z-index: ${
						10 - i
					}; opacity: ${1 - i * 0.12};`}
				></div>
			{/each}
		</div>

		<div class="flex flex-col items-center gap-3 text-center">
			<h1 class="max-w-xs font-serif text-[2.1rem] leading-[1.1] font-medium tracking-tight text-ink">
				Your inbox has a lot to say.
			</h1>
			<p class="max-w-[19rem] text-[15px] leading-relaxed text-neutral-500">
				Connect Gmail and Prism will read recent mail, group it by what it needs from you, and
				stream it — no folders required.
			</p>
			{#if errorMessage}
				<p class="max-w-[19rem] rounded-2xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">
					{errorMessage}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-3 pb-8">
		{#if signedIn}
			<button
				type="button"
				onclick={() => goto('/stream')}
				class="tap-scale flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-[15px] font-semibold text-white shadow-glass-lg"
			>
				Open Stream
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<path
						d="M5 12h14m0 0-5-5m5 5-5 5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<a href="/api/auth/logout" class="tap-scale text-center text-[13px] font-medium text-neutral-500">
				Sign out ({page.data.user?.email})
			</a>
		{:else}
			<a
				href="/api/auth/google?next=/stream"
				class="tap-scale flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-[15px] font-semibold text-white shadow-glass-lg"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true">
					<path
						fill="currentColor"
						d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.71h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.97-4.3 2.97-7.27Z"
					/>
					<path
						fill="currentColor"
						d="M12 22c2.7 0 4.96-.9 6.61-2.5l-3.24-2.5c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.75-5.57-4.1H3.1v2.58A9.99 9.99 0 0 0 12 22Z"
					/>
					<path
						fill="currentColor"
						d="M6.43 13.86A6 6 0 0 1 6.12 12c0-.65.11-1.28.31-1.86V7.56H3.1A10 10 0 0 0 2 12c0 1.61.39 3.14 1.1 4.44l3.33-2.58Z"
					/>
					<path
						fill="currentColor"
						d="M12 5.98c1.47 0 2.78.5 3.82 1.5l2.86-2.86C16.96 2.99 14.7 2 12 2A9.99 9.99 0 0 0 3.1 7.56l3.33 2.58C7.22 7.73 9.41 5.98 12 5.98Z"
					/>
				</svg>
				Continue with Gmail
			</a>
			<button
				type="button"
				onclick={() => goto('/stream')}
				class="tap-scale rounded-full bg-white py-3.5 text-[14px] font-semibold text-ink ring-1 ring-black/10"
			>
				Try demo inbox
			</button>
			<p class="text-center text-xs text-neutral-400">
				Gmail access is read-only. Demo mode uses mock mail.
			</p>
		{/if}
	</div>
</div>
