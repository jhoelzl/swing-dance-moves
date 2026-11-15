import type { Database, Video } from '#lib/types.js';
import { supabase } from '#lib/supabase.js';
import { allVideos } from '#lib/stores.js';
import { getVideoDuration } from './videoDuration.js';

const pending = new Map<string, Promise<number>>();

export function loadVideoDuration(video: Video): Promise<number> {
	if (video.duration_seconds != null && Number.isFinite(video.duration_seconds) && video.duration_seconds > 0) {
		return Promise.resolve(video.duration_seconds);
	}
	const key = JSON.stringify([video.video_id, video.url]);
	const existing = pending.get(key);
	if (existing) return existing;
	const request = getVideoDuration(video.url).then((duration) => {
		void persistDuration(video, duration).catch((error: unknown) => {
			console.error('Failed to save video duration:', error);
		});
		return duration;
	}).finally(() => pending.delete(key));
	pending.set(key, request);
	return request;
}

async function persistDuration(video: Video, duration: number): Promise<void> {
	const update: Database['public']['Tables']['videos']['Update'] = { duration_seconds: duration };
	const { data, error } = await supabase.from('videos')
		// @ts-expect-error – Supabase's schema generic resolves to never for the existing interface-based row types
		.update(update)
		.eq('video_id', video.video_id)
		.eq('url', video.url)
		.is('duration_seconds', null)
		.select('video_id')
		.maybeSingle();
	if (error) throw error;
	if (data) {
		allVideos.update((videos) => videos.map((item) =>
			item.video_id === video.video_id && item.url === video.url && item.duration_seconds == null
				? { ...item, duration_seconds: duration } : item
		));
	}
}
