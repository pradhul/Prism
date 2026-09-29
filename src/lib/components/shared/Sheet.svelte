<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut, expoOut } from 'svelte/easing';

	let {
		title,
		subtitle,
		fullHref,
		onclose,
		onexpand,
		stacked = false,
		actions,
		children
	}: {
		title?: string;
		subtitle?: string;
		/** where "open as a page" goes */
		fullHref?: string;
		onclose: () => void;
		onexpand?: () => void;
		/** another sheet is open on top: recede, stop reacting to input */
		stacked?: boolean;
		/** extra controls rendered next to the close button */
		actions?: Snippet;
		children: Snippet;
	} = $props();

	// drag-to-dismiss on the grab handle / header
	let dragY = $state(0);
	let dragging = $state(false);
	let startY = 0;
	let startT = 0;

	function dragStart(e: PointerEvent) {
		dragging = true;
		startY = e.clientY;
		startT = performance.now();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function dragMove(e: PointerEvent) {
		if (!dragging) return;
		dragY = Math.max(0, e.clientY - startY);
	}
	function dragEnd() {
		if (!dragging) return;
		dragging = false;
		const velocity = dragY / Math.max(1, performance.now() - startT);
		if (dragY > 120 || velocity > 0.6) onclose();
		else dragY = 0;
	}

	onMount(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !stacked) onclose();
		};
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener('keydown', onKey);
		};
	});

	const transform = $derived(stacked ? 'translateY(-12px) scale(0.955)' : `translateY(${dragY}px)`);
</script>

<div
	class="fixed inset-0 z-50 flex flex-col justify-end {stacked ? 'pointer-events-none' : ''}"
	role="dialog"
	aria-modal="true"
	aria-label={title}
	inert={stacked}
>
	<button
		type="button"
		aria-label="Close"
		class="absolute inset-0 bg-ink/35 backdrop-blur-[3px] transition-opacity duration-300 {stacked ? 'opacity-0' : ''}"
		onclick={onclose}
		transition:fade={{ duration: 220 }}
	></button>

	<div
		class="relative flex h-[92dvh] origin-top flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-glass-lg ring-1 ring-black/[0.06] {dragging
			? ''
			: 'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]'} {stacked ? 'opacity-80' : ''}"
		style="transform: {transform}"
		in:fly={{ y: 640, duration: 460, easing: expoOut }}
		out:fly={{ y: 640, duration: 260, easing: cubicOut }}
	>
		<div
			class="relative shrink-0 touch-none select-none px-4 pt-2.5 pb-2"
			onpointerdown={dragStart}
			onpointermove={dragMove}
			onpointerup={dragEnd}
			onpointercancel={dragEnd}
			role="presentation"
		>
			<div class="mx-auto mb-2.5 h-1.5 w-11 rounded-full bg-neutral-300/80"></div>
			<div class="flex items-center gap-2">
				<div class="min-w-0 flex-1">
					{#if title}
						<p class="truncate text-[15px] font-semibold text-ink">{title}</p>
					{/if}
					{#if subtitle}
						<p class="truncate text-[11.5px] text-neutral-400">{subtitle}</p>
					{/if}
				</div>
				{#if actions}
					{@render actions()}
				{/if}
				{#if fullHref}
					<a
						href={fullHref}
						onclick={(e) => {
							if (onexpand) {
								e.preventDefault();
								onexpand();
							}
						}}
						aria-label="Open as a page"
						title="Open as a page"
						class="tap-scale tap-icon flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-glass ring-1 ring-black/5"
					>
						<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
							<path d="M14 4h6v6M20 4l-8 8M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
				{/if}
				<button
					type="button"
					onclick={onclose}
					aria-label="Close"
					class="tap-scale tap-icon flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-glass ring-1 ring-black/5"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
						<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>

		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</div>
</div>
