import { get } from 'svelte/store';
import { userSettings } from '$lib/stores';

/**
 * Translation dictionary for all UI strings.
 * Keys are grouped by area for easier maintenance.
 */
const translations: Record<string, { de: string; en: string }> = {
  // ── Layout / Navigation ──
  'loading_failed': { de: 'Laden fehlgeschlagen', en: 'Loading Failed' },
  'try_again': { de: 'Erneut versuchen', en: 'Try Again' },
  'config_error': { de: 'Konfigurationsfehler', en: 'Configuration Error' },
  'config_error_desc': {
    de: 'Die Supabase-Umgebungsvariablen sind nicht konfiguriert. Die App kann keine Verbindung zur Datenbank herstellen.',
    en: 'The Supabase environment variables are not configured. The app cannot connect to the database.',
  },
  'data_load_error': {
    de: 'Daten konnten nicht geladen werden. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
    en: 'Data could not be loaded. Please check your internet connection and try again.',
  },
  'toggle_dark_mode': { de: 'Dunkelmodus umschalten', en: 'Toggle Dark Mode' },
  'logout': { de: 'Abmelden', en: 'Logout' },
  'login': { de: 'Anmelden', en: 'Login' },
  'nav_moves': { de: 'Moves', en: 'Moves' },
  'nav_random': { de: 'Mir fällt nichts ein', en: 'Out of moves!' },
  'nav_videos': { de: 'Videos', en: 'Videos' },
  'nav_tags': { de: 'Tags', en: 'Tags' },
  'nav_settings': { de: 'Einstellungen', en: 'Settings' },
  'sign_in_prompt': { de: 'Bitte melde dich an, um Moves zu sehen.', en: 'Please sign in to view moves.' },
  'sign_in': { de: 'Anmelden', en: 'Sign In' },
  'add_move': { de: 'Move hinzufügen', en: 'Add Move' },
  'add_video': { de: 'Video hinzufügen', en: 'Add Video' },
  'new_move': { de: 'Neuer Move', en: 'New Move' },

  // ── Login Page ──
  'welcome_back': { de: 'Willkommen zurück', en: 'Welcome back' },
  'sign_in_subtitle': { de: 'Melde dich an, um auf deine Moves zuzugreifen', en: 'Sign in to access your moves' },
  'email': { de: 'E-Mail', en: 'Email' },
  'password': { de: 'Passwort', en: 'Password' },
  'sign_in_button': { de: 'Anmelden', en: 'Sign in' },
  'signing_in': { de: 'Anmeldung läuft...', en: 'Signing in...' },
  'forgot_password': { de: 'Passwort vergessen?', en: 'Forgot password?' },
  'sending': { de: 'Wird gesendet...', en: 'Sending...' },
  'reset_email_sent': { de: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.', en: 'A password reset email has been sent.' },
  'enter_email_first': { de: 'Bitte gib zuerst eine E-Mail-Adresse ein.', en: 'Please enter an email address first.' },
  'unexpected_error': { de: 'Ein unerwarteter Fehler ist aufgetreten.', en: 'An unexpected error occurred.' },
  'reset_failed': { de: 'E-Mail zum Zurücksetzen konnte nicht gesendet werden.', en: 'Failed to send password reset email.' },

  // ── Moves Page ──
  'search_moves': { de: 'Moves suchen...', en: 'Search moves...' },
  'filter': { de: 'Filter', en: 'Filter' },
  'reset': { de: 'Zurücksetzen', en: 'Reset' },
  'out_of_moves': { de: 'Mir fällt nichts ein!', en: 'Out of moves!' },
  'show_all_moves': { de: 'Alle Moves anzeigen', en: 'Show all moves' },
  'no_moves_found': { de: 'Keine Moves gefunden', en: 'No moves found' },
  'adjust_filters': { de: 'Versuche, deine Filter oder Suche anzupassen.', en: 'Try adjusting your filters or search.' },
  'importing_moves': { de: 'Moves werden importiert…', en: 'Importing moves…' },
  'media': { de: 'Medien', en: 'Media' },
  'move_singular': { de: 'Move', en: 'Move' },
  'move_plural': { de: 'Moves', en: 'Moves' },
  'newest': { de: 'Neueste', en: 'Newest' },
  'oldest': { de: 'Älteste', en: 'Oldest' },
  'export': { de: 'Exportieren', en: 'Export' },
  'import': { de: 'Importieren', en: 'Import' },
  'as_json': { de: 'Als JSON', en: 'As JSON' },
  'as_csv': { de: 'Als CSV', en: 'As CSV' },
  'import_json_csv': { de: 'JSON / CSV importieren', en: 'Import JSON / CSV' },
  'export_import': { de: 'Exportieren / Importieren', en: 'Export / Import' },
  'export_all_data': { de: 'Alle Daten exportieren', en: 'Export all data' },
  'export_all_desc': { de: 'Exportiert alle Daten (Moves, Videos, Tags, Kategorien, Verknüpfungen) als JSON-Backup.', en: 'Exports all data (moves, videos, tags, categories, links) as a JSON backup.' },
  'export_success': { de: 'Daten erfolgreich exportiert', en: 'Data exported successfully' },
  'export_failed': { de: 'Export fehlgeschlagen', en: 'Export failed' },
  'exporting': { de: 'Exportiere…', en: 'Exporting…' },
  'pick_random_moves': { de: 'Zufällige Moves auswählen', en: 'Pick random moves' },
  'moves_imported': { de: 'Move(s) importiert', en: 'move(s) imported' },
  'skipped_exists': { de: 'übersprungen (bereits vorhanden)', en: 'skipped (already exists)' },
  'errors': { de: 'Fehler', en: 'error(s)' },
  'import_failed': { de: 'Import fehlgeschlagen', en: 'Import failed' },

  // ── Videos Page ──
  'search_videos': { de: 'Videos suchen...', en: 'Search videos...' },
  'new_video': { de: 'Neues Video', en: 'New Video' },
  'move_link': { de: 'Move-Verknüpfung', en: 'Move Link' },
  'all': { de: 'Alle', en: 'All' },
  'with_moves': { de: 'Mit Moves', en: 'With Moves' },
  'without_moves': { de: 'Ohne Moves', en: 'Without Moves' },
  'no_videos_found': { de: 'Keine Videos gefunden', en: 'No videos found' },
  'video_singular': { de: 'Video', en: 'Video' },
  'video_plural': { de: 'Videos', en: 'Videos' },

  // ── Tags Page ──
  'manage_tags': { de: 'Tags verwalten', en: 'Manage Tags' },
  'new_category': { de: 'Neue Kategorie', en: 'New Category' },
  'create_new_category': { de: 'Neue Kategorie erstellen', en: 'Create New Category' },
  'loading_tags': { de: 'Tags werden geladen...', en: 'Loading tags...' },
  'name': { de: 'Name', en: 'Name' },
  'css_class': { de: 'CSS-Klasse', en: 'CSS Class' },
  'order': { de: 'Reihenfolge', en: 'Order' },
  'create': { de: 'Erstellen', en: 'Create' },
  'cancel': { de: 'Abbrechen', en: 'Cancel' },
  'save': { de: 'Speichern', en: 'Save' },
  'delete': { de: 'Löschen', en: 'Delete' },
  'color': { de: 'Farbe', en: 'Color' },
  'css_optional': { de: 'CSS (optional)', en: 'CSS (optional)' },
  'preview': { de: 'Vorschau', en: 'Preview' },
  'tag_singular': { de: 'Tag', en: 'Tag' },
  'tags_plural': { de: 'Tags', en: 'Tags' },
  'pos': { de: 'Pos', en: 'Pos' },
  'no_tags_category': { de: 'Keine Tags in dieser Kategorie.', en: 'No tags in this category.' },
  'no_categories_yet': { de: 'Noch keine Tag-Kategorien.', en: 'No tag categories yet.' },
  'create_category_hint': { de: 'Erstelle eine neue Kategorie, um Tags zu verwalten.', en: 'Create a new category to manage tags.' },
  'edit_category': { de: 'Kategorie bearbeiten', en: 'Edit category' },
  'add_tag': { de: 'Tag hinzufügen', en: 'Add tag' },
  'delete_category': { de: 'Kategorie löschen', en: 'Delete category' },
  'edit_tag': { de: 'Tag bearbeiten', en: 'Edit tag' },
  'delete_tag': { de: 'Tag löschen', en: 'Delete tag' },
  'tag_name_placeholder': { de: 'Tag-Name', en: 'Tag name' },
  'category_updated': { de: 'Kategorie aktualisiert.', en: 'Category updated.' },
  'category_deleted': { de: 'Kategorie gelöscht.', en: 'Category deleted.' },
  'new_category_created': { de: 'Neue Kategorie erstellt.', en: 'New category created.' },
  'tag_updated': { de: 'Tag aktualisiert.', en: 'Tag updated.' },
  'tag_deleted': { de: 'Tag gelöscht.', en: 'Tag deleted.' },
  'new_tag_created': { de: 'Neuer Tag erstellt.', en: 'New tag created.' },
  'failed_load_tags': { de: 'Tags konnten nicht geladen werden.', en: 'Failed to load tags.' },
  'confirm_delete_category': { de: 'Kategorie löschen', en: 'Delete category' },
  'confirm_delete_tag_msg': { de: 'Tag löschen?', en: 'Delete tag?' },
  'delete_blocked_tag_group_has_tags': { de: 'Diese Kategorie kann nicht gelöscht werden, solange noch Tags darin enthalten sind.', en: 'This category cannot be deleted while it still contains tags.' },
  'delete_blocked_tag_in_use': { de: 'Dieses Tag kann nicht gelöscht werden, solange es noch Moves zugeordnet ist.', en: 'This tag cannot be deleted while it is still assigned to moves.' },
  'delete_blocked_video_in_use': { de: 'Dieses Video kann nicht gelöscht werden, solange es noch mit Moves verknüpft ist.', en: 'This video cannot be deleted while it is still linked to moves.' },

  // ── MoveCard ──
  'delete_move': { de: 'Move löschen', en: 'Delete Move' },
  'deleting': { de: 'Wird gelöscht...', en: 'Deleting...' },
  'linked_videos': { de: 'Verknüpfte Videos', en: 'Linked Videos' },
  'move_deleted': { de: 'Move erfolgreich gelöscht', en: 'Move deleted successfully' },
  'move_delete_failed': { de: 'Move konnte nicht gelöscht werden', en: 'Failed to delete move' },
  'edit_move': { de: 'Move bearbeiten', en: 'Edit Move' },
  'confirm_delete_move': { de: 'Bist du sicher, dass du diesen Move löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.', en: 'Are you sure you want to delete this move? This action cannot be undone.' },

  // ── VideoCard ──
  'delete_video': { de: 'Video löschen', en: 'Delete Video' },
  'linked_moves': { de: 'Verknüpfte Moves', en: 'Linked Moves' },
  'video_deleted': { de: 'Video erfolgreich gelöscht', en: 'Video deleted successfully' },
  'video_delete_failed': { de: 'Video konnte nicht gelöscht werden', en: 'Failed to delete video' },
  'edit_video': { de: 'Video bearbeiten', en: 'Edit Video' },
  'watch_video': { de: 'Video ansehen', en: 'Watch Video' },
  'confirm_delete_video': { de: 'Bist du sicher, dass du dieses Video löschen möchtest? Falls noch Move-Verknüpfungen bestehen, wird das Löschen blockiert.', en: 'Are you sure you want to delete this video? Deletion will be blocked while move links still exist.' },

  // ── MoveForm ──
  'synonyms': { de: 'Synonyme', en: 'Synonyms' },
  'description': { de: 'Beschreibung', en: 'Description' },
  'other_names_placeholder': { de: 'Andere Namen für diesen Move', en: 'Other names for this move' },
  'description_placeholder': { de: 'Detaillierte Beschreibung für Leaders', en: 'Detailed description for leaders' },
  'video_references': { de: 'Video-Verknüpfungen', en: 'Video References' },
  'add_video_ref': { de: 'Video hinzufügen', en: 'Add Video' },
  'select_video': { de: 'Video auswählen...', en: 'Select video...' },
  'start_optional': { de: 'Start (optional)', en: 'Start (optional)' },
  'end_optional': { de: 'Ende (optional)', en: 'End (optional)' },
  'remove': { de: 'Entfernen', en: 'Remove' },
  'no_videos_linked': { de: 'Keine Videos verknüpft. Klicke auf "Video hinzufügen", um eine Verknüpfung zu erstellen.', en: 'No videos linked. Click "Add Video" to create a reference.' },
  'saving': { de: 'Wird gespeichert...', en: 'Saving...' },
  'save_move': { de: 'Move speichern', en: 'Save Move' },
  'learned_on': { de: 'Gelernt am', en: 'Learned on' },
  'learned_on_optional': { de: 'Optional: Wann hast du diesen Move gelernt?', en: 'Optional: When did you learn this move?' },

  // ── VideoForm ──
  'title': { de: 'Titel', en: 'Title' },
  'video_url': { de: 'Video URL', en: 'Video URL' },
  'video_url_placeholder': { de: 'YouTube oder Dropbox URL einfügen...', en: 'Paste YouTube or Dropbox URL...' },
  'optional_description': { de: 'Optionale Beschreibung...', en: 'Optional description...' },
  'save_video': { de: 'Video speichern', en: 'Save Video' },

  // ── New/Edit Pages ──
  'add_new_move': { de: 'Neuen Move hinzufügen', en: 'Add New Move' },
  'edit_move_title': { de: 'Move bearbeiten', en: 'Edit Move' },
  'new_video_title': { de: 'Neues Video', en: 'New Video' },
  'edit_video_title': { de: 'Video bearbeiten', en: 'Edit Video' },
  'move_created': { de: 'Move erfolgreich erstellt', en: 'Move created successfully' },
  'move_updated': { de: 'Move erfolgreich aktualisiert', en: 'Move updated successfully' },
  'video_created': { de: 'Video erfolgreich erstellt', en: 'Video created successfully' },
  'video_updated': { de: 'Video erfolgreich aktualisiert', en: 'Video updated successfully' },
  'failed_create_move': { de: 'Move konnte nicht erstellt werden', en: 'Failed to create move' },
  'failed_update_move': { de: 'Move konnte nicht aktualisiert werden', en: 'Failed to update move' },
  'failed_create_video': { de: 'Video konnte nicht erstellt werden', en: 'Failed to create video' },
  'failed_update_video': { de: 'Video konnte nicht aktualisiert werden', en: 'Failed to update video' },
  'failed_delete_move': { de: 'Move konnte nicht gelöscht werden', en: 'Failed to delete move' },
  'failed_delete_video': { de: 'Video konnte nicht gelöscht werden', en: 'Failed to delete video' },
  'invalid_move_id': { de: 'Ungültige Move-ID', en: 'Invalid move ID' },
  'invalid_video_id': { de: 'Ungültige Video-ID', en: 'Invalid video ID' },

  // ── ConfirmModal ──
  'confirmation': { de: 'Bestätigung', en: 'Confirmation' },

  // ── Settings Page ──
  'settings': { de: 'Einstellungen', en: 'Settings' },
  'language': { de: 'Sprache', en: 'Language' },
  'language_desc': { de: 'Wähle die Anzeigesprache der App.', en: 'Choose the display language of the app.' },
  'random_moves_count': { de: 'Anzahl zufälliger Moves', en: 'Number of Random Moves' },
  'random_moves_desc': { de: 'Wie viele Moves sollen bei "Zufällige Moves" angezeigt werden?', en: 'How many moves should be shown when using "Random Moves"?' },
  'settings_saved': { de: 'Einstellungen gespeichert', en: 'Settings saved' },
  'settings_save_failed': { de: 'Fehler beim Speichern der Einstellungen', en: 'Failed to save settings' },

  // ── Random Page ──
  'random_title': { de: 'Mir fällt nichts ein! 🎲', en: 'I\'m out of ideas! 🎲' },
  'random_subtitle': { de: 'Hier sind zufällige Moves für dich:', en: 'Here are some random moves for you:' },
  'random_shuffle': { de: 'Neue Moves würfeln', en: 'Shuffle new moves' },
  'random_empty': { de: 'Keine Moves verfügbar', en: 'No moves available' },
  'random_empty_desc': { de: 'Erstelle zuerst ein paar Moves, damit wir dir welche vorschlagen können.', en: 'Create some moves first so we can suggest them to you.' },
  'random_filter_hint': { de: 'Filtere nach Tags, um die Auswahl einzugrenzen.', en: 'Filter by tags to narrow the selection.' },

  // ── Color labels ──
  'color_green': { de: 'Grün', en: 'Green' },
  'color_red': { de: 'Rot', en: 'Red' },
  'color_yellow': { de: 'Gelb', en: 'Yellow' },
  'color_blue': { de: 'Blau', en: 'Blue' },
  'color_gray': { de: 'Grau', en: 'Gray' },
  'color_light': { de: 'Hell', en: 'Light' },

  // ── Sessions Page ──
  'nav_sessions': { de: 'Sessions', en: 'Sessions' },
  'sessions_title': { de: 'Training-Sessions', en: 'Training Sessions' },
  'new_session': { de: 'Neue Session', en: 'New Session' },
  'create_session': { de: 'Session erstellen', en: 'Create Session' },
  'edit_session': { de: 'Session bearbeiten', en: 'Edit Session' },
  'delete_session': { de: 'Session löschen', en: 'Delete Session' },
  'session_name': { de: 'Session-Name', en: 'Session Name' },
  'session_name_placeholder': { de: 'z.B. Dienstag-Training', en: 'e.g. Tuesday Practice' },
  'session_date': { de: 'Datum', en: 'Date' },
  'session_notes': { de: 'Notizen', en: 'Notes' },
  'session_notes_placeholder': { de: 'Optionale Notizen zur Session...', en: 'Optional notes for this session...' },
  'session_moves': { de: 'Moves', en: 'Moves' },
  'session_no_moves': { de: 'Noch keine Moves zugewiesen.', en: 'No moves assigned yet.' },
  'session_add_move': { de: 'Move hinzufügen', en: 'Add Move' },
  'session_select_move': { de: 'Move auswählen...', en: 'Select move...' },
  'session_created': { de: 'Session erstellt', en: 'Session created' },
  'session_updated': { de: 'Session aktualisiert', en: 'Session updated' },
  'session_deleted': { de: 'Session gelöscht', en: 'Session deleted' },
  'session_create_failed': { de: 'Session konnte nicht erstellt werden', en: 'Failed to create session' },
  'session_update_failed': { de: 'Session konnte nicht aktualisiert werden', en: 'Failed to update session' },
  'session_delete_failed': { de: 'Session konnte nicht gelöscht werden', en: 'Failed to delete session' },
  'session_move_add_failed': { de: 'Move konnte nicht hinzugefügt werden', en: 'Failed to add move' },
  'session_move_remove_failed': { de: 'Move konnte nicht entfernt werden', en: 'Failed to remove move' },
  'confirm_delete_session': { de: 'Session löschen? Alle Move-Zuweisungen werden entfernt.', en: 'Delete session? All move assignments will be removed.' },
  'no_sessions_yet': { de: 'Noch keine Training-Sessions.', en: 'No training sessions yet.' },
  'no_sessions_hint': { de: 'Erstelle eine neue Session, um Moves zum Üben zuzuweisen.', en: 'Create a new session to assign moves for practice.' },
  'session_singular': { de: 'Session', en: 'Session' },
  'sessions_plural': { de: 'Sessions', en: 'Sessions' },
  'session_move_count': { de: 'Moves', en: 'Moves' },

  // ── Calendar Page ──
  'nav_calendar': { de: 'Kalender', en: 'Calendar' },
  'calendar_title': { de: 'Trainingskalender', en: 'Training Calendar' },
  'calendar_subtitle': { de: 'Sessions und gelernte Moves im Monatsüberblick', en: 'Sessions and learned moves in a monthly overview' },
  'calendar_prev_month': { de: 'Vorheriger Monat', en: 'Previous month' },
  'calendar_next_month': { de: 'Nächster Monat', en: 'Next month' },
  'calendar_today': { de: 'Heute', en: 'Today' },
  'calendar_sessions': { de: 'Sessions', en: 'Sessions' },
  'calendar_learned_moves': { de: 'Gelernte Moves', en: 'Learned moves' },
  'calendar_no_events': { de: 'Keine Einträge in diesem Monat.', en: 'No entries in this month.' },

  // ── MoveCard Sessions ──
  'linked_sessions': { de: 'Verknüpfte Sessions', en: 'Linked Sessions' },
  'move_add_to_session': { de: 'Zur Session hinzufügen', en: 'Add to Session' },
  'move_select_session': { de: 'Session auswählen...', en: 'Select session...' },
  'move_added_to_session': { de: 'Move zur Session hinzugefügt', en: 'Move added to session' },
  'move_add_to_session_failed': { de: 'Konnte nicht zur Session hinzugefügt werden', en: 'Failed to add to session' },
  'move_remove_from_session_failed': { de: 'Konnte nicht aus Session entfernt werden', en: 'Failed to remove from session' },
  'no_linked_sessions': { de: 'Noch keiner Session zugewiesen.', en: 'Not assigned to any session yet.' },

  // ── Move sort (sessions picker) ──
  'session_move_sort': { de: 'Sortierung', en: 'Sort' },
  'sort_a_z': { de: 'A–Z', en: 'A–Z' },
  'sort_z_a': { de: 'Z–A', en: 'Z–A' },
  'sort_newest': { de: 'Neueste', en: 'Newest' },
  'sort_oldest': { de: 'Älteste', en: 'Oldest' },
};

/**
 * Get the current language from user settings, defaulting to 'de'.
 */
export function getLang(): 'de' | 'en' {
  return get(userSettings)?.language ?? 'de';
}

/**
 * Translate a key to the current language.
 * Falls back to English if key not found.
 */
export function t(key: string): string {
  const lang = getLang();
  const entry = translations[key];
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`);
    return key;
  }
  return entry[lang] ?? entry.en ?? key;
}
