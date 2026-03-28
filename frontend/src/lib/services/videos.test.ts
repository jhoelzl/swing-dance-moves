import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/supabase', () => ({
	supabase: {}
}));

import type { Video } from '$lib/types';
import { searchVideos } from '$lib/services/videos';

const videos: Video[] = [
	{
		video_id: 1,
		title: 'Swing Out Breakdown',
		url: 'https://example.com/swing-out',
		description: 'Detailed partner connection drill',
		created_at: '2026-03-28T10:00:00Z'
	},
	{
		video_id: 2,
		title: 'Charleston Basics',
		url: 'https://example.com/charleston',
		description: 'Footwork fundamentals',
		created_at: '2026-03-28T11:00:00Z'
	}
];

describe('searchVideos', () => {
	it('returns all videos for an empty query', () => {
		expect(searchVideos(videos, '   ')).toEqual(videos);
	});

	it('matches title and description case-insensitively', () => {
		expect(searchVideos(videos, 'swing')).toEqual([videos[0]]);
		expect(searchVideos(videos, 'fundamentals')).toEqual([videos[1]]);
	});
});