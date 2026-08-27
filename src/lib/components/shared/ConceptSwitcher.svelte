<script lang="ts">
	import { concepts } from '$lib/data/concepts';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		current = undefined,
		triggerClass = 'glass tap-scale flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-ink shadow-glass ring-1 ring-black/5',
		children
	}: {
		current?: 'stream' | 'grid' | 'arc';
		triggerClass?: string;
		children?: Snippet;
	} = $props();

	let open = $state(false);

	function go(route: string) {
		open = false;
		goto(route);
	}
</script>

<button type="button" class={triggerClass} onclick={() => (open = true)} aria-label="Switch inbox experience">
	{#if children}
		{@render children()}
	{:else}
		<svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
			<path
				d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<span>Switch view</span>
	{/if}
</button>

{#if open}
	<div class="fixed inset-0 z-50 flex flex-col justify-end">
		<button
			type="button"
			aria-label="Close"
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			onclick={() => (open = false)}
		></button>

		<div
			class="safe-bottom relative z-10 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-6 shadow-[0_-16px_48px_-8px_rgba(0,0,0,0.25)]"
		>
			<div class="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200"></div>
			<div class="mb-4 flex items-center justify-between">
				<div>
					<p class="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">Prism · Preview</p>
					<h2 class="font-sans text-lg font-semibold text-ink">Choose your inbox</h2>
				</div>
				<button
					type="button"
					class="tap-scale rounded-full bg-neutral-100 p-2 text-neutral-500"
					onclick={() => goto('/choose')}
					aria-label="See all concepts"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
						<path
							d="M9 6l6 6-6 6"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>

			<div class="flex flex-col gap-2.5">
				{#each concepts as concept (concept.id)}
					<button
						type="button"
						class="tap-scale flex items-center gap-3 rounded-2xl border p-3 text-left {current === concept.id
							? 'border-ink/15 bg-ink/[0.03]'
							: 'border-neutral-100 bg-white'}"
						onclick={() => go(concept.route)}
					>
						<span class="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br {concept.swatch}"></span>
						<span class="flex-1">
							<span class="block text-sm font-semibold text-ink">{concept.name}</span>
							<span class="block text-xs text-neutral-500">{concept.tagline}</span>
						</span>
						{#if current === concept.id}
							<span class="rounded-full bg-ink px-2 py-1 text-[10px] font-semibold text-white">Viewing</span>
						{/if}
					</button>
				{/each}
			</div>

			<button
				type="button"
				class="tap-scale mt-3 w-full rounded-2xl py-3 text-center text-sm font-medium text-neutral-400"
				onclick={() => go('/start')}
			>
				Back to start
			</button>
		</div>
	</div>
{/if}
