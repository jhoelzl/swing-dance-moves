/** Map tag_label values to modern soft Tailwind CSS classes */
export function getTagColors(label: string): { bg: string; text: string; border: string; activeBg: string } {
	const map: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
		success: {
			bg: 'bg-emerald-50 dark:bg-emerald-950/40',
			text: 'text-emerald-700 dark:text-emerald-300',
			border: 'border-emerald-200 dark:border-emerald-800',
			activeBg: 'bg-emerald-500 dark:bg-emerald-600'
		},
		danger: {
			bg: 'bg-rose-50 dark:bg-rose-950/40',
			text: 'text-rose-700 dark:text-rose-300',
			border: 'border-rose-200 dark:border-rose-800',
			activeBg: 'bg-rose-500 dark:bg-rose-600'
		},
		warning: {
			bg: 'bg-amber-50 dark:bg-amber-950/40',
			text: 'text-amber-700 dark:text-amber-300',
			border: 'border-amber-200 dark:border-amber-800',
			activeBg: 'bg-amber-500 dark:bg-amber-600'
		},
		primary: {
			bg: 'bg-blue-50 dark:bg-blue-950/40',
			text: 'text-blue-700 dark:text-blue-300',
			border: 'border-blue-200 dark:border-blue-800',
			activeBg: 'bg-blue-500 dark:bg-blue-600'
		},
		secondary: {
			bg: 'bg-slate-100 dark:bg-slate-800/60',
			text: 'text-slate-600 dark:text-slate-300',
			border: 'border-slate-200 dark:border-slate-700',
			activeBg: 'bg-slate-500 dark:bg-slate-600'
		},
		light: {
			bg: 'bg-gray-100 dark:bg-gray-800/60',
			text: 'text-gray-600 dark:text-gray-300',
			border: 'border-gray-200 dark:border-gray-700',
			activeBg: 'bg-gray-500 dark:bg-gray-600'
		}
	};

	return (
		map[label] ?? {
			bg: 'bg-violet-50 dark:bg-violet-950/40',
			text: 'text-violet-700 dark:text-violet-300',
			border: 'border-violet-200 dark:border-violet-800',
			activeBg: 'bg-violet-500 dark:bg-violet-600'
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

/** Check if a URL is a Dropbox shared link */
export function isDropboxUrl(url: string): boolean {
	if (!url) return false;
	return /dropbox\.com\/(s|scl|sh)\//.test(url) || /dropboxusercontent\.com\//.test(url);
}

/** Convert Dropbox shared link to direct download/streaming URL */
export function getDropboxDirectUrl(url: string): string | null {
	if (!url) return null;

	// Already a direct link
	if (url.includes('dl.dropboxusercontent.com')) {
		return url;
	}

	// Shared link: replace domain and force raw=1
	if (url.includes('dropbox.com/')) {
		let directUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
		// Remove dl=0 or dl=1 param and add raw=1
		directUrl = directUrl.replace(/[?&]dl=[01]/, '');
		if (directUrl.includes('?')) {
			directUrl += '&raw=1';
		} else {
			directUrl += '?raw=1';
		}
		return directUrl;
	}

	return null;
}

/** Determine the video source type from a URL */
export type VideoSourceType = 'youtube' | 'dropbox' | null;
export function getVideoSourceType(url: string): VideoSourceType {
	if (extractYouTubeId(url)) return 'youtube';
	if (isDropboxUrl(url)) return 'dropbox';
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

/** Convert timecode string (e.g. "10:01" or "1:30:05") to seconds */
export function timecodeToSeconds(timecode: string): number {
	if (!timecode || !timecode.trim()) return 0;
	const parts = timecode.trim().split(':').map(Number);
	if (parts.some(isNaN)) return 0;
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
	if (parts.length === 2) return parts[0] * 60 + parts[1];
	return parts[0];
}
