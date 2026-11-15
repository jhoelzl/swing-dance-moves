import type { Move } from '#lib/types.js';
import type { VideoMoveLink } from '#lib/services/videos.js';

export interface TimelineMove {
	id: number;
	move_id: number;
	move_name: string;
	start_time: string | null;
	end_time: string | null;
}

export function groupTimelineMoves(links: VideoMoveLink[], moves: Move[]): Record<number, TimelineMove[]> {
	const names = new Map(moves.map((move) => [move.move_id, move.name]));
	const byVideo: Record<number, TimelineMove[]> = {};
	for (const link of links) {
		(byVideo[link.video_id] ??= []).push({
			...link,
			move_name: names.get(link.move_id) ?? `#${link.move_id}`
		});
	}
	return byVideo;
}

export interface TimelineRange {
	start: number;
	end: number;
	moves: TimelineMove[];
}

function parseTime(value: string | null): number | null {
	if (!value) return null;
	const text = value.trim();
	if (!/^\d+(?::[0-5]\d){0,2}$/.test(text)) return null;
	return text.split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0);
}

export function getMoveInterval(move: TimelineMove, duration: number | null): { start: number; end: number } | null {
	const start = parseTime(move.start_time);
	const end = parseTime(move.end_time);
	if (start === null || end === null || start >= end) return null;
	if (duration !== null && (!Number.isFinite(duration) || duration <= 0 || start >= duration || end > duration)) return null;
	return { start, end };
}

export function sortTimelineMoves(moves: TimelineMove[]): TimelineMove[] {
	return [...moves].sort((a, b) => (parseTime(a.start_time) ?? Infinity) - (parseTime(b.start_time) ?? Infinity));
}

export function formatVideoTime(seconds: number): string {
	const whole = Math.floor(seconds);
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor((whole % 3600) / 60);
	const remainder = String(whole % 60).padStart(2, '0');
	return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

export function youtubeEmbedUrl(id: string, start: number, end: number | null, autoplay: boolean): string {
	const params = new URLSearchParams();
	if (start > 0) params.set('start', String(start));
	if (end !== null) params.set('end', String(end));
	if (autoplay) params.set('autoplay', '1');
	if (autoplay && end !== null) params.set('playsinline', '1');
	const query = params.toString();
	return `https://www.youtube.com/embed/${id}${query ? `?${query}` : ''}`;
}

export function buildVideoTimeline(duration: number, moves: TimelineMove[]): {
	ranges: TimelineRange[];
	incomplete: boolean;
} {
	if (!Number.isFinite(duration) || duration <= 0) return { ranges: [], incomplete: true };
	let incomplete = false;
	const intervals: { start: number; end: number; move: TimelineMove }[] = [];
	for (const move of moves) {
		const interval = getMoveInterval(move, duration);
		if (!interval) {
			incomplete = true;
			continue;
		}
		intervals.push({ ...interval, move });
	}
	const boundaries = [...new Set([0, duration, ...intervals.flatMap(({ start, end }) => [start, end])])].sort((a, b) => a - b);
	const ranges: TimelineRange[] = [];
	for (let i = 0; i < boundaries.length - 1; i++) {
		const start = boundaries[i];
		const end = boundaries[i + 1];
		const active = intervals.filter((interval) => interval.start <= start && interval.end >= end).map((interval) => interval.move);
		ranges.push({ start, end, moves: active });
	}
	return { ranges, incomplete };
}
