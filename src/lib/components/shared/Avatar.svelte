<script lang="ts">
	let {
		initials,
		classes = 'bg-slate-100 text-slate-700',
		size = 'md'
	}: {
		initials: string;
		classes?: string;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const sizes: Record<string, string> = {
		sm: 'h-7 w-7 text-[11px]',
		md: 'h-9 w-9 text-xs',
		lg: 'h-11 w-11 text-sm'
	};
</script>

<div
	class="flex shrink-0 items-center justify-center rounded-full font-semibold {sizes[
		size
	]} {classes}"
>
	{initials}
</div>
