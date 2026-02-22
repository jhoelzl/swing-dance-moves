import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Set to true when required Supabase credentials are missing.
 * The app should show a clear error UI instead of silently failing.
 */
export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey;

if (supabaseConfigError) {
	console.error(
		'[Supabase] Missing environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set. ' +
		'The app cannot connect to the database. Please create a .env file with the required values.'
	);
}

export const supabase = createClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '');
