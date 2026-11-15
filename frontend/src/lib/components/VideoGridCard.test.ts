import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import type { Video } from '#lib/types.js';
import type { TimelineMove } from '#lib/videoTimeline.js';

vi.mock('#lib/supabase.js', () => ({ supabase: {} }));
vi.mock('#lib/i18n.js', () => ({ t: (key: string) => key }));
vi.mock('$app/paths', () => ({ resolve: () => '/videos/edit/1' }));

import VideoGridCard from './VideoGridCard.svelte';

const video: Video = {
	video_id: 1, title: 'Class', url: 'https://example.com/video',
	description: '', created_at: '', duration_seconds: 90
};
const moves: TimelineMove[] = [
	{ id: 1, move_id: 1, move_name: 'Swing Out', start_time: '0:10', end_time: '0:30' }
];

describe('VideoGridCard coverage', () => {
	it('renders a timeline below the video link when move data is available', () => {
		const { body } = render(VideoGridCard, { props: { video, linkedMoves: moves } });
		expect(body).toContain('timeline_loading');
		expect(body.indexOf('timeline_loading')).toBeGreaterThan(body.indexOf('</a>'));
	});

	it('does not claim coverage while links are unavailable', () => {
		const { body } = render(VideoGridCard, { props: { video } });
		expect(body).not.toContain('timeline_loading');
	});

	it('renders a timeline for a video with no linked moves', () => {
		const { body } = render(VideoGridCard, { props: { video, linkedMoves: [] } });
		expect(body).toContain('timeline_loading');
	});
});
