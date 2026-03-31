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
	learned_on: string | null; // ISO date string, e.g. '2026-03-28'
	// Joined fields
	tags?: Tag[];
	videoRefs?: MoveToVideo[];
	hasVideo?: boolean;
}

interface MoveToTag {
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
	learned_on: string;
	tagIds: number[];
	videoRefs: MoveVideoRef[];
}

// Training session (practice session with a set of moves to learn)
export interface Session {
	session_id: number;
	name: string;
	session_date: string; // ISO date string, e.g. '2026-03-28'
	notes: string;
	created_at: string;
	// Joined fields
	moves?: Move[];
}

interface SessionToMove {
	id: number;
	session_id: number;
	move_id: number;
}

export interface SessionFormData {
	name: string;
	session_date: string;
	notes: string;
}

interface DbSessionRow {
	session_id: number;
	name: string;
	session_date: string;
	notes: string;
	created_at: string;
}

interface DbSessionToMoveRow {
	id: number;
	session_id: number;
	move_id: number;
}

interface DbTagTypeRow {
	tag_type_id: number;
	tag_type_name: string;
	sort_order: number;
	tag_type_css: string;
}

interface DbTagRow {
	tag_id: number;
	tag_type_id: number;
	tag_name: string;
	tag_label: string;
	tag_css: string;
	tag_sort: number;
}

interface DbMoveRow {
	move_id: number;
	name: string;
	synonyms: string | null;
	description: string | null;
	learned_on: string | null;
}

interface DbMoveToTagRow {
	id: number;
	move_id: number;
	tag_id: number;
}

interface DbVideoRow {
	video_id: number;
	title: string;
	url: string;
	description: string | null;
	created_at: string;
}

interface DbMoveToVideoRow {
	id: number;
	move_id: number;
	video_id: number;
	start_time: string | null;
	end_time: string | null;
}

interface DbUserSettingsRow {
	id: number;
	user_id: string;
	language: 'de' | 'en';
	random_moves_count: number;
	created_at: string;
	updated_at: string;
}

// Database schema type for Supabase client
export interface Database {
	public: {
		Tables: {
			tag_types: {
				Row: DbTagTypeRow;
				Insert: Omit<DbTagTypeRow, 'tag_type_id'> & { tag_type_id?: number };
				Update: Partial<Omit<DbTagTypeRow, 'tag_type_id'>>;
				Relationships: [];
			};
			tags: {
				Row: DbTagRow;
				Insert: Omit<DbTagRow, 'tag_id'> & { tag_id?: number };
				Update: Partial<Omit<DbTagRow, 'tag_id'>>;
				Relationships: [];
			};
			moves: {
				Row: DbMoveRow;
				Insert: Omit<DbMoveRow, 'move_id'> & { move_id?: number };
				Update: Partial<Omit<DbMoveRow, 'move_id'>>;
				Relationships: [];
			};
			moves_to_tags: {
				Row: DbMoveToTagRow;
				Insert: Omit<DbMoveToTagRow, 'id'> & { id?: number };
				Update: Partial<Omit<DbMoveToTagRow, 'id'>>;
				Relationships: [];
			};
			videos: {
				Row: DbVideoRow;
				Insert: Omit<DbVideoRow, 'video_id' | 'created_at'> & { video_id?: number; created_at?: string };
				Update: Partial<Omit<DbVideoRow, 'video_id' | 'created_at'>>;
				Relationships: [];
			};
			moves_to_videos: {
				Row: DbMoveToVideoRow;
				Insert: Omit<DbMoveToVideoRow, 'id'> & { id?: number };
				Update: Partial<Omit<DbMoveToVideoRow, 'id'>>;
				Relationships: [];
			};
			user_settings: {
				Row: DbUserSettingsRow;
				Insert: Omit<DbUserSettingsRow, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string };
				Update: Partial<Omit<DbUserSettingsRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
				Relationships: [];
			};
			training_sessions: {
				Row: DbSessionRow;
				Insert: Omit<DbSessionRow, 'session_id' | 'created_at'> & { session_id?: number; created_at?: string };
				Update: Partial<Omit<DbSessionRow, 'session_id' | 'created_at'>>;
				Relationships: [];
			};
			session_to_moves: {
				Row: DbSessionToMoveRow;
				Insert: Omit<DbSessionToMoveRow, 'id'> & { id?: number };
				Update: Partial<Omit<DbSessionToMoveRow, 'id'>>;
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}
