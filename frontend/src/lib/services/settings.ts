import { supabase } from '$lib/supabase';
import type { UserSettings } from '$lib/types';

/** Default settings for new users */
const DEFAULT_SETTINGS: Pick<UserSettings, 'language' | 'random_moves_count'> = {
	language: 'de',
	random_moves_count: 2
};

/**
 * Load user settings from Supabase.
 * Creates default settings if none exist yet.
 */
export async function getUserSettings(): Promise<UserSettings> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const { data, error } = await supabase
		.from('user_settings')
		.select('*')
		.eq('user_id', user.id)
		.single();

	if (error && error.code === 'PGRST116') {
		// No settings row found — create defaults
		return await createDefaultSettings(user.id);
	}

	if (error) throw error;
	return data as UserSettings;
}

/**
 * Create default settings for a new user.
 */
async function createDefaultSettings(userId: string): Promise<UserSettings> {
	const { data, error } = await supabase
		.from('user_settings')
		// @ts-expect-error – Supabase generics resolve Insert type to never for user_settings
		.insert({
			user_id: userId,
			language: DEFAULT_SETTINGS.language,
			random_moves_count: DEFAULT_SETTINGS.random_moves_count
		})
		.select()
		.single();

	if (error) throw error;
	return data as UserSettings;
}

/**
 * Update user settings (partial update).
 */
export async function updateUserSettings(
	updates: Partial<Pick<UserSettings, 'language' | 'random_moves_count'>>
): Promise<UserSettings> {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Not authenticated');

	const { data, error } = await supabase
		.from('user_settings')
		// @ts-expect-error – Supabase generics resolve Update type to never for user_settings
		.update(updates)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) throw error;
	return data as UserSettings;
}
