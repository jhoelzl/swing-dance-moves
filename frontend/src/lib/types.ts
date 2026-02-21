// Database types matching the Supabase/PostgreSQL schema

export interface TagType {
	tag_type_id: number;
	tag_type_name: string;
	sort_order: number;
	tag_type_css: string;
}

export interface Tag {
	tag_id: number;
	tag_type_id: number;
	tag_name: string;
	tag_label: string;
	tag_css: string;
	tag_sort: number;
	// Joined field
	tag_type?: TagType;
}

export interface Move {
	move_id: number;
	name: string;
	synonyms: string;
	description: string;
	link: string;
	// Joined fields
	tags?: Tag[];
}

export interface MoveToTag {
	id: number;
	move_id: number;
	tag_id: number;
}

// Grouped tags for UI display
export interface TagGroup {
	tagType: TagType;
	tags: Tag[];
}

// Form data for creating/editing a move
export interface MoveFormData {
	name: string;
	synonyms: string;
	description: string;
	link: string;
	tagIds: number[];
}

// Database schema type for Supabase client
export interface Database {
	public: {
		Tables: {
			tag_types: {
				Row: TagType;
				Insert: Omit<TagType, 'tag_type_id'> & { tag_type_id?: number };
				Update: Partial<TagType>;
			};
			tags: {
				Row: Tag;
				Insert: Omit<Tag, 'tag_id'> & { tag_id?: number };
				Update: Partial<Tag>;
			};
			moves: {
				Row: Move;
				Insert: Omit<Move, 'move_id'> & { move_id?: number };
				Update: Partial<Move>;
			};
			moves_to_tags: {
				Row: MoveToTag;
				Insert: Omit<MoveToTag, 'id'> & { id?: number };
				Update: Partial<MoveToTag>;
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
