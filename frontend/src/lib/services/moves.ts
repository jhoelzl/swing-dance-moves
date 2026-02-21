import { supabase } from '$lib/supabase';
import type { Move, Tag, TagGroup, TagType, MoveFormData } from '$lib/types';

/**
 * Fetch all moves with their associated tags.
 */
export async function getAllMoves(): Promise<Move[]> {
	const { data: moves, error: movesError } = await supabase
		.from('moves')
		.select('*')
		.order('name');

	if (movesError) throw movesError;
	if (!moves) return [];

	// Fetch all move-to-tag mappings
	const { data: mappings, error: mapError } = await supabase
		.from('moves_to_tags')
		.select('move_id, tag_id');

	if (mapError) throw mapError;

	// Fetch all tags with their types
	const { data: tags, error: tagsError } = await supabase
		.from('tags')
		.select('*, tag_types(*)');

	if (tagsError) throw tagsError;

	const tagMap = new Map<number, Tag>();
	for (const tag of tags ?? []) {
		const t = tag as unknown as Tag & { tag_types: TagType };
		tagMap.set(t.tag_id, { ...t, tag_type: t.tag_types });
	}

	// Build move-to-tags lookup
	const moveTagMap = new Map<number, Tag[]>();
	for (const m of mappings ?? []) {
		const tag = tagMap.get(m.tag_id);
		if (tag) {
			if (!moveTagMap.has(m.move_id)) moveTagMap.set(m.move_id, []);
			moveTagMap.get(m.move_id)!.push(tag);
		}
	}

	return moves.map((move) => ({
		...move,
		tags: (moveTagMap.get(move.move_id) ?? []).sort((a, b) => {
			const typeOrder = (a.tag_type?.sort_order ?? 0) - (b.tag_type?.sort_order ?? 0);
			if (typeOrder !== 0) return typeOrder;
			const sortOrder = a.tag_sort - b.tag_sort;
			if (sortOrder !== 0) return sortOrder;
			return a.tag_name.localeCompare(b.tag_name);
		})
	}));
}

/**
 * Filter moves by multiple tag IDs (AND logic: move must have ALL selected tags).
 */
export function filterMovesByTags(moves: Move[], tagIds: number[]): Move[] {
	if (tagIds.length === 0) return moves;
	return moves.filter((move) => {
		const moveTagIds = new Set(move.tags?.map((t) => t.tag_id) ?? []);
		return tagIds.every((id) => moveTagIds.has(id));
	});
}

/**
 * Search moves by text query in name, synonyms, and description.
 */
export function searchMoves(moves: Move[], query: string): Move[] {
	if (!query.trim()) return moves;
	const q = query.toLowerCase().trim();
	return moves.filter(
		(move) =>
			move.name.toLowerCase().includes(q) ||
			move.synonyms.toLowerCase().includes(q) ||
			move.description.toLowerCase().includes(q)
	);
}

/**
 * Get random moves from a list.
 */
export function getRandomMoves(moves: Move[], count: number): Move[] {
	const shuffled = [...moves].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

/**
 * Fetch all tags grouped by tag type.
 */
export async function getAllTagsGrouped(): Promise<TagGroup[]> {
	const { data: tagTypes, error: typesError } = await supabase
		.from('tag_types')
		.select('*')
		.order('sort_order');

	if (typesError) throw typesError;

	const { data: tags, error: tagsError } = await supabase
		.from('tags')
		.select('*')
		.order('tag_sort')
		.order('tag_name');

	if (tagsError) throw tagsError;

	return (tagTypes ?? []).map((type) => ({
		tagType: type as TagType,
		tags: (tags ?? []).filter((t) => t.tag_type_id === type.tag_type_id) as Tag[]
	}));
}

/**
 * Create a new move with tags.
 */
export async function createMove(data: MoveFormData): Promise<Move> {
	const { data: move, error } = await supabase
		.from('moves')
		.insert({
			name: data.name,
			synonyms: data.synonyms,
			description: data.description,
			link: data.link
		})
		.select()
		.single();

	if (error) throw error;

	// Insert tag mappings
	if (data.tagIds.length > 0) {
		const { error: tagError } = await supabase.from('moves_to_tags').insert(
			data.tagIds.map((tagId) => ({
				move_id: move.move_id,
				tag_id: tagId
			}))
		);
		if (tagError) throw tagError;
	}

	return move as Move;
}

/**
 * Update an existing move and its tags.
 */
export async function updateMove(moveId: number, data: MoveFormData): Promise<Move> {
	const { data: move, error } = await supabase
		.from('moves')
		.update({
			name: data.name,
			synonyms: data.synonyms,
			description: data.description,
			link: data.link
		})
		.eq('move_id', moveId)
		.select()
		.single();

	if (error) throw error;

	// Delete old tag mappings
	const { error: delError } = await supabase
		.from('moves_to_tags')
		.delete()
		.eq('move_id', moveId);

	if (delError) throw delError;

	// Insert new tag mappings
	if (data.tagIds.length > 0) {
		const { error: tagError } = await supabase.from('moves_to_tags').insert(
			data.tagIds.map((tagId) => ({
				move_id: moveId,
				tag_id: tagId
			}))
		);
		if (tagError) throw tagError;
	}

	return move as Move;
}

/**
 * Delete a move and its tag mappings.
 */
export async function deleteMove(moveId: number): Promise<void> {
	const { error: tagError } = await supabase
		.from('moves_to_tags')
		.delete()
		.eq('move_id', moveId);

	if (tagError) throw tagError;

	const { error } = await supabase.from('moves').delete().eq('move_id', moveId);

	if (error) throw error;
}

/**
 * Get a single move by ID.
 */
export async function getMoveById(moveId: number): Promise<Move | null> {
	const { data: move, error } = await supabase
		.from('moves')
		.select('*')
		.eq('move_id', moveId)
		.single();

	if (error) return null;

	const { data: mappings } = await supabase
		.from('moves_to_tags')
		.select('tag_id')
		.eq('move_id', moveId);

	const { data: tags } = await supabase.from('tags').select('*, tag_types(*)');

	const tagMap = new Map<number, Tag>();
	for (const tag of tags ?? []) {
		const t = tag as unknown as Tag & { tag_types: TagType };
		tagMap.set(t.tag_id, { ...t, tag_type: t.tag_types });
	}

	const moveTags = (mappings ?? []).map((m) => tagMap.get(m.tag_id)).filter(Boolean) as Tag[];

	return { ...move, tags: moveTags } as Move;
}
