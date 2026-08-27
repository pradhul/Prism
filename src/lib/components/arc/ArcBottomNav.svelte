<script lang="ts">
	import { categories } from '$lib/data/categories';
	import type { CategoryKey } from '$lib/types';

	let {
		active,
		onSelect
	}: { active: CategoryKey | 'all'; onSelect: (key: CategoryKey | 'all') => void } = $props();

	const items: { key: CategoryKey | 'all'; label: string }[] = [
		{ key: 'work', label: 'Work' },
		{ key: 'personal', label: 'Personal' },
		{ key: 'all', label: 'All' },
		{ key: 'urgent', label: 'Urgent' },
		{ key: 'updates', label: 'Updates' }
	];
</script>

<div class="safe-bottom pointer-events-none fixed inset-x-0 bottom-0 flex justify-center pb-5">
	<div class="pointer-events-auto flex items-end gap-1 rounded-full bg-white/90 px-2 py-2 shadow-glass-lg ring-1 ring-black/[0.06] backdrop-blur">
		{#each items as item (item.key)}
			{@const isCenter = item.key === 'all'}
			{@const isActive = active === item.key}
			<button
				type="button"
				onclick={() => onSelect(item.key)}
				class="tap-scale flex flex-col items-center justify-center rounded-full text-[10.5px] font-medium transition-all duration-200 {isCenter
					? '-translate-y-2.5 h-14 w-14'
					: 'h-11 w-14'} {isActive ? 'bg-ink text-white' : 'text-neutral-500'}"
			>
				<span class="h-1.5 w-1.5 rounded-full {isActive ? 'bg-white' : 'bg-neutral-300'}"></span>
				<span class="mt-1">{item.label}</span>
			</button>
		{/each}
	</div>
</div>
