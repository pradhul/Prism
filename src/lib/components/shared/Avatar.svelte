<script lang="ts">
	import { senderIcon } from '$lib/data/senderIcons';

	let {
		initials,
		sender,
		classes = 'bg-slate-100 text-slate-700',
		size = 'md'
	}: {
		initials: string;
		/** when the sender is a known brand, its mark is shown instead of initials */
		sender?: string;
		classes?: string;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const sizes: Record<string, string> = {
		sm: 'h-7 w-7 text-[11px]',
		md: 'h-9 w-9 text-xs',
		lg: 'h-11 w-11 text-sm'
	};

	const iconSizes: Record<string, string> = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6'
	};

	const icon = $derived(senderIcon(sender));
</script>

{#if icon}
	<div
		class="flex shrink-0 items-center justify-center rounded-full ring-1 ring-black/[0.08] {sizes[size]}"
		style="background: {icon.bg}"
	>
		<svg viewBox="0 0 24 24" class={iconSizes[size]} role="img" aria-label={icon.title}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, hand-authored brand SVG data -->
			{@html icon.svg}
		</svg>
	</div>
{:else}
	<div
		class="flex shrink-0 items-center justify-center rounded-full font-semibold {sizes[
			size
		]} {classes}"
	>
		{initials}
	</div>
{/if}
