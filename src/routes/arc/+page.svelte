<script lang="ts">
	import { threads } from '$lib/data/emails';
	import ArcRow from '$lib/components/arc/ArcRow.svelte';
	import ConceptSwitcher from '$lib/components/shared/ConceptSwitcher.svelte';

	const priorityScore: Record<string, number> = { urgent: 3, high: 2, normal: 1, low: 0 };

	const ordered = [...threads].sort(
		(a, b) => priorityScore[b.priority] - priorityScore[a.priority] || (b.unread ? 1 : 0) - (a.unread ? 1 : 0)
	);

	const hero = ordered[0];
	const paired = ordered.slice(1, 3);
	const restIds = new Set([hero.id, ...paired.map((t) => t.id)]);
	const rest = threads.filter((t) => !restIds.has(t.id));
	const minimalIntents = new Set(['receipt']);
</script>

<svelte:head>
	<title>Prism — The Brief</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-[#fbf9f4] font-editorial">
	<header class="safe-top flex items-center justify-between px-5 pt-5 pb-4">
		<div class="w-9"></div>
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
		<div class="pt-6 pb-6">
			<ArcRow thread={hero} variant="hero" />
		</div>

		<div class="grid grid-cols-2 gap-5 border-t border-ink/10 pt-5 pb-6">
			{#each paired as thread (thread.id)}
				<ArcRow {thread} variant="compact" />
			{/each}
		</div>

		{#each rest as thread (thread.id)}
			<div class="border-t border-ink/10 py-5">
				<ArcRow {thread} variant={minimalIntents.has(thread.intent) ? 'minimal' : 'feature'} />
			</div>
		{/each}
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
