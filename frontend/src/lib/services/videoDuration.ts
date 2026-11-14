import { extractYouTubeId, getDropboxDirectUrl } from '#lib/utils.js';

interface YouTubePlayer {
	getDuration(): number;
	destroy(): void;
}
interface YouTubeEvent { target: YouTubePlayer }
interface YouTubeApi {
	Player: new (element: HTMLElement, options: {
		videoId: string;
		playerVars: { autoplay: number };
		events: { onReady: (event: YouTubeEvent) => void; onError: () => void };
	}) => YouTubePlayer;
}
declare global {
	interface Window {
		YT?: YouTubeApi;
		onYouTubeIframeAPIReady?: () => void;
	}
}

let apiPromise: Promise<YouTubeApi> | undefined;
const cache = new Map<string, Promise<number>>();
let running = 0;
const waiting: (() => void)[] = [];

function youtubeApi(): Promise<YouTubeApi> {
	if (window.YT?.Player) return Promise.resolve(window.YT);
	if (apiPromise) return apiPromise;
	apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
		const previous = window.onYouTubeIframeAPIReady;
		const script = document.createElement('script');
		const timer = window.setTimeout(() => fail(), 12000);
		function fail() {
			window.clearTimeout(timer);
			script.remove();
			window.onYouTubeIframeAPIReady = previous;
			reject(new Error('YouTube player API unavailable'));
		}
		window.onYouTubeIframeAPIReady = () => {
			window.clearTimeout(timer);
			window.onYouTubeIframeAPIReady = previous;
			previous?.();
			if (window.YT?.Player) resolve(window.YT);
			else reject(new Error('YouTube player API unavailable'));
		};
		script.onerror = fail;
		script.src = 'https://www.youtube.com/iframe_api';
		document.head.append(script);
	}).catch((error: unknown) => {
		apiPromise = undefined;
		throw error;
	});
	return apiPromise;
}

async function youtubeDuration(id: string): Promise<number> {
	const api = await youtubeApi();
	return new Promise((resolve, reject) => {
		const holder = document.createElement('div');
		holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:200px;height:200px;pointer-events:none';
		document.body.append(holder);
		const element = document.createElement('div');
		holder.append(element);
		let player: YouTubePlayer | undefined;
		let poll: number | undefined;
		const timeout = window.setTimeout(() => finish(undefined), 12000);
		let finished = false;
		function finish(duration: number | undefined) {
			if (finished) return;
			finished = true;
			window.clearTimeout(timeout);
			window.clearInterval(poll);
			player?.destroy();
			holder.remove();
			if (duration && Number.isFinite(duration) && duration > 0) resolve(duration);
			else reject(new Error('YouTube duration unavailable'));
		}
		try {
			player = new api.Player(element, {
				videoId: id,
				playerVars: { autoplay: 0 },
				events: {
					onReady: ({ target }) => {
						const check = () => {
							const duration = target.getDuration();
							if (duration > 0 && Number.isFinite(duration)) finish(duration);
						};
						check();
						if (!finished) poll = window.setInterval(check, 250);
					},
					onError: () => finish(undefined)
				}
			});
		} catch {
			finish(undefined);
		}
	});
}

function dropboxDuration(url: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		const timeout = window.setTimeout(() => finish(false), 12000);
		function finish(success: boolean) {
			window.clearTimeout(timeout);
			video.onloadedmetadata = null;
			video.onerror = null;
			const duration = video.duration;
			video.removeAttribute('src');
			video.load();
			if (success && Number.isFinite(duration) && duration > 0) resolve(duration);
			else reject(new Error('Dropbox duration unavailable'));
		}
		video.preload = 'metadata';
		video.onloadedmetadata = () => finish(true);
		video.onerror = () => finish(false);
		video.src = url;
	});
}

async function lookup(url: string): Promise<number> {
	if (running >= 2) await new Promise<void>((resolve) => waiting.push(resolve));
	else running++;
	try {
		const youtubeId = extractYouTubeId(url);
		if (youtubeId) return await youtubeDuration(youtubeId);
		const dropboxUrl = getDropboxDirectUrl(url);
		if (dropboxUrl) return await dropboxDuration(dropboxUrl);
		throw new Error('Unsupported video source');
	} finally {
		const next = waiting.shift();
		if (next) next();
		else running--;
	}
}

export function getVideoDuration(url: string): Promise<number> {
	const existing = cache.get(url);
	if (existing) return existing;
	const request = lookup(url).catch((error: unknown) => {
		cache.delete(url);
		throw error;
	});
	cache.set(url, request);
	return request;
}
