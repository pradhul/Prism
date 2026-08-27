<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';

	let mounted = $state(false);
	let leaving = $state(false);

	function proceed() {
		if (leaving) return;
		leaving = true;
		setTimeout(() => goto('/start'), 260);
	}

	onMount(() => {
		mounted = true;
		const t = setTimeout(proceed, 2000);
		return () => clearTimeout(t);
	});
</script>

<svelte:head>
	<title>Prism — Inbox, reimagined</title>
</svelte:head>

<div
	role="button"
	tabindex="0"
	onclick={proceed}
	onkeydown={(e) => e.key === 'Enter' && proceed()}
	class="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-paper transition-opacity duration-300"
	class:opacity-0={leaving}
>
	<div
		class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
	></div>

	<div
		class="relative flex flex-col items-center gap-5 transition-all duration-700 ease-out"
		class:opacity-0={!mounted}
		class:translate-y-2={!mounted}
	>
		<div class="rounded-3xl bg-white p-5 shadow-glass-lg ring-1 ring-black/5">
			<PrismMark size={44} />
		</div>
		<div class="flex flex-col items-center gap-1.5">
			<h1 class="font-serif text-3xl font-medium tracking-tight text-ink">Prism</h1>
			<p class="text-sm text-neutral-500">Inbox, reimagined.</p>
		</div>
	</div>

	<div
		class="absolute bottom-12 flex flex-col items-center gap-2 transition-opacity delay-300 duration-700"
		class:opacity-0={!mounted}
	>
		<div class="h-1 w-24 overflow-hidden rounded-full bg-neutral-200/70">
			<div class="h-full w-full origin-left animate-[loadbar_1.8s_ease-in-out_forwards] rounded-full bg-ink"></div>
		</div>
		<p class="text-[11px] tracking-wide text-neutral-400 uppercase">Tap to skip</p>
	</div>
</div>

<style>
	@keyframes loadbar {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
