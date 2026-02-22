import { supabase } from '$lib/supabase';
import type { Move, MoveFormData } from '$lib/types';
import { createMove } from './moves';

// ── Export types ──

export interface ExportMove {
	name: string;
	synonyms: string;
	description: string;
	tags: string[]; // tag names
}

export interface ExportPayload {
	version: 1;
	exported_at: string;
	moves: ExportMove[];
}

// ── Helpers ──

function buildExportMoves(moves: Move[]): ExportMove[] {
	return moves.map((m) => ({
		name: m.name,
		synonyms: m.synonyms ?? '',
		description: m.description ?? '',
		tags: (m.tags ?? []).map((t) => t.tag_name)
	}));
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function timestamp(): string {
	return new Date().toISOString().slice(0, 10); // e.g. 2026-02-22
}

// ── CSV helpers ──

/** Escape a value for CSV (RFC 4180) */
function csvEscape(val: string): string {
	if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
		return `"${val.replace(/"/g, '""')}"`;
	}
	return val;
}

/** Parse a single CSV line respecting quoted fields */
function parseCsvLine(line: string): string[] {
	const fields: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === '"') {
				if (i + 1 < line.length && line[i + 1] === '"') {
					current += '"';
					i++; // skip escaped quote
				} else {
					inQuotes = false;
				}
			} else {
				current += ch;
			}
		} else {
			if (ch === '"') {
				inQuotes = true;
			} else if (ch === ',') {
				fields.push(current);
				current = '';
			} else {
				current += ch;
			}
		}
	}
	fields.push(current);
	return fields;
}

// ── Export ──

/**
 * Export moves as JSON and trigger a download.
 */
export function exportMovesAsJson(moves: Move[]) {
	const payload: ExportPayload = {
		version: 1,
		exported_at: new Date().toISOString(),
		moves: buildExportMoves(moves)
	};

	const json = JSON.stringify(payload, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	downloadBlob(blob, `swing-moves-${timestamp()}.json`);
}

/**
 * Export moves as CSV and trigger a download.
 * Columns: name, synonyms, description, tags (semicolon-separated)
 */
export function exportMovesAsCsv(moves: Move[]) {
	const rows = buildExportMoves(moves);
	const header = 'name,synonyms,description,tags';
	const lines = rows.map(
		(r) =>
			[
				csvEscape(r.name),
				csvEscape(r.synonyms),
				csvEscape(r.description),
				csvEscape(r.tags.join('; '))
			].join(',')
	);

	const csv = [header, ...lines].join('\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	downloadBlob(blob, `swing-moves-${timestamp()}.csv`);
}

// ── Import ──

/**
 * Read a File object as text.
 */
function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}

/**
 * Resolve tag names to tag IDs.
 * Returns a map of lowercase tag_name → tag_id.
 */
async function getTagNameMap(): Promise<Map<string, number>> {
	const { data: tags, error } = await supabase.from('tags').select('tag_id, tag_name');
	if (error) throw error;
	const map = new Map<string, number>();
	for (const t of (tags ?? []) as { tag_id: number; tag_name: string }[]) {
		map.set(t.tag_name.toLowerCase(), t.tag_id);
	}
	return map;
}

export interface ImportResult {
	imported: number;
	skipped: number;
	errors: string[];
}

/**
 * Import moves from a JSON or CSV file.
 * Skips moves whose name already exists (case-insensitive).
 */
export async function importMoves(file: File, existingMoves: Move[]): Promise<ImportResult> {
	const text = await readFileAsText(file);
	const isJson = file.name.endsWith('.json') || file.type === 'application/json';
	const isCsv = file.name.endsWith('.csv') || file.type === 'text/csv';

	if (!isJson && !isCsv) {
		throw new Error('Unsupported file format. Please use .json or .csv files.');
	}

	let movesToImport: ExportMove[];

	if (isJson) {
		movesToImport = parseJsonImport(text);
	} else {
		movesToImport = parseCsvImport(text);
	}

	if (movesToImport.length === 0) {
		return { imported: 0, skipped: 0, errors: ['No moves found in file.'] };
	}

	// Get existing move names for deduplication
	const existingNames = new Set(existingMoves.map((m) => m.name.toLowerCase()));

	// Get tag name → ID map
	const tagNameMap = await getTagNameMap();

	const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

	for (const move of movesToImport) {
		// Skip duplicates
		if (existingNames.has(move.name.toLowerCase())) {
			result.skipped++;
			continue;
		}

		// Resolve tag IDs
		const tagIds: number[] = [];
		for (const tagName of move.tags) {
			const tagId = tagNameMap.get(tagName.toLowerCase());
			if (tagId) {
				tagIds.push(tagId);
			}
			// Silently skip unknown tags
		}

		const formData: MoveFormData = {
			name: move.name,
			synonyms: move.synonyms,
			description: move.description,
			tagIds,
			videoRefs: []
		};

		try {
			await createMove(formData);
			existingNames.add(move.name.toLowerCase());
			result.imported++;
		} catch (err) {
			result.errors.push(`Failed to import "${move.name}": ${(err as Error).message}`);
		}
	}

	return result;
}

function parseJsonImport(text: string): ExportMove[] {
	const data = JSON.parse(text);
	// Support both { moves: [...] } and bare array
	const moves = Array.isArray(data) ? data : data.moves;
	if (!Array.isArray(moves)) {
		throw new Error('Invalid JSON: expected an array of moves or { moves: [...] }');
	}
	return moves.map((m: any) => ({
		name: String(m.name ?? ''),
		synonyms: String(m.synonyms ?? ''),
		description: String(m.description ?? ''),
		tags: Array.isArray(m.tags) ? m.tags.map(String) : []
	}));
}

function parseCsvImport(text: string): ExportMove[] {
	const lines = text.split(/\r?\n/).filter((l) => l.trim());
	if (lines.length < 2) return []; // need header + at least 1 row

	// Skip header row
	return lines.slice(1).map((line) => {
		const fields = parseCsvLine(line);
		return {
			name: (fields[0] ?? '').trim(),
			synonyms: (fields[1] ?? '').trim(),
			description: (fields[2] ?? '').trim(),
			tags: (fields[3] ?? '')
				.split(';')
				.map((t) => t.trim())
				.filter(Boolean)
		};
	}).filter((m) => m.name.length > 0); // skip empty rows
}
