<script lang="ts">
	import { goto } from '$app/navigation';
	import { concepts } from '$lib/data/concepts';
</script>

<svelte:head>
	<title>Prism — Choose your inbox</title>
</svelte:head>

<div class="safe-top safe-bottom flex h-dvh w-full flex-col bg-paper">
	<div class="flex items-center gap-3 px-6 pt-6 pb-2">
		<button
			type="button"
			onclick={() => goto('/start')}
			aria-label="Back"
			class="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-glass ring-1 ring-black/5"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
				<path
					d="M15 5l-7 7 7 7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
		<p class="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">Step 2 of 2</p>
	</div>

	<div class="px-6 pt-2">
		<h1 class="font-serif text-[1.65rem] leading-tight font-medium tracking-tight text-ink">
			Pick how you want to see it
		</h1>
		<p class="mt-1.5 text-sm text-neutral-500">
			Same inbox, three completely different shapes. Switch anytime — this is just where you start.
		</p>
	</div>

	<div class="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
		<div class="flex flex-col gap-4">
			{#each concepts as concept (concept.id)}
				<button
					type="button"
					onclick={() => goto(concept.route)}
					class="tap-scale group flex flex-col overflow-hidden rounded-[28px] bg-white text-left shadow-glass ring-1 ring-black/5"
				>
					<div class="relative h-28 bg-gradient-to-br {concept.swatch}">
						<span
							class="absolute top-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-ink uppercase backdrop-blur"
						>
							{concept.badge}
						</span>
					</div>
					<div class="flex flex-col gap-1.5 p-5">
						<p class="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
							{concept.title}
						</p>
						<h2 class="text-lg font-semibold text-ink">{concept.name}</h2>
						<p class="text-sm text-neutral-500">{concept.description}</p>
						<div class="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
							Preview this view
							<svg viewBox="0 0 24 24" class="h-4 w-4 transition-transform group-active:translate-x-0.5" fill="none">
								<path
									d="M5 12h14m0 0-5-5m5 5-5 5"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</div>
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
