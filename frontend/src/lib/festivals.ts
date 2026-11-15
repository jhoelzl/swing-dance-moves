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
	unassignedMoves: Move[];
}

export function selectFestival(festivals: FestivalOverview[], id: string | null): FestivalOverview | undefined {
	return id === null ? festivals[0] : festivals.find((item) => String(item.festival.tag_id) === id);
}

export function festivalSelectionUrl(url: string, festivalId: string): URL {
	const next = new URL(url);
	next.searchParams.set('festival', festivalId);
	return next;
}

export function buildFestivalOverviews(
	groups: TagGroup[],
	moves: Move[],
	videos: Video[],
	links: VideoMoveLink[]
): FestivalOverview[] {
	const festivalGroup = groups.find((group) => {
		const name = group.tagType.tag_type_name.trim().toLowerCase();
		return name === 'festivals' || name === 'festival / classes';
	});
	if (!festivalGroup) return [];
	const teacherGroup = groups.find((group) => group.tagType.tag_type_name.trim().toLowerCase() === 'teachers');
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
		const assignedMoveIds = new Set<number>();
		for (const video of videos) {
			if (!video.tags?.some((tag) => tag.tag_id === festival.tag_id)) continue;
			const linkedMoves = movesByVideo.get(video.video_id) ?? [];
			const taggedMoves = linkedMoves.filter((move) => move.tags?.some((tag) => tag.tag_id === festival.tag_id));
			for (const move of taggedMoves) assignedMoveIds.add(move.move_id);
			const teachers = (video.tags ?? []).filter((tag) => teacherIds.has(tag.tag_id));
			classes.push({ video, moves: taggedMoves, teachers: [...teachers.values()] });
		}
		return {
			festival,
			classes,
			unassignedMoves: festivalMoves.filter((move) => !assignedMoveIds.has(move.move_id))
		};
	});
}
