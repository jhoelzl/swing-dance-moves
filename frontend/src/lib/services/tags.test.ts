import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('#lib/supabase.js', () => ({ supabase: { rpc } }));

import { moveTagGroup } from './tags.js';

describe('moveTagGroup', () => {
	it('sends the group and direction to the database', async () => {
		rpc.mockResolvedValueOnce({ error: null });
		await moveTagGroup(5, -1);
		expect(rpc).toHaveBeenCalledWith('move_tag_group', { p_group_id: 5, p_direction: -1 });
	});

	it('surfaces database errors', async () => {
		rpc.mockResolvedValueOnce({ error: new Error('reorder failed') });
		await expect(moveTagGroup(5, 1)).rejects.toThrow('reorder failed');
	});
});

describe('tag group reorder SQL', () => {
	let db: PGlite;

	beforeAll(async () => {
		db = new PGlite();
		await db.exec(`
			CREATE ROLE anon;
			CREATE ROLE authenticated;
			CREATE TABLE public.tag_types (tag_type_id integer PRIMARY KEY, sort_order integer NOT NULL);
			ALTER TABLE public.tag_types ENABLE ROW LEVEL SECURITY;
			GRANT SELECT, UPDATE ON public.tag_types TO authenticated;
			CREATE POLICY read_groups ON public.tag_types FOR SELECT TO authenticated USING (true);
			CREATE POLICY update_groups ON public.tag_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
		`);
		await db.exec(await readFile('../scripts/reorder_tag_groups.sql', 'utf8'));
	});

	beforeEach(async () => {
		await db.exec(`
			RESET ROLE;
			TRUNCATE public.tag_types;
			INSERT INTO public.tag_types VALUES (1, 0), (2, 0), (3, 1);
			SET ROLE authenticated;
		`);
	});

	afterAll(async () => { await db.close(); });

	async function order() {
		return (await db.query<{ tag_type_id: number; sort_order: number }>(
			'SELECT tag_type_id, sort_order FROM public.tag_types ORDER BY sort_order, tag_type_id'
		)).rows;
	}

	it('moves groups in either direction, including tied positions', async () => {
		await db.query('SELECT public.move_tag_group($1, $2)', [2, -1]);
		expect(await order()).toEqual([
			{ tag_type_id: 2, sort_order: 0 },
			{ tag_type_id: 1, sort_order: 1 },
			{ tag_type_id: 3, sort_order: 2 }
		]);
		await db.query('SELECT public.move_tag_group($1, $2)', [2, 1]);
		expect((await order()).map((row) => row.tag_type_id)).toEqual([1, 2, 3]);
	});

	it('does not alter data for boundary moves or invalid requests', async () => {
		const original = await order();
		await db.query('SELECT public.move_tag_group($1, $2)', [1, -1]);
		await expect(db.query('SELECT public.move_tag_group($1, $2)', [1, 0])).rejects.toThrow('Invalid tag group direction');
		await expect(db.query('SELECT public.move_tag_group($1, $2)', [99, 1])).rejects.toThrow('Tag group not found');
		expect(await order()).toEqual(original);
	});

	it('does not allow anonymous callers to reorder', async () => {
		await db.exec('RESET ROLE; SET ROLE anon');
		await expect(db.query('SELECT public.move_tag_group($1, $2)', [1, 1])).rejects.toThrow(/permission denied/i);
	});

	it('keeps the initial database function in sync with the migration', async () => {
		const migration = await readFile('../scripts/reorder_tag_groups.sql', 'utf8');
		const initial = await readFile('../scripts/init.sql', 'utf8');
		const functionBody = (sql: string) => sql.match(/CREATE OR REPLACE FUNCTION public\.move_tag_group[\s\S]*?\$\$;/)?.[0].replace(/\s+/g, ' ');
		expect(functionBody(initial)).toBeDefined();
		expect(functionBody(initial)).toEqual(functionBody(migration));
	});
});
