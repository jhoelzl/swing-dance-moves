import { supabase } from '#lib/supabase.js';
import type { Tag, TagGroup, Video, VideoFormData, MoveToVideo } from '#lib/types.js';

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
	return attachVideoTags((data ?? []) as Video[]);
}

async function getVideoTags(videoIds: number[]): Promise<Map<number, Tag[]>> {
	if (!videoIds.length) return new Map();
	const { data, error } = await db
		.from('videos_to_tags')
		.select('video_id, tag:tags(*)')
		.in('video_id', videoIds);
	if (error) throw error;

	const tagsByVideo = new Map<number, Tag[]>();
	for (const mapping of (data ?? []) as { video_id: number; tag: Tag | null }[]) {
		if (!mapping.tag) continue;
		const tags = tagsByVideo.get(mapping.video_id) ?? [];
		tags.push(mapping.tag);
		tagsByVideo.set(mapping.video_id, tags);
	}
	return tagsByVideo;
}

async function attachVideoTags(videos: Video[]): Promise<Video[]> {
	const tagsByVideo = await getVideoTags(videos.map((video) => video.video_id));
	return videos.map((video) => ({ ...video, tags: tagsByVideo.get(video.video_id) ?? [] }));
}

async function replaceVideoTags(videoId: number, tagIds: number[]): Promise<void> {
	const { error: deleteError } = await db
		.from('videos_to_tags')
		.delete()
		.eq('video_id', videoId);
	if (deleteError) throw deleteError;

	if (tagIds.length) {
		const { error: insertError } = await db.from('videos_to_tags').insert(
			[...new Set(tagIds)].map((tag_id) => ({ video_id: videoId, tag_id }))
		);
		if (insertError) throw insertError;
	}
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
	const [video] = await attachVideoTags([data as Video]);
	return video;
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
	await replaceVideoTags(video.video_id, data.tagIds);
	const [result] = await attachVideoTags([video as Video]);
	return result;
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
	await replaceVideoTags(videoId, data.tagIds);
	const [result] = await attachVideoTags([video as Video]);
	return result;
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

export type VideoTagFilter = 'all' | 'missing-tags';

export function getVideoTagGroups(groups: TagGroup[]): TagGroup[] {
	return groups.filter((group) => {
		const name = group.tagType.tag_type_name.trim().toLowerCase();
		return name === 'festivals' || name === 'festival / classes' || name === 'teachers';
	});
}

export function filterVideosByTags(videos: Video[], tagIds: number[], groups: TagGroup[]): Video[] {
	if (tagIds.length === 0) return videos;
	const typeOf = new Map(groups.flatMap((group) =>
		group.tags.map((tag) => [tag.tag_id, group.tagType.tag_type_id] as const)
	));
	const selectedGroups = new Map<number, Set<number>>();
	for (const id of tagIds) {
		const type = typeOf.get(id) ?? -id;
		if (!selectedGroups.has(type)) selectedGroups.set(type, new Set());
		selectedGroups.get(type)!.add(id);
	}
	return videos.filter((video) => {
		const assigned = new Set(video.tags?.map((tag) => tag.tag_id) ?? []);
		return [...selectedGroups.values()].every((ids) => [...ids].some((id) => assigned.has(id)));
	});
}

export function filterVideosByTagPresence(videos: Video[], filter: VideoTagFilter, groups: TagGroup[]): Video[] {
	if (filter === 'all') return videos;
	const festivalTypes = new Set<number>();
	const teacherTypes = new Set<number>();
	for (const group of groups) {
		const name = group.tagType.tag_type_name.trim().toLowerCase();
		if (name === 'festivals' || name === 'festival / classes') festivalTypes.add(group.tagType.tag_type_id);
		if (name === 'teachers') teacherTypes.add(group.tagType.tag_type_id);
	}
	return videos.filter((video) => {
		const tags = video.tags ?? [];
		return !tags.some((tag) => festivalTypes.has(tag.tag_type_id)) ||
			!tags.some((tag) => teacherTypes.has(tag.tag_type_id));
	});
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
