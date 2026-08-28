<script lang="ts">
	import { inbox } from '$lib/state/inbox.svelte';
	import { categoryList } from '$lib/data/categories';
	import GridHeroCard from '$lib/components/grid/GridHeroCard.svelte';
	import GridTile from '$lib/components/grid/GridTile.svelte';
	import ConceptSwitcher from '$lib/components/shared/ConceptSwitcher.svelte';
	import { goto } from '$app/navigation';

	let activeFilter = $state<'all' | (typeof categoryList)[number]['key']>('all');
	let unreadOnly = $state(false);

	const priorityScore: Record<string, number> = { urgent: 3, high: 2, normal: 1, low: 0 };

	const live = $derived(inbox.threads.filter((t) => !t.archived));
	const totalCount = $derived(live.length);
	const unreadCount = $derived(live.filter((t) => t.unread).length);
	const actionCount = $derived(live.filter((t) => t.group === 'action' && !t.done).length);

	// The board shows the AI-curated shortlist; the other ~1,400 mails stay
	// reachable through search rather than crowding the grid.
	const curated = $derived(live.filter((t) => t.curated));

	const hero = $derived(
		[...curated].sort(
			(a, b) => priorityScore[b.priority] - priorityScore[a.priority] || (b.unread ? 1 : 0) - (a.unread ? 1 : 0)
		)[0]
	);

	const rest = $derived(
		curated
			.filter((t) => t.id !== hero.id)
			.filter((t) => activeFilter === 'all' || t.category === activeFilter)
			.filter((t) => !unreadOnly || t.unread)
			.sort(
				(a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0) || priorityScore[b.priority] - priorityScore[a.priority]
			)
	);
</script>

<svelte:head>
	<title>Prism — Grid</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-neutral-50">
	<header class="safe-top flex items-center justify-between px-5 pt-5 pb-2">
		<span class="font-sans text-lg font-extrabold tracking-tighter text-ink uppercase">Prism<span class="text-lime-500">.</span></span>
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => goto('/search?from=grid')}
				aria-label="AI search"
				class="tap-scale flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink text-ink"
			>
				<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2" />
					<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
			</button>
			<ConceptSwitcher
				current="grid"
				triggerClass="tap-scale flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-[11px] font-bold text-ink uppercase"
			/>
		</div>
	</header>

	<div class="px-5 pb-3">
		<p class="text-[13px] font-medium text-neutral-500">
			<span class="font-bold text-ink">{totalCount.toLocaleString()} mails</span> ·
			<span class="font-bold text-ink">{unreadCount} unread</span> · {actionCount} need action — AI
			boards the ones that matter.
		</p>
	</div>

	<div class="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
		<button
			type="button"
			onclick={() => (unreadOnly = !unreadOnly)}
			class="tap-scale shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase {unreadOnly
				? 'bg-lime-300 text-ink ring-2 ring-ink'
				: 'bg-white text-neutral-500 ring-1 ring-neutral-200'}"
		>
			● Unread
		</button>
		<button
			type="button"
			onclick={() => (activeFilter = 'all')}
			class="tap-scale shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase {activeFilter === 'all'
				? 'bg-ink text-white'
				: 'bg-white text-neutral-500 ring-1 ring-neutral-200'}"
		>
			All
		</button>
		{#each categoryList as c (c.key)}
			<button
				type="button"
				onclick={() => (activeFilter = c.key)}
				class="tap-scale shrink-0 rounded-full px-3.5 py-2 text-xs font-bold uppercase {activeFilter === c.key
					? 'bg-ink text-white'
					: 'bg-white text-neutral-500 ring-1 ring-neutral-200'}"
			>
				{c.label}
			</button>
		{/each}
	</div>

	<div class="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
		{#if activeFilter === 'all' && !unreadOnly}
			<div class="mb-4">
				<GridHeroCard thread={hero} />
			</div>
		{/if}

		<div class="grid grid-cols-2 gap-3">
			{#each rest as thread, i (thread.id)}
				<GridTile {thread} wide={i % 5 === 2} />
			{/each}
		</div>

		{#if rest.length === 0}
			<div class="flex flex-col items-center gap-2 py-16 text-center">
				<p class="text-sm font-medium text-neutral-400">Nothing here — you're caught up.</p>
			</div>
		{/if}

		<button
			type="button"
			onclick={() => goto('/search?from=grid')}
			class="tap-scale mt-4 w-full rounded-2xl border-2 border-dashed border-neutral-300 py-3.5 text-center text-[12px] font-bold text-neutral-500 uppercase"
		>
			{(totalCount - curated.length).toLocaleString()} more in the archive — ask Prism to find one
		</button>
	</div>
</div>
