<script lang="ts">
	import { inbox } from '$lib/state/inbox.svelte';
	import ArcRow from '$lib/components/arc/ArcRow.svelte';
	import ConceptSwitcher from '$lib/components/shared/ConceptSwitcher.svelte';
	import { goto } from '$app/navigation';

	const priorityScore: Record<string, number> = { urgent: 3, high: 2, normal: 1, low: 0 };

	// The Brief is deliberately curated: AI picks the conversations worth
	// reading like a paper. The long tail lives behind search.
	const curated = $derived(inbox.threads.filter((t) => t.curated && !t.archived));

	const ordered = $derived(
		[...curated].sort(
			(a, b) => priorityScore[b.priority] - priorityScore[a.priority] || (b.unread ? 1 : 0) - (a.unread ? 1 : 0)
		)
	);

	const hero = $derived(ordered[0]);
	const paired = $derived(ordered.slice(1, 3));
	const rest = $derived.by(() => {
		const skip = new Set([hero.id, ...paired.map((t) => t.id)]);
		return curated.filter((t) => !skip.has(t.id));
	});
</script>

<svelte:head>
	<title>Prism — The Brief</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-[#fbf9f4] font-editorial">
	<header class="safe-top flex items-center justify-between px-5 pt-5 pb-4">
		<button
			type="button"
			onclick={() => goto('/search?from=arc')}
			aria-label="AI search"
			class="tap-scale flex h-9 w-9 items-center justify-center rounded-md border border-ink/70 text-ink"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
				<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
				<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
			</svg>
		</button>
		<h1 class="font-serif text-[15px] font-semibold tracking-[0.18em] text-ink uppercase">The Prism Brief</h1>
		<ConceptSwitcher
			current="arc"
			triggerClass="tap-scale grid h-9 w-9 grid-cols-3 grid-rows-3 gap-[1.5px] rounded-md border border-ink/70 p-1.5"
		>
			{#each Array(9) as _, i (i)}
				<span class={[0, 2, 4, 6, 8].includes(i) ? 'bg-ink' : 'bg-transparent'}></span>
			{/each}
		</ConceptSwitcher>
	</header>

	<div class="h-px w-full bg-ink/10"></div>

	<div class="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
		<p class="pt-4 text-center text-[10.5px] tracking-[0.14em] text-neutral-400 uppercase">
			Today's edition · AI-curated from {inbox.threads.filter((t) => !t.archived).length.toLocaleString()} mails
		</p>

		<div class="pt-4 pb-6">
			<ArcRow thread={hero} variant="hero" />
		</div>

		<div class="grid grid-cols-2 gap-5 border-t border-ink/10 pt-5 pb-6">
			{#each paired as thread (thread.id)}
				<ArcRow {thread} variant="compact" />
			{/each}
		</div>

		{#each rest as thread (thread.id)}
			<div class="border-t border-ink/10 py-5">
				<ArcRow {thread} variant={thread.group === 'orders' || thread.group === 'other' ? 'minimal' : 'feature'} />
			</div>
		{/each}

		<div class="border-t border-ink/10 py-6 text-center">
			<p class="text-[12px] text-neutral-400">That's today's brief.</p>
			<button
				type="button"
				onclick={() => goto('/search?from=arc')}
				class="tap-scale mt-2 rounded-full border border-ink/20 px-4 py-2 text-[12px] font-medium text-ink"
			>
				Looking for something older? Ask Prism
			</button>
		</div>
	</div>

	<button
		type="button"
		aria-label="Compose"
		class="tap-scale safe-bottom fixed right-5 bottom-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-glass-lg"
	>
		<span class="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-2xl bg-ink/25"></span>
		<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none">
			<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>
</div>
