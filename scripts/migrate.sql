-- Supabase Migration Script: Swing Dance Moves
-- Converted from MySQL to PostgreSQL syntax
-- Run this in the Supabase SQL Editor

-- ============================================
-- 1. Create Tables
-- ============================================

CREATE TABLE IF NOT EXISTS tag_types (
    tag_type_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_type_name varchar(200) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    tag_type_css varchar(200) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_type_id integer NOT NULL REFERENCES tag_types(tag_type_id),
    tag_name varchar(100) NOT NULL,
    tag_label varchar(20) NOT NULL DEFAULT 'light',
    tag_css varchar(200) NOT NULL DEFAULT '',
    tag_sort integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS moves (
    move_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(200) NOT NULL,
    synonyms varchar(400) NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    link varchar(500) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS moves_to_tags (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    move_id integer NOT NULL REFERENCES moves(move_id) ON DELETE CASCADE,
    tag_id integer NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_moves_to_tags_move_id ON moves_to_tags(move_id);
CREATE INDEX IF NOT EXISTS idx_moves_to_tags_tag_id ON moves_to_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag_type_id ON tags(tag_type_id);

-- ============================================
-- 2. Insert Data
-- ============================================

-- Tag Types
INSERT INTO tag_types (tag_type_id, tag_type_name, sort_order, tag_type_css) OVERRIDING SYSTEM VALUE VALUES
(1, 'Festival / Classes', 3, 'background-color:#00000008;'),
(2, 'Level', 5, ''),
(3, 'Dances', 1, 'background-color:#00000008;'),
(5, 'Technical', 30, 'background-color:#00000008;'),
(6, 'Rating', 2, '');

SELECT setval(pg_get_serial_sequence('tag_types', 'tag_type_id'), (SELECT MAX(tag_type_id) FROM tag_types));

-- Tags
INSERT INTO tags (tag_id, tag_type_id, tag_name, tag_label, tag_css, tag_sort) OVERRIDING SYSTEM VALUE VALUES
(1, 6, 'easy', 'success', '', 1),
(2, 6, 'difficult', 'danger', '', 2),
(3, 6, 'fancy', 'warning', '', 10),
(5, 1, 'C&D', 'light', '', 80),
(7, 5, '6-count', 'light', '', 30),
(8, 5, '8-count', 'light', '', 31),
(9, 5, '10-count', 'light', '', 32),
(10, 3, 'Lindy Hop', 'light', '', 95),
(11, 3, 'Balboa', 'light', '', 97),
(12, 3, 'Collegiate Shag', 'light', '', 96),
(13, 2, 'Int-Adv', 'primary', '', 22),
(14, 2, 'Int+', 'primary', '', 21),
(15, 2, 'Int', 'primary', '', 20),
(16, 5, 'Redirection', 'secondary', '', 10),
(17, 5, 'Footwork-Variation', 'secondary', '', 10),
(18, 5, 'Break', 'warning', '', 5),
(19, 5, 'Follower-Hijacking', 'danger', '', 11),
(20, 3, 'Solo-Jazz', 'light', '', 99),
(21, 5, 'Leader-Turn', 'warning', '', 6),
(22, 5, 'Swingout-Variation', 'secondary', '', 10),
(23, 5, 'Tip', 'warning', '', 5),
(24, 2, 'Adv', 'primary', '', 23),
(25, 6, 'funny', 'warning', '', 10),
(26, 5, 'Shagout-Variation', 'secondary', '', 10),
(27, 1, 'Celje 2019', 'light', '', 80),
(28, 1, 'Shag Republic 2019', 'light', '', 80),
(29, 1, 'Swing ''n'' Swim 2019', 'light', '', 80),
(30, 1, 'LC Fall Weekend 2018', 'light', '', 80),
(31, 1, 'Celje 2018', 'light', '', 80),
(32, 1, 'Sommerakademie 2019', 'light', '', 80),
(33, 1, 'LC Balboa Workshop Fall 2019', 'light', '', 80),
(34, 1, 'Swingin'' Grazy 2018', 'light', '', 80),
(35, 1, 'Dragon Swing 2019', 'light', '', 80),
(36, 1, 'Ljubljana 2019', 'light', '', 80),
(37, 1, 'Ljubljana 2018', 'light', '', 80),
(38, 1, 'Maribor 2019', 'light', '', 80),
(39, 1, 'LC Festival 2019', 'light', '', 80),
(40, 1, 'Swingin'' Grazy 2019', 'light', '', 80),
(41, 1, 'LC Balboa Cats Weekend 2019', 'light', '', 80),
(42, 1, 'Swingbreak 2019', 'light', '', 80),
(43, 1, 'Swingbreak 2018', 'light', '', 80),
(44, 1, 'Shag-a-bal 2019', 'light', '', 80),
(45, 1, 'Lindy Shock 2018', 'light', '', 80),
(46, 1, 'Sbg April Weekend 2018', 'light', '', 80),
(47, 6, 'to practise', 'danger', '', 2),
(48, 1, 'LC Int-Adv Fall 2019', 'light', '', 80),
(49, 1, 'LC Int+ March 2019', 'light', '', 80),
(50, 1, 'LC Shag Intermediates 1', 'light', '', 80),
(51, 1, 'LC Shag Improver', 'light', '', 80),
(52, 1, 'LC Shag Beginner', 'light', '', 80),
(53, 5, 'Basic-Step-Variation', 'secondary', '', 10),
(54, 1, 'LC Shag Intermediates 2', 'light', '', 80),
(55, 5, 'Leader Double-Hop', 'secondary', '', 10),
(56, 2, 'Beg', 'primary', '', 19),
(57, 2, 'Imp', 'primary', '', 20),
(58, 1, 'Sommerakademie 2018', 'light', '', 80),
(59, 1, 'LC Juni Weekend 2018', 'light', '', 80);

SELECT setval(pg_get_serial_sequence('tags', 'tag_id'), (SELECT MAX(tag_id) FROM tags));

-- Moves
INSERT INTO moves (move_id, name, synonyms, description, link) OVERRIDING SYSTEM VALUE VALUES
(1, 'Sailor Step', 'Sailor Knot', 'Tuck-Turn von offener Position (Slow-Slow, bei Quick-Quick-Drehen und neben Follwer stehen).', ''),
(2, 'Send Out with Turn', '', 'beim 2. Triple-Step nach rechts mit Körper drehen, dann mit Step-Step Follower nach links drehen (wahlweise auch selbst mitdrehen)', ''),
(3, 'Jump', '', 'in Side-by-Side oder von geschlossener Haltung', ''),
(4, 'Mini-Tip', '', 'Platzwechsel mit gekreuzter Hand, aber bei Rock-Step schon runter gehen. Auf 5 Klatschen, auf 6 nebeneinander stehen, auf "und 8" (je nach Musik Stomp-Off)', ''),
(5, 'Frankie Points', '', 'nach Swing-Out, offen bleiben: Finger zeigt hin, zurück, hin-hin-hin ', ''),
(6, 'Reverse-Swingout', '', 'Mich selbst rausschießen', ''),
(7, 'Pinguin', '', E'Seitliche im Kreis gehen: Triple-Steps, Groove-Walks, oder Shorty George, Kick-Ball-Change, etc.\n\nAusgang: 6- oder 8-Count (je nach Preparation auf 4 (Follower mach Triple-Step Drehung) oder 5 (Follower mach Step-Step Drehung)! ', ''),
(8, 'Tuck Turn with backward Redirection', '', 'Tuck-Turn anfangen, aber dann wieder am Oberarm zurück holen mit Step-Step', 'https://www.youtube.com/watch?v=cMUm-QD1hwc'),
(9, 'Bring in with Redirection', '', 'Bring in, nach 1. Triple-Step steht Leader eher rechts vom Follwer und positioniert rechte Hand sehr früh am Rücken vom Follower und dreht mit Step-Step wieder nach draußen, dann noch ein Triple-Step.', ''),
(10, 'Triple-Step Syncopation', '', '1. Schlag von Triple-Steps vorziehen: beim 1. Triple Step: auf linken Fuß stoßen; beim 2. Triple-Step: auf rechten Fuß stoßen; während dessen kann man auch gut drehen. In allen Moves möglich: Swingout, Passby, etc.', ''),
(11, 'Pass-by Follower Hijacking', '', 'Von Evelyn: bei Pass-by macht Follower selbst nach 1. Triple-Step die Hand um ihre Schulter und wir stehen Side-by-Side (auf umgekehrter Seite) nebeneinander, wie bei Promenade!', ''),
(12, 'Follower-Hijacking to mess up Swingout', '', 'Follower geht unter Leader Hand, wenn dieser vor dem Follwer steht und ein Swingout, Lindy-Circle, He-Goes, Promenade, etc. machen will', ''),
(13, 'Swingout with Inside Turn, Leader-Turn and Catapult', '', 'Leader dreht selbst nach Follower-Inside-Turn im Swingout bei 7/8 (muss ziemlich schnell sein) und zieht Follower mit rechter Hand wieder auf die andere Seite (6-Count), eventuell auch mit Drehung (8-Count) nach 2. Triple-Step', ''),
(14, 'Swingout with Texas-Tommy and Promenade', '', 'Swingout mit Texas-Tommy, aber Leader dreht bei Texas-Tommy auch mit ein und steht dann rechts neben Follower. Entweder 6-Count (Frankie Six) in einen Tuck-Turn, oder mit 8-Count Follower-Drehung bei Step-Step, dann Follwer Hand auf Schulter fallen lassen und weiter gehts.', ''),
(15, 'Sugar Push with Groove Walks', '', 'Sugar-Push mit Leader vor gehen bei 2. Triple-Step, dann seitlich Groove-Walks so lange man will und wieder zurück mit Rockstep', ''),
(16, 'Sailor Step with Ellbow', 'Sailor Knot with Ellbow', E'Normaler Sailor-Step Eingang, aber bei Drehung gleich den Ellbogen von Follower greifen und halten. Dann im Sailor-Step (entweder drinnen bleiben oder nach Triple-Step wieder rausgehen) mit Step-Step den Follower ausdrehen.\n\nAusgang offene Position oder Swingout (schwerer)', ''),
(17, 'Lindy-Circle with Send Out and Bring In', '', 'im Lindy-Circle (6- oder 8-Count), nach Step-Step mit Triple-Steps den Follower linear raus schießen und aber gleich zurück ziehen mit Triple. Danach in Side-by-Side 3 Kicks nach vorne und Slide zurück', ''),
(18, 'Pass-by with Redirection', '', 'Normales Pass-by, aber die Leader-Hand am Ende 1. Triple-Step schon auf Follower-Rücken legen und mit Step-Step wieder zurückschicken. Leader kann seitlich mitgehen, oder wieder auf Ausgangsposition zurück.', ''),
(25, 'Koala Tip', '', 'Tip wie Pop-Turn, aber Leader bleibt an der Stelle, Follower hält sich mit beiden Armen an der rechten Leader Hand', ''),
(38, 'Send Out with Leader Turn', '', 'Send Out mit Leader Drehung vom Side-by-Side, danach ein 6-Count Drehung am Platz für Follower', ''),
(44, 'Promenade backwards in Circle', '', 'Follower eindrehen im Bring-In mit gekreuzter Hand (wie bei Promenade, die Hände hinter Schulter) und in Lindy-Circle zurück gehen mit Step-Step so lange man will. Ausgang mit Triple-Step.', ''),
(45, 'Swingout with Outside Turn and link Arms', '', 'Swingout mit Outside Turn und dann danach neben Follower stehen und die Hand anbieten zum einhängen. Dann zu Bar gehen ("Bartherapie")', ''),
(46, 'Happy Steps', '', 'Pass-By auf 8-Count verlängern, in dem man den 2. Triple-Step verlängert mit "Happy, happy, happy Step" und so schon gleich zu Beginn des 2. Triple-Steps in die rechte Richtung geht und eventuell auch die rechte Hand hebt damit der Follower es merkt', ''),
(47, 'Allow Follower Improvisation in Passby', '', 'Normaler Pass mit stehenbleiben (Rock-Step, dann stehenbleiben) und somit Follower Improvisation. Wenn Follower nicht einsteigt, dann 2. Triple-Step einfach wieder mitmachen.', ''),
(48, 'Passby and Bring In', '', 'Normaler Passby und danach Follower wieder zu sich nehmen (am 2. Triple-Step) als Redirection', ''),
(49, 'Twists on Place', '', 'Twists am Stand', ''),
(50, 'Mini-Tip with Groove Walks', '', 'Mini-Tip und dann seitlich auf 8 Groove Walks zum Follower (macht Michaela immer)', ''),
(51, 'Sailor Step with open Circle Position and Redirection', '', E'Normal Sailor Step Entrance, then Follower decides to switch to open position (but everybody remains footwork and circle). Follower drops Leader hand from shoulder.\nExit: Leader then can switch to closed Position or doing Slows on spot (1. Slow Out, 2. Slow: In: Affen-Handhaltung), then 6-Count Promenade Bring in and e.g. Fishtails and Break)', ''),
(52, 'Break with open Turn after Shagout', '', 'Break nach Shag Out: 1. Slow nach innen kicken, 2. Slow nach außen aber Hand ausholen; Quick-quick Kicks nach außen, dann loslassen und Drehen. Grundschritt geht dann gleich weiter (close Position oder open Position) oder sonst warten', ''),
(53, 'Shagout', '', 'Standard Shagout: bei 1. Slow nach innen, bei 2. Slow nach außen kicken bzw. Follower schon wieder herholen zum nächsten Shag out', ''),
(54, 'Shagout with Double Turn', '', 'mit Follower Doppeldrehung (4 Quicks)', ''),
(55, 'Shagout with Texas Tommy Double Turn', '', 'Shagout mit Texas-Tommy (Doppeldrehung). Hand vom Follower bei 1. Quick nach hinten, insgesamt 4 Quicks', ''),
(56, 'Slow Swings into Shagout', '', 'von Side-by-Side: bei Quick-Quick als Leader bisschen nach vor gehen aber Follower am Platz lassen, dann kontra Slows zurück und vor so oft man will. Wenn man vorne ist, dann ist es das 1. Slow vom Shagout. Dient als Vorbereitung zum Shagout bzw. dieses hat dann mehr Energie.', ''),
(57, 'Rabbit Hole for Follower', '', 'Rabbit Hole (Follower geht): Leader dreht von open Position auf 2. Slow selbst einmal herum (ohne irgendwas zu leaden, Follower bleibt am Platz) und lädt bei Quick-Quick den Follower ein durchzugehen in das Rabbit Hole (um den Leader herum)', ''),
(58, 'Rabbit Hole for Leader', '', 'Rabbit Hole für Leader; Leader dreht Follower von open Position in American Spin ein und greift schon beim 1. Slow die andere Hand: dann geht Leader durch das Hole, am besten alles in einem Basic (6-Count); danach Tuck-Turn von Side-by-Side auf offene Position.', ''),
(59, 'Rabbit Hole for Leader (backwards)', '', 'Leader dreht sich von open Position selbst neben Follower ein (steht Side-by-Side auf der Follower Seite), danach unter Follower durch zurück, und mit Quick-Quick die Hand über Follower [Lindy Cats Shag Fall Workshop 2018]', ''),
(60, 'Sugar Push', '', 'Normale Sugarpushes (6-Count): aus offener Position: Slow hinein, (Arme seitlich nach außen) Slow heraus, Quick-Quick (Arme mittig) am Stand. Slows and Quicks können verlängert werden', ''),
(61, 'Sugar-Push with Multiple Slows Redirection', '', 'Slows bei normalem Sugar-Push verlängern und dann irgendwann unter Hand durchgehen und zurückgehen; mehrfach, dann wieder in closed-Position (mit Quick-Quicks synchronisieren). Shag-Finger heben, wenn man außen ist.', ''),
(62, 'Headbanging in closed Position', 'Multiple Quicks Out/In', 'Headbanging auf Quick-Quicks. in closed Position: Transition: Hand bei 2. Slow schon etwas tiefer und Spannung aufbauen. Dann die Quicks mit raus, rein und wiederholen.', ''),
(63, 'Jojo', '', E'Transition von open Position: bei Quick-Quick schon Spannung aufbauen und dann beim 1. Slow Follower mit rechter Hand (linke Hand loslassen) nach hinten leaden. Steps: Slow-Kick, Slow-Kick (bei Follower: Slow-Tap), Quick-Quick (Follower dreht).\nExit: nach Quick-Quick wieder in closed Position', ''),
(64, 'Jump in closed Position', '', 'Slow-Slow noch normal, dann auf 5. stehenbleiben, auf 6 runter gehen und springen, auf 7 in Luft sein, auf 8 wieder aufkommen, damit man wieder normal im Grundschritt weiter tanzen kann. Nur ganz wenig springen, nicht zu hoch, ansonsten kommt man zu spät am Boden auf.', ''),
(65, 'Multiple Slows in closed Position', '', '', ''),
(66, 'Multiple Quicks in closed Position', '', '', ''),
(67, 'Vomit Commit', '', 'Eingang von Tuck-Turn aus Side-by-Side: dann Follower immer drehen, sich selbst auch: auf 1. Slow Hand neben, auf 2. Slow in andere Hand geben, dann Redirection und Turn auf Quick-Quick', ''),
(68, 'Tom & Jerry', '', E'von open Position: gekreuzte Handhaltung, wichtig für Platzwechsel): nur Quicks: 4mal hoch (Hand hoch), 4mal runter: (Körper nach unten).\n\nAusgang: noch mal Hand nach oben, aber dann nicht mehr nach unten sondern in die closed Position gehen.', ''),
(69, 'Washing Machine', '', 'Tuck-Turn Eingang, Leader wechselt Hand und steht neben Follower bzw. beginnt gleich eine Kreisbewegung. Im Kreis, kann man z.b. sehr gut die Basic Steps variieren (z.b. anstatt Quick-Quick noch ein Kick nach am gleichen Bein).', ''),
(70, 'Promenade with crossed Arms', '', 'Eingang mit Tuck-Turn von Side-by-Side: Leader dreht sich 90 Grad und umfasst andere Hand vom Follower: Promenade, immer bei Quick-Quick in andere Richtung drehen: Ausgang mit 2 Slows (wie bei Waschmaschine) und dann in closed Position', ''),
(71, 'Slow Break in Side-by-Side Position', '', E'2 Slows: Körper nach vorne, dann zurück. Man kann im 2. Schlag von jedem Slow noch eine Tap mit dem anderen Fuß machen:\n1. Slow: Gewicht mit Fuß außen nach vorne (Hand unten), Tap innen hinten\n2. Slow: Gewicht mit Fuß innen nach hinten (Hand oben), Tap außen vorne', ''),
(72, 'Sailor Step', '', 'Eingang: Tuck-Turn von offener Position: Normal Sailor Step, keep 6-Count Basic within the Circle', ''),
(73, 'Promenade Exit by Follower-Hijacking', '', 'Bei normalen 6-Count Promenade (Follower Hände auf Schulter), geht Leader bisschen vor. Follower hat immer bei Quick-Quick die Möglichkeit von selbst nach hinten zu gehen. Aber rechte Hand wird nicht losgelassen und Follower zieht mich bisschen nach hinten (Stretch). Dann trifft man sich wieder in der geschlossen Position.', ''),
(74, 'Texas Tommy from closed to open or Side-by-Side Position', '', E'Texas-Tommy von closed nach open Position, oder in Side-by-Side, wenn man Hand fest hält.\nAuf 2. Slow wird der Arm nach hinten gegeben.', ''),
(75, 'Texas Tommy and Slow Tandem Swings', '', 'Move von Nina: nach 6-Count Texas-Tommy von closed to open: in multiple Slows hinter Follower nach links und rechts, bei Quick-Quick wieder ausdrehen', ''),
(76, 'Pop-Turn in closed Position', '', 'auf 2. Slow Pop-Turn einleiten?', ''),
(77, 'Tunnel', '', 'Tunnel machen: Hände oben zusammen aus offener Position und nur Quicks machen. Exit wenn Leader Hände wieder nach unten gibt und Grundschritt einleitet.', ''),
(78, 'Sailor Step Indication', '', 'Sailor-Step antäuschen, aber nicht Hände mitdrehen sondern einfach mit rechter Hand um den Follower gehen, dann umeinander kreisen! Mal links, mal rechts vom Follower stehen.', ''),
(79, 'Fancy Turn in Sailor Step', '', 'Im Sailor Step im Quick-Quick geht Leader nach unten, und mit rechter Hand (Ellbogen ausdrehen) dreht bei 1. Slow den Ellbogen aus, bei 2. Slow den Follower, und bei Quick-Quick noch mal den Follower (wie beim normalen Sailor-Step Eingang). Danach somit wieder im Sailor-Step.', ''),
(80, 'Quick(In-Out) Break im Side-by-Side', '', 'Side-by-Side Break 2: Slow-Slow-Quick-Quick, dann Follower fester halten immer Quick-Quicks: Fuß nach innen und dann nach außen, dann Drehung nach innen und wieder in die geschlossene Position zurückkehren.', ''),
(81, 'Slow Break in closed Position', '', E'Als Leader bisschen höher gehen bzw. Atmen, dann nach unten sinken lassen.\n2 Optionen für die Füße: Entweder Slows mit rechten Fuß vor, dann linken.\nOder seitlich: nach rechts, nach links (Hand, Oberkörper, Kopf kann unterstützen: 1. Slow linke Hand nach oben, 2. Slow linke Hand nach unten).', ''),
(82, 'Quicks Break in closed Position', '', 'in geschlossener Position bleiben: 4 Quicks mit linken Fuß nach links, dann 4 Quicks mit rechten Fuß nach rechts. Oberkörper sollte besser mitgehen, damit Follower es merkt.', ''),
(83, 'Normal Tuck-Turn', '', 'von geschlossener oder Side-by-Side', ''),
(84, 'Tuck-Turn on the Spot in Side-by-Side', '', '6-Count am Platz in Side-by-Side: Follower dreht sich am Platz. Dafür mehr Spannung und Hand weiter unten lassen (dann z.b. mit 1. Slow nach außen, 2. Slow nach innen und Quick-Quick beide drehen und nach gemeinsam hinten gehen und wieder vor)', ''),
(85, 'Tuck-Turn with Double Turn', '', 'Follower 2mal drehen, Leader macht 4 Quicks am Platz', ''),
(86, 'Tuck-Turn with Double Turn and Leader Turn', '', 'Leader dreht sich bei 7/8 mit, aber auf die linke Seite', ''),
(87, 'Tuck-Turn with Leader Turn', '', '6-Count mit Leader Drehung nach hinten: Leader dreht sich auf Quick-Quick nach hinten und pusht Follower dann bei 1. Kick wieder nach hinten (Follower dreht sich einmal nach hinten) in Side-by-Side', ''),
(88, 'Tandem', '', E'Eingang über Tuck-Turn oder Shagout von Side-by-Side bzw. Follower von open Position dann einfach reinholen und Double-Hop auf Quick-Quick machen. Leader steht dann hinter Follower. Entweder Double-Kicks (Hände seitlich lassen), oder Side-by-Side Grundschritt: 1. Slow: rechte Hand vor, 2. Slow: linke Hand vor, Quick-Quick: linke Hand vorne lassen\nKicks rechts/links: innerhalb Tandem z.b. Kicks (6-Count) nach links/rechts. Als Preparation Follower in diese Richtung drehen bei Quick-Quick\nExit: bei Quick-Quick mit Leader Double-Hop den Follower wieder ausdrehen und in closed Position gehen', ''),
(89, 'Tandem Exit Side-by-Side', '', 'Tandem mit Double-Kicks. Leader hebt die Hand geht nach links von Follower. Dann Quicks verlängern und Hände loslassen: Leader-Drehung nach außen, Follower Drehung nach innen. danach in open oder closed Position zusammenkommen', ''),
(90, 'Heel Toe Basic', '', '', ''),
(91, 'Toe Heel Basic', '', '', ''),
(92, 'Ass Kick Basic', '', '', ''),
(93, 'Kick Ass Basic', '', '', ''),
(94, 'Moon Kick Basic', '', '', ''),
(95, 'Triple-Step Basic', '', 'Bei langsamen Shag: Triple-Step, Triple-Step, Kick-Step', ''),
(96, 'Double Kick Basic', '', 'Ersten Kick am Boden schleifen', ''),
(97, 'Kick Step Basic', '', '', ''),
(98, 'Basic Step', '', 'Normaler Basic in geschlossener Position: Füße nach hinten schleifen', '');

SELECT setval(pg_get_serial_sequence('moves', 'move_id'), (SELECT MAX(move_id) FROM moves));

-- Moves to Tags (N:M relationship)
INSERT INTO moves_to_tags (move_id, tag_id) VALUES
(5, 2), (5, 5), (7, 1), (7, 5), (5, 8), (5, 10), (7, 10), (5, 18),
(11, 19), (13, 22), (13, 3), (13, 2), (13, 16), (13, 5), (13, 21),
(15, 10), (15, 5), (15, 18), (15, 13), (7, 15), (5, 14), (11, 14), (13, 14),
(18, 5), (18, 8), (18, 10), (18, 15), (18, 16), (18, 1),
(4, 18), (4, 3), (4, 10), (4, 15), (4, 8), (4, 5),
(6, 10), (6, 13), (6, 8), (6, 5),
(63, 16), (63, 12), (63, 14), (63, 7), (63, 28),
(55, 26), (55, 3), (55, 12), (55, 14), (55, 8), (55, 28),
(54, 3), (54, 26), (54, 12), (54, 15), (54, 8), (54, 28),
(44, 10), (44, 14), (44, 29),
(46, 1), (46, 18), (46, 25), (46, 10), (46, 8), (46, 29),
(50, 23), (50, 18), (50, 10), (50, 13), (50, 31),
(48, 16), (48, 10), (48, 14), (48, 7), (48, 32),
(45, 25), (45, 10), (45, 15), (45, 5),
(25, 23), (25, 18), (25, 11), (25, 13), (25, 33),
(12, 19), (12, 3), (12, 13), (12, 34),
(9, 16), (9, 10), (9, 15), (9, 8), (9, 35),
(2, 3), (2, 10), (2, 15), (2, 8), (2, 35), (2, 36),
(14, 21), (14, 3), (14, 22), (14, 10), (14, 14), (14, 5), (14, 37),
(59, 47), (59, 25), (59, 12), (59, 14), (59, 7), (59, 30),
(58, 47), (58, 25), (58, 12), (58, 13), (58, 7), (58, 27),
(57, 47), (57, 25), (57, 12), (57, 14), (57, 7), (57, 27),
(56, 47), (56, 16), (56, 26), (56, 12), (56, 15), (56, 28),
(10, 10), (10, 2), (10, 48), (10, 13), (10, 17),
(17, 10), (17, 2), (17, 48), (17, 13), (17, 18), (17, 16),
(1, 10), (1, 1), (1, 3), (1, 5), (1, 15), (1, 8),
(16, 10), (16, 47), (16, 3), (16, 48), (16, 14),
(8, 10), (8, 47), (8, 3), (8, 49), (8, 15), (8, 16), (8, 8),
(66, 12), (66, 25), (66, 51), (66, 15), (66, 18),
(65, 12), (65, 25), (65, 51), (65, 15),
(70, 12), (70, 25), (70, 51), (70, 15),
(38, 10), (38, 1), (38, 29), (38, 15), (38, 21), (38, 7),
(64, 12), (64, 3), (64, 52), (64, 15), (64, 18), (64, 8),
(68, 12), (68, 1), (68, 25), (68, 52), (68, 15), (68, 18), (68, 8),
(73, 12), (73, 25), (73, 51), (73, 15), (73, 19),
(75, 12), (75, 47), (75, 25), (75, 14),
(76, 12), (76, 47), (76, 54), (76, 15), (76, 7),
(51, 12), (51, 28), (51, 14), (51, 16), (51, 19),
(78, 12), (78, 47), (78, 54), (78, 14),
(77, 12), (77, 1), (77, 47), (77, 25), (77, 15), (77, 18),
(74, 12), (74, 47), (74, 3), (74, 14),
(79, 12), (79, 47), (79, 3), (79, 27), (79, 13), (79, 21),
(80, 12), (80, 47), (80, 3), (80, 30), (80, 15), (80, 18),
(81, 12), (81, 1), (81, 27), (81, 50), (81, 15), (81, 18),
(71, 12), (71, 3), (71, 54), (71, 18),
(82, 12), (82, 25), (82, 15), (82, 18), (82, 8),
(84, 12), (84, 47), (84, 27), (84, 54), (84, 15), (84, 7),
(85, 12), (85, 50), (85, 15), (85, 8),
(86, 12), (86, 47), (86, 3), (86, 50), (86, 15), (86, 21), (86, 8),
(87, 12), (87, 3), (87, 27), (87, 14), (87, 21), (87, 16), (87, 7),
(88, 12), (88, 47), (88, 3), (88, 27), (88, 14), (88, 55),
(95, 12), (95, 27), (95, 14), (95, 53), (95, 7),
(94, 12), (94, 51), (94, 15), (94, 53), (94, 7),
(98, 12), (98, 52), (98, 56), (98, 53), (98, 7),
(96, 12), (96, 27), (96, 52), (96, 15), (96, 53), (96, 7),
(97, 12), (97, 27), (97, 52), (97, 57), (97, 53), (97, 7),
(83, 12), (83, 1), (83, 52), (83, 57), (83, 7),
(49, 10), (49, 1), (49, 48), (49, 56), (49, 18),
(3, 10), (3, 1), (3, 5), (3, 57), (3, 18),
(69, 12), (69, 1), (69, 51), (69, 57),
(62, 12), (62, 25), (62, 51), (62, 57), (62, 18),
(60, 12), (60, 51), (60, 57), (60, 7),
(53, 12), (53, 27), (53, 54), (53, 14), (53, 7),
(61, 12), (61, 25), (61, 50), (61, 14), (61, 16),
(52, 12), (52, 3), (52, 54), (52, 14), (52, 18), (52, 26),
(67, 12), (67, 3), (67, 25), (67, 54), (67, 14), (67, 16), (67, 7),
(91, 12), (91, 31), (91, 15), (91, 53), (91, 7),
(93, 12), (93, 27), (93, 28), (93, 15), (93, 53), (93, 7),
(92, 12), (92, 27), (92, 28), (92, 15), (92, 53),
(90, 12), (90, 27), (90, 28), (90, 15), (90, 53), (90, 7),
(89, 12), (89, 47), (89, 54), (89, 14), (89, 18), (89, 21),
(72, 12), (72, 1), (72, 51), (72, 57),
(47, 1), (47, 18), (47, 10), (47, 15), (47, 5);

-- ============================================
-- 3. Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tag_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves_to_tags ENABLE ROW LEVEL SECURITY;

-- SELECT policy: everyone can read
CREATE POLICY "Allow public read on tag_types" ON tag_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow public read on moves" ON moves FOR SELECT USING (true);
CREATE POLICY "Allow public read on moves_to_tags" ON moves_to_tags FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: only authenticated users
CREATE POLICY "Allow authenticated insert on moves" ON moves FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on moves" ON moves FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on moves" ON moves FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on moves_to_tags" ON moves_to_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on moves_to_tags" ON moves_to_tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on moves_to_tags" ON moves_to_tags FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on tags" ON tags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on tags" ON tags FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on tag_types" ON tag_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on tag_types" ON tag_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on tag_types" ON tag_types FOR DELETE TO authenticated USING (true);
