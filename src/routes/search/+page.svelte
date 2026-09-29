<script lang="ts">
	import { goto } from '$app/navigation';
	import SearchPanel from '$lib/components/search/SearchPanel.svelte';
</script>

<svelte:head>
	<title>Prism — AI Search</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-paper">
	<header class="safe-top flex items-center gap-3 px-5 pt-5 pb-3">
		<button
			type="button"
			onclick={() => goto('/stream')}
			aria-label="Back"
			class="tap-scale tap-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-glass ring-1 ring-black/5"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
				<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<div class="rise">
			<h1 class="text-[17px] font-semibold text-ink">Ask your inbox</h1>
			<p class="text-[11.5px] text-neutral-400">Describe it loosely — Prism figures out the rest</p>
		</div>
	</header>

	<SearchPanel autofocus onOpenThread={(id) => goto(`/stream/${encodeURIComponent(id)}`)} />
</div>
