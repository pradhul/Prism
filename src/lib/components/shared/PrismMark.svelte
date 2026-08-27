<script lang="ts">
	let { size = 40, class: klass = '' }: { size?: number; class?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 48 48" fill="none" class={klass} aria-hidden="true">
	<path d="M4 34 L24 8 L44 34 Z" fill="white" stroke="#17151A" stroke-width="2.2" stroke-linejoin="round" />
	<path d="M2 20 H15" stroke="#17151A" stroke-width="2.2" stroke-linecap="round" />
	<path d="M31 16 L44 8" stroke="#FF6B5E" stroke-width="2.2" stroke-linecap="round" />
	<path d="M33 24 L47 24" stroke="#FFB648" stroke-width="2.2" stroke-linecap="round" />
	<path d="M30 32 L43 40" stroke="#2BD4C4" stroke-width="2.2" stroke-linecap="round" />
	<path d="M27 27 L37 34.5" stroke="#3FA9FF" stroke-width="2.2" stroke-linecap="round" />
</svg>
