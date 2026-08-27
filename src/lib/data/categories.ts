import type { CategoryKey, CategoryMeta } from '$lib/types';

export const categories: Record<CategoryKey, CategoryMeta> = {
	work: {
		key: 'work',
		label: 'Work',
		accent: '#6d5bff',
		tint: 'bg-violet-50 text-violet-700 ring-violet-200'
	},
	personal: {
		key: 'personal',
		label: 'Personal',
		accent: '#2bd4c4',
		tint: 'bg-teal-50 text-teal-700 ring-teal-200'
	},
	urgent: {
		key: 'urgent',
		label: 'Urgent',
		accent: '#ff6b5e',
		tint: 'bg-rose-50 text-rose-700 ring-rose-200'
	},
	finance: {
		key: 'finance',
		label: 'Finance',
		accent: '#ffb648',
		tint: 'bg-amber-50 text-amber-700 ring-amber-200'
	},
	updates: {
		key: 'updates',
		label: 'Updates',
		accent: '#3fa9ff',
		tint: 'bg-sky-50 text-sky-700 ring-sky-200'
	}
};

export const categoryList = Object.values(categories);
