import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

describe('video duration migration', () => {
	let db: PGlite;

	beforeAll(async () => {
		db = new PGlite();
		await db.exec('CREATE TABLE public.videos (video_id integer PRIMARY KEY, url text NOT NULL)');
		const migration = await readFile('../scripts/add_video_duration.sql', 'utf8');
		await db.exec(migration);
		await db.exec(migration);
	});

	afterAll(async () => { await db.close(); });

	it('preserves duration on unrelated edits and clears it when the URL changes', async () => {
		await db.exec("INSERT INTO videos VALUES (1, 'old', 123); UPDATE videos SET url = 'old' WHERE video_id = 1");
		expect((await db.query<{ duration_seconds: number | null }>('SELECT duration_seconds FROM videos WHERE video_id = 1')).rows[0].duration_seconds).toBe(123);
		await db.exec("UPDATE videos SET url = 'new' WHERE video_id = 1");
		expect((await db.query<{ duration_seconds: number | null }>('SELECT duration_seconds FROM videos WHERE video_id = 1')).rows[0].duration_seconds).toBeNull();
		const result = await db.query("UPDATE videos SET duration_seconds = 123 WHERE video_id = 1 AND url = 'old' AND duration_seconds IS NULL RETURNING video_id");
		expect(result.rows).toHaveLength(0);
	});

	it('rejects invalid durations', async () => {
		await db.exec("INSERT INTO videos (video_id, url) VALUES (2, 'video') ON CONFLICT DO NOTHING");
		for (const value of ['0', '-1', "'Infinity'", "'NaN'"]) {
			await expect(db.exec(`UPDATE videos SET duration_seconds = ${value} WHERE video_id = 2`)).rejects.toThrow();
		}
	});

	it('keeps the initial schema trigger consistent with the migration', async () => {
		const migration = await readFile('../scripts/add_video_duration.sql', 'utf8');
		const initial = await readFile('../scripts/init.sql', 'utf8');
		const functionBody = (sql: string) => sql.match(/CREATE OR REPLACE FUNCTION public\.clear_video_duration_on_url_change[\s\S]*?\$\$;/)?.[0];
		expect(functionBody(initial)).toBeDefined();
		expect(functionBody(initial)).toEqual(functionBody(migration));
	});
});
