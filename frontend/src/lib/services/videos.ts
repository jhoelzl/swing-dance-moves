import { supabase } from '$lib/supabase';
import type { Video, VideoFormData } from '$lib/types';

/**
 * Fetch all videos ordered by title.
 */
export async function getAllVideos(): Promise<Video[]> {
	const { data, error } = await supabase
		.from('videos')
		.select('*')
		.order('title');

	if (error) throw error;
	return (data ?? []) as Video[];
}

/**
 * Get a single video by ID.
 */
export async function getVideoById(videoId: number): Promise<Video | null> {
	const { data, error } = await supabase
		.from('videos')
		.select('*')
		.eq('video_id', videoId)
		.single();

	if (error) return null;
	return data as Video;
}

/**
 * Create a new video.
 */
export async function createVideo(data: VideoFormData): Promise<Video> {
	const { data: video, error } = await supabase
		.from('videos')
		.insert({
			title: data.title,
			url: data.url,
			description: data.description
		})
		.select()
		.single();

	if (error) throw error;
	return video as Video;
}

/**
 * Update an existing video.
 */
export async function updateVideo(videoId: number, data: VideoFormData): Promise<Video> {
	const { data: video, error } = await supabase
		.from('videos')
		.update({
			title: data.title,
			url: data.url,
			description: data.description
		})
		.eq('video_id', videoId)
		.select()
		.single();

	if (error) throw error;
	return video as Video;
}

/**
 * Delete a video and its move references.
 */
export async function deleteVideo(videoId: number): Promise<void> {
	// Delete move-video references first
	const { error: refError } = await supabase
		.from('moves_to_videos')
		.delete()
		.eq('video_id', videoId);

	if (refError) throw refError;

	const { error } = await supabase
		.from('videos')
		.delete()
		.eq('video_id', videoId);

	if (error) throw error;
}

/**
 * Search videos by text query in title and description.
 */
export function searchVideos(videos: Video[], query: string): Video[] {
	if (!query.trim()) return videos;
	const q = query.toLowerCase().trim();
	return videos.filter(
		(v) =>
			v.title.toLowerCase().includes(q) ||
			v.description.toLowerCase().includes(q)
	);
}
