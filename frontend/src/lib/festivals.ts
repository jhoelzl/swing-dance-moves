import type { Move, Tag, TagGroup, Video } from '#lib/types.js';
import type { VideoMoveLink } from '#lib/services/videos.js';

interface FestivalClass {
	video: Video;
	moves: Move[];
	teachers: Tag[];
}

interface FestivalOverview {
	festival: Tag;
	classes: FestivalClass[];
	ambiguousVideos: Video[];
	unassignedMoves: Move[];
}

export function buildFestivalOverviews(
	groups: TagGroup[],
	moves: Move[],
	videos: Video[],
	links: VideoMoveLink[]
): FestivalOverview[] {
	const festivalGroup = groups.find((group) => group.tagType.tag_type_name.trim().toLowerCase() === 'festivals');
	if (!festivalGroup) return [];
	const teacherGroup = groups.find((group) => group.tagType.tag_type_name.trim().toLowerCase() === 'teachers');
	const festivalIds = new Set(festivalGroup.tags.map((tag) => tag.tag_id));
	const teacherIds = new Set(teacherGroup?.tags.map((tag) => tag.tag_id) ?? []);
	const movesById = new Map(moves.map((move) => [move.move_id, move]));
	const movesByVideo = new Map<number, Move[]>();
	for (const link of links) {
		const move = movesById.get(link.move_id);
		if (!move) continue;
		const linkedMoves = movesByVideo.get(link.video_id) ?? [];
		if (!linkedMoves.some((item) => item.move_id === move.move_id)) linkedMoves.push(move);
		movesByVideo.set(link.video_id, linkedMoves);
	}

	return festivalGroup.tags.map((festival) => {
		const festivalMoves = moves.filter((move) => move.tags?.some((tag) => tag.tag_id === festival.tag_id));
		const classes: FestivalClass[] = [];
		const ambiguousVideos: Video[] = [];
		const assignedMoveIds = new Set<number>();
		for (const video of videos) {
			const linkedMoves = movesByVideo.get(video.video_id) ?? [];
			const taggedMoves = linkedMoves.filter((move) => move.tags?.some((tag) => tag.tag_id === festival.tag_id));
			if (!taggedMoves.length) continue;
			const linkedFestivalIds = new Set(linkedMoves.flatMap((move) =>
				(move.tags ?? []).filter((tag) => festivalIds.has(tag.tag_id)).map((tag) => tag.tag_id)
			));
			if (linkedFestivalIds.size > 1) {
				ambiguousVideos.push(video);
				continue;
			}
			const teachers = new Map<number, Tag>();
			for (const move of taggedMoves) {
				assignedMoveIds.add(move.move_id);
				for (const tag of move.tags ?? []) {
					if (teacherIds.has(tag.tag_id)) teachers.set(tag.tag_id, tag);
				}
			}
			classes.push({ video, moves: taggedMoves, teachers: [...teachers.values()] });
		}
		return {
			festival,
			classes,
			ambiguousVideos,
			unassignedMoves: festivalMoves.filter((move) => !assignedMoveIds.has(move.move_id))
		};
	});
}
