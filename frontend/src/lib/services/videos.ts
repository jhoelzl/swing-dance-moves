import { supabase } from '#lib/supabase.js';
import type { Video, VideoFormData, MoveToVideo } from '#lib/types.js';

const db: any = supabase;

export type VideoMoveLink = {
	id: number;
	video_id: number;
	move_id: number;
	start_time: string | null;
	end_time: string | null;
};

export async function getAllVideoMoveLinks(): Promise<VideoMoveLink[]> {
	const links: VideoMoveLink[] = [];
	const pageSize = 1000;
	for (let offset = 0; ; offset += pageSize) {
		const { data, error } = await supabase
			.from('moves_to_videos')
			.select('id, video_id, move_id, start_time, end_time')
			.order('id')
			.range(offset, offset + pageSize - 1);
		if (error) throw error;
		links.push(...data);
		if (data.length < pageSize) return links;
	}
}

function createDeleteConstraintError(message: string): Error {
	const error = new Error(message);
	error.name = 'DeleteConstraintError';
	return error;
}

/**
 * Fetch all videos ordered by title.
 */
export async function getAllVideos(): Promise<Video[]> {
	const { data, error } = await db
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
	const { data, error } = await db
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
	const { data: video, error } = await db
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
	const { data: video, error } = await db
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
 * Delete a video when no move references remain.
 */
export async function deleteVideo(videoId: number): Promise<void> {
	const { count, error: countError } = await db
		.from('moves_to_videos')
		.select('id', { count: 'exact', head: true })
		.eq('video_id', videoId);

	if (countError) throw countError;

	if ((count ?? 0) > 0) {
		throw createDeleteConstraintError('Cannot delete this video while it is still linked to moves.');
	}

	const { error } = await db
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
	const { data: mappings, error: mapError } = await db
		.from('moves_to_videos')
		.select('*')
		.eq('move_id', moveId);

	if (mapError) throw mapError;
	if (!mappings || mappings.length === 0) return [];

	const videoIds = mappings.map((m: any) => m.video_id);
	const { data: videos, error: vidError } = await db
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
