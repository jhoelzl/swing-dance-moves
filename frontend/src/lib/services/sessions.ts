import { supabase } from '$lib/supabase';
import type { Session, SessionFormData, Move } from '$lib/types';

const db: any = supabase;

/**
 * Fetch all training sessions ordered by date descending, with their assigned moves.
 */
export async function getAllSessions(): Promise<Session[]> {
	const { data: sessions, error } = await db
		.from('training_sessions')
		.select('*')
		.order('session_date', { ascending: false });

	if (error) throw error;
	if (!sessions || sessions.length === 0) return [];

	// Fetch all session-to-move mappings
	const sessionIds = sessions.map((s: any) => s.session_id);
	const { data: mappings, error: mapError } = await db
		.from('session_to_moves')
		.select('session_id, move_id')
		.in('session_id', sessionIds);

	if (mapError) throw mapError;

	// Fetch all referenced moves
	const moveIds = [...new Set((mappings ?? []).map((m: any) => m.move_id as number))];
	let moveMap = new Map<number, Move>();

	if (moveIds.length > 0) {
		const { data: moves, error: movesError } = await db
			.from('moves')
			.select('*')
			.in('move_id', moveIds);

		if (movesError) throw movesError;
		for (const move of moves ?? []) {
			moveMap.set(move.move_id, move as Move);
		}
	}

	// Build session-to-moves lookup
	const sessionMoveMap = new Map<number, Move[]>();
	for (const mapping of mappings ?? []) {
		const move = moveMap.get(mapping.move_id);
		if (move) {
			if (!sessionMoveMap.has(mapping.session_id)) {
				sessionMoveMap.set(mapping.session_id, []);
			}
			sessionMoveMap.get(mapping.session_id)!.push(move);
		}
	}

	return sessions.map((s: any) => ({
		...s,
		moves: (sessionMoveMap.get(s.session_id) ?? []).sort((a: Move, b: Move) =>
			a.name.localeCompare(b.name, 'de')
		)
	}));
}

/**
 * Create a new training session.
 */
export async function createSession(data: SessionFormData): Promise<Session> {
	const { data: session, error } = await db
		.from('training_sessions')
		.insert({ name: data.name.trim(), session_date: data.session_date, notes: data.notes.trim() })
		.select()
		.single();

	if (error) throw error;
	return { ...session, moves: [] };
}

/**
 * Update an existing training session's name, date and notes.
 */
export async function updateSession(id: number, data: Partial<SessionFormData>): Promise<void> {
	const update: Record<string, unknown> = {};
	if (data.name !== undefined) update.name = data.name.trim();
	if (data.session_date !== undefined) update.session_date = data.session_date;
	if (data.notes !== undefined) update.notes = data.notes.trim();

	const { error } = await db.from('training_sessions').update(update).eq('session_id', id);
	if (error) throw error;
}

/**
 * Delete a training session (cascades to session_to_moves).
 */
export async function deleteSession(id: number): Promise<void> {
	const { error } = await db.from('training_sessions').delete().eq('session_id', id);
	if (error) throw error;
}

/**
 * Add a move to a session. Silently ignores duplicate assignments (UNIQUE constraint).
 */
export async function addMoveToSession(sessionId: number, moveId: number): Promise<void> {
	const { error } = await db
		.from('session_to_moves')
		.insert({ session_id: sessionId, move_id: moveId });
	// Ignore duplicate key violations (code 23505)
	if (error && error.code !== '23505') throw error;
}

/**
 * Remove a move from a session.
 */
export async function removeMoveFromSession(sessionId: number, moveId: number): Promise<void> {
	const { error } = await db
		.from('session_to_moves')
		.delete()
		.eq('session_id', sessionId)
		.eq('move_id', moveId);
	if (error) throw error;
}

/**
 * Get all sessions that contain a specific move.
 */
export async function getSessionsForMove(moveId: number): Promise<Session[]> {
	const { data: mappings, error: mapError } = await db
		.from('session_to_moves')
		.select('session_id')
		.eq('move_id', moveId);

	if (mapError) throw mapError;
	if (!mappings || mappings.length === 0) return [];

	const sessionIds = mappings.map((m: any) => m.session_id);
	const { data: sessions, error } = await db
		.from('training_sessions')
		.select('*')
		.in('session_id', sessionIds)
		.order('session_date', { ascending: false });

	if (error) throw error;
	return (sessions ?? []).map((s: any) => ({ ...s, moves: [] as Move[] }));
}
