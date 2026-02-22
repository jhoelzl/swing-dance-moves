import { supabase } from '$lib/supabase';
import type { Tag, TagType } from '$lib/types';

// ── Tag Types ──

export async function getAllTagTypes(): Promise<TagType[]> {
	const { data, error } = await supabase
		.from('tag_types')
		.select('*')
		.order('sort_order');
	if (error) throw error;
	return (data ?? []) as TagType[];
}

export async function createTagType(
	name: string,
	css: string,
	sortOrder: number
): Promise<TagType> {
	const { data, error } = await supabase
		.from('tag_types')
		.insert({ tag_type_name: name, tag_type_css: css, sort_order: sortOrder } as any)
		.select()
		.single();
	if (error) throw error;
	return data as TagType;
}

export async function updateTagType(
	id: number,
	fields: { tag_type_name?: string; tag_type_css?: string; sort_order?: number }
): Promise<TagType> {
	const { data, error } = await supabase
		.from('tag_types')
		// @ts-expect-error – Supabase generics resolve Update type to never for tag_types
		.update(fields)
		.eq('tag_type_id', id)
		.select()
		.single();
	if (error) throw error;
	return data as TagType;
}

export async function deleteTagType(id: number): Promise<void> {
	// First delete all tags belonging to this type
	const { error: tagErr } = await supabase
		.from('tags')
		.delete()
		.eq('tag_type_id', id);
	if (tagErr) throw tagErr;

	const { error } = await supabase
		.from('tag_types')
		.delete()
		.eq('tag_type_id', id);
	if (error) throw error;
}

// ── Tags ──

export async function getTagsByType(tagTypeId: number): Promise<Tag[]> {
	const { data, error } = await supabase
		.from('tags')
		.select('*')
		.eq('tag_type_id', tagTypeId)
		.order('tag_sort')
		.order('tag_name');
	if (error) throw error;
	return (data ?? []) as Tag[];
}

export async function createTag(fields: {
	tag_name: string;
	tag_label: string;
	tag_css: string;
	tag_sort: number;
	tag_type_id: number;
}): Promise<Tag> {
	const { data, error } = await supabase
		.from('tags')
		.insert(fields as any)
		.select()
		.single();
	if (error) throw error;
	return data as Tag;
}

export async function updateTag(
	id: number,
	fields: {
		tag_name?: string;
		tag_label?: string;
		tag_css?: string;
		tag_sort?: number;
		tag_type_id?: number;
	}
): Promise<Tag> {
	const { data, error } = await supabase
		.from('tags')
		// @ts-expect-error – Supabase generics resolve Update type to never for tags
		.update(fields)
		.eq('tag_id', id)
		.select()
		.single();
	if (error) throw error;
	return data as Tag;
}

export async function deleteTag(id: number): Promise<void> {
	// First delete all move-to-tag mappings for this tag
	const { error: mapErr } = await supabase
		.from('moves_to_tags')
		.delete()
		.eq('tag_id', id);
	if (mapErr) throw mapErr;

	const { error } = await supabase
		.from('tags')
		.delete()
		.eq('tag_id', id);
	if (error) throw error;
}
