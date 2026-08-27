<script lang="ts">
	import { threads } from '$lib/data/emails';
	import { intentMeta, intentOrder } from '$lib/data/intents';
	import StreamBubble from '$lib/components/stream/StreamBubble.svelte';
	import ConceptSwitcher from '$lib/components/shared/ConceptSwitcher.svelte';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';

	const groups = intentOrder.map((intent) => ({
		intent,
		meta: intentMeta[intent],
		items: threads.filter((t) => t.intent === intent)
	}));

	let activeIntent = $state<string>('action');

	function scrollTo(intent: string) {
		activeIntent = intent;
		document.getElementById(`sec-${intent}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>Prism — Stream</title>
</svelte:head>

<div class="relative flex h-dvh w-full flex-col bg-paper">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-100/70 via-paper to-paper"></div>

	<header class="safe-top relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
		<div class="flex items-center gap-2">
			<PrismMark size={22} />
			<span class="font-serif text-base font-medium text-ink">Prism</span>
		</div>
		<ConceptSwitcher current="stream" />
	</header>

	<div class="relative z-10 px-5 pb-1">
		<h1 class="font-serif text-2xl font-medium tracking-tight text-ink">Good morning</h1>
		<p class="mt-0.5 text-sm text-neutral-500">Here's your day, grouped by what it actually needs from you.</p>
	</div>

	<div class="no-scrollbar relative z-10 mt-3 flex gap-2 overflow-x-auto px-5 pb-3">
		{#each groups as g (g.intent)}
			<button
				type="button"
				onclick={() => scrollTo(g.intent)}
				class="tap-scale flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium ring-1 transition-colors {activeIntent ===
				g.intent
					? 'bg-ink text-white ring-ink'
					: 'glass text-ink ring-black/[0.06]'}"
			>
				{g.meta.label}
				<span
					class="rounded-full px-1.5 py-0.5 text-[10px] {activeIntent === g.intent
						? 'bg-white/20'
						: 'bg-black/[0.06]'}">{g.items.length}</span
				>
			</button>
		{/each}
	</div>

	<div class="no-scrollbar relative flex-1 overflow-y-auto px-5 pb-28">
		<div class="pointer-events-none absolute top-0 bottom-8 left-[26px] w-px bg-gradient-to-b from-violet-200 via-neutral-200 to-transparent"></div>

		{#each groups as g (g.intent)}
			{#if g.items.length}
				<div id={`sec-${g.intent}`} class="relative pt-6 pb-1 first:pt-2">
					<div class="mb-3 flex items-center gap-2 pl-[3px]">
						<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
							<span class="h-2 w-2 rounded-full {g.meta.color.replace('text-', 'bg-')}"></span>
						</span>
						<h2 class="text-sm font-semibold text-ink">{g.meta.label}</h2>
						<span class="text-xs text-neutral-400">· {g.meta.hint}</span>
					</div>

					<div class="flex flex-col gap-3 pl-8">
						{#each g.items as thread (thread.id)}
							<StreamBubble {thread} />
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
