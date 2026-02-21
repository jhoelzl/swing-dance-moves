/** Map tag_label values to Tailwind CSS classes */
export function getTagColors(label: string): { bg: string; text: string; border: string } {
	const map: Record<string, { bg: string; text: string; border: string }> = {
		success: {
			bg: 'bg-green-500 dark:bg-green-600',
			text: 'text-white',
			border: 'border-green-600 dark:border-green-700'
		},
		danger: {
			bg: 'bg-red-500 dark:bg-red-600',
			text: 'text-white',
			border: 'border-red-600 dark:border-red-700'
		},
		warning: {
			bg: 'bg-yellow-500 dark:bg-yellow-600',
			text: 'text-white',
			border: 'border-yellow-600 dark:border-yellow-700'
		},
		primary: {
			bg: 'bg-blue-500 dark:bg-blue-600',
			text: 'text-white',
			border: 'border-blue-600 dark:border-blue-700'
		},
		secondary: {
			bg: 'bg-gray-500 dark:bg-gray-600',
			text: 'text-white',
			border: 'border-gray-600 dark:border-gray-700'
		},
		light: {
			bg: 'bg-gray-200 dark:bg-gray-700',
			text: 'text-gray-800 dark:text-gray-200',
			border: 'border-gray-300 dark:border-gray-600'
		}
	};

	return (
		map[label] ?? {
			bg: 'bg-gray-200 dark:bg-gray-700',
			text: 'text-gray-800 dark:text-gray-200',
			border: 'border-gray-300 dark:border-gray-600'
		}
	);
}

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string | null {
	if (!url) return null;
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
		/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

/** Debounce function for search input */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
	let timer: ReturnType<typeof setTimeout>;
	return ((...args: unknown[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	}) as T;
}
