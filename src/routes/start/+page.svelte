<script lang="ts">
	import { goto } from '$app/navigation';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';
	import { concepts } from '$lib/data/concepts';
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
			{#each concepts as concept, i (concept.id)}
				<div
					class="absolute inset-x-6 top-2 h-32 rounded-[26px] bg-gradient-to-br shadow-glass ring-1 ring-black/5 {concept.swatch}"
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
				Prism reads every thread so you don't have to — then shows it to you in whichever shape
				makes sense for your brain. No folders required.
			</p>
		</div>
	</div>

	<div class="flex flex-col gap-3 pb-8">
		<button
			type="button"
			onclick={() => goto('/choose')}
			class="tap-scale flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-[15px] font-semibold text-white shadow-glass-lg"
		>
			Get started
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
		<p class="text-center text-xs text-neutral-400">Three layouts. One inbox. Pick what fits you.</p>
	</div>
</div>
