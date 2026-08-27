<script lang="ts">
	import { threads, unreadCount, actionCount } from '$lib/data/emails';
	import { categoryList } from '$lib/data/categories';
	import GridHeroCard from '$lib/components/grid/GridHeroCard.svelte';
	import GridTile from '$lib/components/grid/GridTile.svelte';
	import ConceptSwitcher from '$lib/components/shared/ConceptSwitcher.svelte';

	let activeFilter = $state<'all' | (typeof categoryList)[number]['key']>('all');

	const priorityScore: Record<string, number> = { urgent: 3, high: 2, normal: 1, low: 0 };

	const hero = $derived(
		[...threads].sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority] || (b.unread ? 1 : 0) - (a.unread ? 1 : 0))[0]
	);

	const rest = $derived(
		threads
			.filter((t) => t.id !== hero.id)
			.filter((t) => activeFilter === 'all' || t.category === activeFilter)
			.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority])
	);
</script>

<svelte:head>
	<title>Prism — Grid</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-neutral-50">
	<header class="safe-top flex items-center justify-between px-5 pt-5 pb-2">
		<span class="font-sans text-lg font-extrabold tracking-tighter text-ink uppercase">Prism<span class="text-lime-500">.</span></span>
		<ConceptSwitcher
			current="grid"
			triggerClass="tap-scale flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-[11px] font-bold text-ink uppercase"
		/>
	</header>

	<div class="px-5 pb-3">
		<p class="text-[13px] font-medium text-neutral-500">
			<span class="font-bold text-ink">{unreadCount} unread</span> · {actionCount} need action today
		</p>
	</div>

	<div class="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
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
		{#if activeFilter === 'all'}
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
	</div>
</div>
