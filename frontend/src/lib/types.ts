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
	synonyms: string | null;
	description: string | null;
	// Joined fields
	tags?: Tag[];
	videoRefs?: MoveToVideo[];
	hasVideo?: boolean;
}

export interface MoveToTag {
	id: number;
	move_id: number;
	tag_id: number;
}

export interface Video {
	video_id: number;
	title: string;
	url: string;
	description: string | null;
	created_at: string;
}

export interface MoveToVideo {
	id: number;
	move_id: number;
	video_id: number;
	start_time: string; // e.g. '10:01'
	end_time: string;   // e.g. '10:30'
	// Joined field
	video?: Video;
}

export interface VideoFormData {
	title: string;
	url: string;
	description: string;
}

export interface MoveVideoRef {
	video_id: number;
	start_time: string;
	end_time: string;
}

// User settings stored in Supabase
export interface UserSettings {
	id: number;
	user_id: string;
	language: 'de' | 'en';
	random_moves_count: number;
	created_at: string;
	updated_at: string;
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
	tagIds: number[];
	videoRefs: MoveVideoRef[];
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
			videos: {
				Row: Video;
				Insert: Omit<Video, 'video_id' | 'created_at'> & { video_id?: number; created_at?: string };
				Update: Partial<Video>;
			};
			moves_to_videos: {
				Row: MoveToVideo;
				Insert: Omit<MoveToVideo, 'id'> & { id?: number };
				Update: Partial<MoveToVideo>;
			};
		};
			user_settings: {
				Row: UserSettings;
				Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string };
				Update: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
			};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
