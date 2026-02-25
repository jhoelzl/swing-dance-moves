import { supabase } from '$lib/supabase';
import type { Video, VideoFormData, MoveToVideo } from '$lib/types';

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
			(v.description?.toLowerCase().includes(q) ?? false)
	);
}

/**
 * Get video references for a move (with joined video data).
 */
export async function getVideoRefsForMove(moveId: number): Promise<MoveToVideo[]> {
	const { data: mappings, error: mapError } = await supabase
		.from('moves_to_videos')
		.select('*')
		.eq('move_id', moveId);

	if (mapError) throw mapError;
	if (!mappings || mappings.length === 0) return [];

	const videoIds = mappings.map((m: any) => m.video_id);
	const { data: videos, error: vidError } = await supabase
		.from('videos')
		.select('*')
		.in('video_id', videoIds);

	if (vidError) throw vidError;

	const videoMap = new Map<number, Video>();
	for (const v of (videos ?? []) as Video[]) {
		videoMap.set(v.video_id, v);
	}

	return mappings.map((m: any) => ({
		...m,
		video: videoMap.get(m.video_id),
	})) as MoveToVideo[];
}

/**
 * Get linked moves for a video (move_id, name, start_time, end_time).
 */
export async function getLinkedMovesForVideo(videoId: number): Promise<{
	move_id: number;
	move_name: string;
	start_time: string;
	end_time: string;
}[]> {
	const { data: mappings, error: mapError } = await supabase
		.from('moves_to_videos')
		.select('*')
		.eq('video_id', videoId);

	if (mapError) throw mapError;
	if (!mappings || mappings.length === 0) return [];

	const moveIds = mappings.map((m: any) => m.move_id);
	const { data: moves, error: movError } = await supabase
		.from('moves')
		.select('move_id, name')
		.in('move_id', moveIds);

	if (movError) throw movError;

	const moveMap = new Map<number, string>();
	for (const m of moves ?? []) {
		moveMap.set(m.move_id, m.name);
	}

	return mappings.map((m: any) => ({
		move_id: m.move_id,
		move_name: moveMap.get(m.move_id) ?? 'Unknown',
		start_time: m.start_time ?? '',
		end_time: m.end_time ?? '',
	}));
}
