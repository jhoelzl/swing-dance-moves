-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: isp-prod-mysql01.in.issp.at
-- Erstellungszeit: 08. Dez 2019 um 15:42
-- Server-Version: 5.7.27-30
-- PHP-Version: 7.2.24-1+0~20191026.31+debian9~1.gbpbbacde

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `johoelzl_mysql2`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `moves`
--

CREATE TABLE `moves` (
  `move_id` int(11) NOT NULL,
  `name` varchar(200) CHARACTER SET utf8 NOT NULL,
  `synonyms` varchar(400) COLLATE latin1_general_cs NOT NULL,
  `description` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `link` varchar(500) COLLATE latin1_general_cs NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

--
-- Daten für Tabelle `moves`
--

INSERT INTO `moves` (`move_id`, `name`, `synonyms`, `description`, `link`) VALUES
(1, 'Sailor Step', 'Sailor Knot', 'Tuck-Turn von offener Position (Slow-Slow, bei Quick-Quick-Drehen und neben Follwer stehen).', ''),
(2, 'Send Out with Turn', '', 'beim 2. Triple-Step nach rechts mit Körper drehen, dann mit Step-Step Follower nach links drehen (wahlweise auch selbst mitdrehen)', ''),
(3, 'Jump', '', 'in Side-by-Side oder von geschlossener Haltung', ''),
(4, 'Mini-Tip', '', 'Platzwechsel mit gekreuzter Hand, aber bei Rock-Step schon runter gehen. Auf 5 Klatschen, auf 6 nebeneinander stehen, auf \"und 8\" (je nach Musik Stomp-Off)', ''),
(5, 'Frankie Points', '', 'nach Swing-Out, offen bleiben: Finger zeigt hin, zurück, hin-hin-hin ', ''),
(6, 'Reverse-Swingout', '', 'Mich selbst rausschießen', ''),
(7, 'Pinguin', '', 'Seitliche im Kreis gehen: Triple-Steps, Groove-Walks, oder Shorty George, Kick-Ball-Change, etc.\r\n\r\nAusgang: 6- oder 8-Count (je nach Preparation auf 4 (Follower mach Triple-Step Drehung) oder 5 (Follower mach Step-Step Drehung)! ', ''),
(8, 'Tuck Turn with backward Redirection', '', 'Tuck-Turn anfangen, aber dann wieder am Oberarm zurück holen mit Step-Step', 'https://www.youtube.com/watch?v=cMUm-QD1hwc'),
(9, 'Bring in with Redirection', '', 'Bring in, nach 1. Triple-Step steht Leader eher rechts vom Follwer und positioniert rechte Hand sehr früh am Rücken vom Follower und dreht mit Step-Step wieder nach draußen, dann noch ein Triple-Step.', ''),
(10, 'Triple-Step Syncopation', '', '1. Schlag von Triple-Steps vorziehen: beim 1. Triple Step: auf linken Fuß stoßen; beim 2. Triple-Step: auf rechten Fuß stoßen; während dessen kann man auch gut drehen. In allen Moves möglich: Swingout, Passby, etc.', ''),
(11, 'Pass-by Follower Hijacking', '', 'Von Evelyn: bei Pass-by macht Follower selbst nach 1. Triple-Step die Hand um ihre Schulter und wir stehen Side-by-Side (auf umgekehrter Seite) nebeneinander, wie bei Promenade!', ''),
(12, 'Follower-Hijacking to mess up Swingout', '', 'Follower geht unter Leader Hand, wenn dieser vor dem Follwer steht und ein Swingout, Lindy-Circle, He-Goes, Promenade, etc. machen will', ''),
(13, 'Swingout with Inside Turn, Leader-Turn and Catapult ', '', 'Leader dreht selbst nach Follower-Inside-Turn im Swingout bei 7/8 (muss ziemlich schnell sein) und zieht Follower mit rechter Hand wieder auf die andere Seite (6-Count), eventuell auch mit Drehung (8-Count) nach 2. Triple-Step', ''),
(14, 'Swingout with Texas-Tommy and Promenade', '', 'Swingout mit Texas-Tommy, aber Leader dreht bei Texas-Tommy auch mit ein und steht dann rechts neben Follower. Entweder 6-Count (Frankie Six) in einen Tuck-Turn, oder mit 8-Count Follower-Drehung bei Step-Step, dann Follwer Hand auf Schulter fallen lassen und weiter gehts.', ''),
(15, 'Sugar Push with Groove Walks', '', 'Sugar-Push mit Leader vor gehen bei 2. Triple-Step, dann seitlich Groove-Walksso lange man will und wieder zurück mit Rockstep', ''),
(16, 'Sailor Step with Ellbow', 'Sailor Knot with Ellbow', 'Normaler Sailr-Step Eingang, aber bei Drehung gleich den Ellbogen von Follower greifen und halten. Dann im Sailor-Step (entweder drinnen bleiben oder nach Triple-Step wieder rausgehen) mit Step-Step den Follower ausdrehen.<br /><br />\r\nAusgang offene Position oder Swingout (schwerer) ', ''),
(17, 'Lindy-Circle with Send Out and Bring In', '', 'im Lindy-Circle (6- oder 8-Count), nach Step-Step mit Triple-Steps den Follower linear raus schießen und aber gleich zurück ziehen mit Triple. Danach in Side-by-Side 3 Kicks nach vorne und Slide zurück', ''),
(18, 'Pass-by with Redirection', '', 'Normales Pass-by, aber die Leader-Hand am Ende 1. Triple-Step schon auf Follower-Rücken legen und mit Step-Step wieder zurückschicken. Leader kann seitlich mitgehen, oder wieder auf Ausgangsposition zurück.', ''),
(25, 'Koala Tip', '', 'Tip wie Pop-Turn, aber Leader bleibt an der Stelle, Follower hält sich mit beiden Armen an der rechten Leader Hand', ''),
(38, 'Send Out with Leader Turn', '', 'Send Out mit Leader Drehung vom Side-by-Side, danach ein 6-Count Drehung am Platz für Follower', ''),
(44, 'Promenade backwards in Circle', '', 'Follower eindrehen im Bring-In mit gekreuzter Hand (wie bei Promenade, die Hände hinter Schulter) und in Lindy-Circle zurück gehen mit Step-Step so lange man will. Ausgang mit Triple-Step.', ''),
(45, 'Swingout with Outside Turn and link Arms', '', 'Swingout mit Outside Turn und dann danach neben Follower stehen und die Hand anbieten zum einhängen. Dann zu Bar gehen (\"Bartherapie\")', ''),
(46, 'Happy Steps', '', '6-Count Pass-By auf 8-Count verlängern, in dem man den 2. Triple-Step verlängert mit \"Happy, happy, happy Step\" und so schon gleich zu Beginn des. 2. Triple-Steps in die rechte Richtung geht und eventuell auch die rechte Hand hebt damit der Follower es merkt', ''),
(47, 'Allow Follower Improvisation in Passby', '', 'Normaler Pass mit stehenbleiben (Rock-Step, dann stehenbleiben) und somit Follower Improvisation. Wenn Follower nicht einsteigt, dann 2. Triple-Step einfach wieder mitmachen.', ''),
(48, 'Passby and Bring In', '', 'Normaler Passby und danach Follower wieder zu sich nehmen (am 2. Triple-Step) als Redirection', ''),
(49, 'Twists on Place', '', 'Twists am Stand', ''),
(50, ' Mini-Tip with Groove Walks', '', ' Mini-Tip  und dann seitlich auf 8 Groove Walks zum Follower (macht Michaela immer)', ''),
(51, 'Sailor Step with open Circle Position and Redirection', '', 'Normal Sailor Step Entrance, then Follower decides to switch to open position (but everybody remains footwork and circle). Follower drops Leader hand from shoulder.\r\nExit: Leader then can switch to closed Position or doing Slows on spot (1. Slow Out, 2. Slow: In: Affen-Handhaltung), then 6-Count Promenade Bring in and e.g. Fishtails and Break)', ''),
(52, 'Break with open Turn after Shagout', '', 'Break nach Shag Out: 1. Slow nach innen kicken, 2. Slow nach außen aber Hand ausholen; Quick-quick Kicks nach außen, dann loslassen und Drehen. Grundschritt geht dann gleich weiter (close Position oder open Position) oder sonst warten', ''),
(53, 'Shagout', '', 'Standard Shagout: bei 1. Slow nach innen, bei 2. Slow nach außen kicken bzw. Follower schon wieder herholen zum nächsten Shag out', ''),
(54, 'Shagout with Double Turn', '', 'mit Follower Doppeldrehung (4 Quicks)', ''),
(55, 'Shagout with Texas Tommy Double Turn', '', 'Shagout mit Texas-Tommy (Doppeldrehung). Hand vom Follower bei 1. Quick nach hinten, insgesamt 4 Quicks', ''),
(56, 'Slow Swings into Shagout', '', 'von Side-by-Side: bei Quick-Quick als Leader bisschen nach vor gehen aber Follower am Platz lassen, dann kontra Slows zurück und vor so oft man will. Wenn man vorne ist, dann ist es das 1. Slow vom Shagout. Dient als Vorbereitung zum Shagout bzw. dieses hat dann mehr Energie.', ''),
(57, 'Rabbit Hole for Follower', '', 'Rabbit Hole (Follower geht): Leader dreht von open Position auf 2. Slow selbst einmal herum (ohne irgendwas zu leaden, Follower bleibt am Platz) und lädt bei Quick-Quick den Follower ein durchzugehen in das Rabbit Hole (um den Leader herum)', ''),
(58, 'Rabbit Hole for Leader', '', 'Rabbit Hole für Leader; Leader dreht Follower von open Position in American Spin ein und greift schon beim 1. Slow die andere Hand: dann geht Leader durch das Hole, am besten alles in einem Basic (6-Count); danach Tuck-Turn von Side-by-Side auf offene Position.', ''),
(59, 'Rabbit Hole for Leader (backwards)', '', 'Leader dreht sich von open Postiion selbst neben Follower ein (steht Side-by-Side auf der Follower Seite), danach unter Follower durch zurück, und mit Quick-Quick die Hand über Follower [Lindy Cats Shag Fall Workshop 2018]', ''),
(60, 'Sugar Push', '', 'Normale Sugarpushes (6-Count): aus offener Position: Slow hinein, (Arme seitlich nach außen) Slow heraus, Quick-Quick (Arme mittig) am Stand. Slows and Quicks könne verlängert werden', ''),
(61, 'Sugar-Push with Multiple Slows Redirection', '', 'Slows bei normalem Sugar-Push verlängern und dann irgendwann unter Hand durchgehen und zurückgehen; mehrfach, dann wieder in closed-Position (mit Quick-Quicks synchronisieren). Shag-Finger heben, wenn man außen ist.', ''),
(62, 'Headbanging in closed Position', 'Multiple Quicks Out/In', 'Headbanging auf Quick-Quicks. in closed Position: Transistion: Hand bei 2. Slow schon etwas tiefer und Spannung aufbauen. Dann die Quicks mit raus, rein und wiederholen.', ''),
(63, 'Jojo', '', 'Transition von open Position: bei Quick-Quick schon Spannung aufbauen und dann beim 1. Slow Follower mit rechter Hand (linke Hand loslassen) nach hinten leaden. Steps: Slow-Kick, Slow-Kick (bei Follower: Slow-Tap), Quick-Quick (Follower dreht). <br />\r\nExit: nach Quick-Quick wieder in closed Position', ''),
(64, 'Jump in closed Position', '', 'Slow-Slow noch normal, dann auf 5. stehenbleiben, auf 6 runter gehen und springen, auf 7 in Luft sein, auf 8 wieder aufkommen, damit man wieder normal im Grundschritt weiter tanzen kann. Nur ganz wenig springen, nciht zu hoch, ansonsten kommt man zu spät am Boden auf.', ''),
(65, 'Multiple Slows in closed Position', '', '', ''),
(66, 'Multiple Quicks in closed Position', '', '', ''),
(67, 'Vomit Commit', '', 'Eingang von Tuck-Turn aus Side-by-Side: dann Follower immer drehen, sich selbst auch: auf 1. Slow Hand neben, auf 2. Slow in andere Hand geben, dann Redirection und Turn auf Quick-Quick', ''),
(68, 'Tom & Jerry', '', 'von open Position: gekreuzte Handhaltung, wichtig für Platzwechsel): nur Quicks: 4mal hoch (Hand hoch), 4mal runter: (Körper nach unten).<br /><br />\r\nAusgang: noch mal Hand nach oben, aber dann nicht mehr nach unten sondern in die closed Position gehen.', ''),
(69, 'Washing Machine', '', 'Tuck-Turn Eingang, Leader wechselt Hand und steht neben Follower bzw. beginnt gleich eine Kreisbewegung. Im Kreis, kann man z..b sehr gut die Basic Steps varriieren (z.b. anstatt Quick-Quick noch ein Kick nach am gleichen Bein).', ''),
(70, 'Promenade with crossed Arms', '', 'Eingang mit Tuck-Turn von Side-by-Side: Leader dreht sich 90 Grad und umfasst andere Hand vom Follower: Promenade, immer bei Quick-Quick in andere Richtung drehen: Ausgang mit 2 Slows (wie bei Waschmaschine) und dann in closed Position', ''),
(71, 'Slow Break in Side-by-Side Position', '', '2 Slows: Körper nach vorne, dann zurück. Man kann im 2. Schlag von jedem Slow noch eine Tap mit dem anderen Fuß machen: \r\n1. Slow: Gewicht mit Fuß außen nach vorne (Hand unten), Tap innen hinten\r\n2. Slow: Gewicht mit Fuß innen nach hinten (Hand oben), Tap außen vorne', ''),
(72, 'Sailor Step', '', 'Eingang :Tuck-Turn von offener Position: Normal Sailor Step, keep 6-Count Basic within the Circle', ''),
(73, 'Promenade Exit by Follower-Hyjacking', '', 'Bei normalen 6-Count Promande (Follower Hände auf Schulter), geht Leader bisschen vor. Follower hat immer bei Quick-Quick die Möglichkeit von selbst nach hinten zu gehen. Aber rechte Hand wird nicht losgelassen und Follower zieht mich bisschen nach hinten (Stretch). Dann trifft man sich wieder in der geschlossen Position.', ''),
(74, 'Texas Tommy from closed to open or Side-by-Side Position', '', 'Texas-Tommy von closed nach open Position, oder in Side-by-Side, wenn man Hand fest hält.\r\nAuf 2. Slow wird der Arm nach hinten gegeben.', ''),
(75, 'Texas Tommy and Slow Tandem Swings', '', 'Move von Nina: nach 6-Count Texas-Tommy con closed to open: in multiple Slows hinter Follower nach links und rechts, bei Quick-Quick wieder ausdrehen', ''),
(76, 'Pop-Turn in closed Position', '', 'auf 2. Slow Pop-Turn einleiten?', ''),
(77, 'Tunnel', '', 'Tunnel machen: Hände oben zusammen aus offener Position und nur Quicks machen. Exit wenn Leader Hände wieder nach unten gibt und Grundschritt einleitet.', ''),
(78, 'Sailor Step Indication', '', 'Sailor-Step antäuschen, aber nicht Hände mitdrehen sondern einfach mit rechter Hand um den Follower gehen, dann umeinander kreisen! Mal links, mal rechts vom Follower stehen.', ''),
(79, 'Fancy Turn in Sailor Step', '', 'Im Sailor Step im Quick-Quick geht Leader nach unten, und mit rechter Hand (Ellbogen ausdrehen) dreht bei 1. Slow den Ellbogen aus, bei 2. Slow den Follower, und bei Quick-Quick noch mal den Follower (wie beim normalen Sailor-Step Eingang). Danach somit wieder im Sailor-Step.', ''),
(80, 'Quick(In-Out) Break im Side-by-Side', '', 'Side-by Side Break 2: Slow-Slow-Quick-Quick , dann Follower fester halten immer Quick Quicks: Fuß nach innen und dann nach außen, dann Drehung nach innen und wieder in die geschlossen Position zurückkehren.', ''),
(81, 'Slow Break in closed Position', '', 'Als Leader bisschen höher gehen bzw. Atmen, dann nach unten sinken lassen.\r\n2. Optionen für die Füße: Entweder Slows mit rechten Fuß vor, dann linken.\r\nOder seitlich: nach rechts, nach links (Hand, Oberkörper, Kopf kann unterstützen: 1. Slow linke Hand nach oben, 2. Slow linke Hand nach unten).', ''),
(82, 'Quicks Break in closed Position', '', 'in geschlossener Position bleiben: 4 Quicks mit linken Fuß nach links, dann 4 Quicks mit rechten Fuß nach rechts. Oberkörper sollte besser mitgehen, damit Follower es merkt.', ''),
(83, 'Normal Tuck-Turn', '', 'von geschlossener oder Side-by-Side', ''),
(84, 'Tuck-Turn on the Spot in Side-by-Side', '', '6-Count am Platz in Side-by-Side: Follower dreht sich am Platz. Dafür mehr Spannung und Hand weiter unten lassen (dann z.b. mit 1. Slow nach außen, 2. Slow nach innen und Quick-Quick beide Drehen und nach gemeinsam hinten gehen und wieder vor)', ''),
(85, 'Tuck-Turn with Double Turn', '', 'Follower 2mal drehen, Leader macht 4 Quicks am Platz', ''),
(86, 'Tuck-Turn with Double Turn and Leader Turn', '', 'Leader dreht sich bei 7/8 mit, aber auf die linke Seite', ''),
(87, 'Tuck-Turn with Leader Turn', '', '6-Count mit Leader Drehung nach hinten: Leader dreht sich auf Quick-Quick nach hinten und pusht Follower dann bei 1. Kick weder nach hinten (Follower dreht sich einmal nach hinten) in Side-by-Side', ''),
(88, 'Tandem', '', 'Eingang über Tuck-Turn oder Shagout von Side-by-Side bzw. Follower von open Position dann einfach reinholen und Double-Hop auf Quick-Quick machen. Leader steht dann hinter Follower. Entweder Double-Kicks (Hände seitlich lassen), oder Side-by-Side Grundschritt: 1. Slow: rechte Hand vor, 2. Slow. linke Hand vor, Quick-Quick: linke Hand vorne lassen\r\nKicks rechts/links: innerhalb Tandem z.b. Kicks (6-Count) nach links/rechts. Als Preparation Follower in diese Richtung drehen bei Quick-Quick\r\nExit: bei Quick-Quick mit Leader Double-Hop den Follower wieder ausdrehen und in closed Position gehen', ''),
(89, 'Tandem Exit Side-by-Side', '', 'Tandem mit Double-Kicks. Leader hebt die Hand geht nach links von Follower. Dann Quicks verlängern und Hände loslassen: Leader-Drehung nach außen, Follower Drehung nach innen. danach in open oder closed Position zusammenkommen', ''),
(90, 'Heel Toe Basic', '', '', ''),
(91, 'Toe Heel Basic', '', '', ''),
(92, 'Ass Kick Basic', '', '', ''),
(93, 'Kick Ass Basic', '', '', ''),
(94, 'Moon Kick Basic', '', '', ''),
(95, 'Triple-Step Basic', '', 'Bei langsamen Shag: Triple-Step, Triple-Step, Kick-Sep', ''),
(96, 'Double Kick Basic', '', 'Ersten Kick am Boden schleifen', ''),
(97, 'Kick Step Basic', '', '', ''),
(98, 'Basic Step', '', 'Normaler Basic in geschlossener Position: Füße nach hinten schleifen', '');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `moves_to_tags`
--

CREATE TABLE `moves_to_tags` (
  `id` int(11) NOT NULL,
  `move_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

--
-- Daten für Tabelle `moves_to_tags`
--

INSERT INTO `moves_to_tags` (`id`, `move_id`, `tag_id`) VALUES
(7, 5, 2),
(8, 5, 5),
(10, 7, 1),
(11, 7, 5),
(19, 5, 8),
(26, 5, 10),
(28, 7, 10),
(40, 5, 18),
(41, 11, 19),
(44, 13, 22),
(45, 13, 3),
(46, 13, 2),
(47, 13, 16),
(48, 13, 5),
(49, 13, 21),
(54, 15, 10),
(55, 15, 5),
(56, 15, 18),
(57, 15, 13),
(63, 0, 0),
(69, 7, 15),
(74, 5, 14),
(79, 11, 14),
(80, 13, 14),
(82, 18, 5),
(83, 18, 8),
(84, 18, 10),
(85, 18, 15),
(86, 18, 16),
(87, 18, 1),
(88, 20, 1),
(89, 20, 22),
(90, 20, 14),
(91, 20, 8),
(92, 20, 6),
(98, 23, 1),
(99, 23, 16),
(100, 23, 8),
(101, 23, 4),
(102, 24, 1),
(103, 24, 16),
(104, 24, 8),
(105, 24, 4),
(111, 28, 1),
(112, 29, 1),
(113, 30, 1),
(114, 31, 1),
(115, 32, 1),
(116, 33, 1),
(117, 34, 1),
(118, 35, 1),
(119, 36, 1),
(120, 37, 1),
(126, 39, 1),
(127, 39, 10),
(128, 39, 15),
(129, 39, 7),
(130, 39, 4),
(131, 40, 1),
(132, 40, 10),
(133, 40, 15),
(134, 40, 7),
(135, 40, 4),
(136, 41, 1),
(137, 41, 10),
(138, 41, 15),
(139, 41, 7),
(140, 41, 4),
(141, 42, 1),
(142, 42, 10),
(143, 42, 15),
(144, 42, 7),
(145, 42, 4),
(146, 43, 1),
(147, 43, 10),
(148, 43, 15),
(149, 43, 7),
(150, 43, 4),
(157, 5, 25),
(164, 47, 1),
(165, 47, 18),
(166, 47, 10),
(167, 47, 15),
(168, 47, 5),
(222, 4, 18),
(223, 4, 3),
(224, 4, 10),
(225, 4, 15),
(226, 4, 8),
(227, 4, 5),
(386, 6, 10),
(387, 6, 13),
(388, 6, 8),
(389, 6, 5),
(478, 63, 16),
(479, 63, 12),
(480, 63, 14),
(481, 63, 7),
(482, 63, 28),
(559, 55, 26),
(560, 55, 3),
(561, 55, 12),
(562, 55, 14),
(563, 55, 8),
(564, 55, 28),
(570, 54, 3),
(571, 54, 26),
(572, 54, 12),
(573, 54, 15),
(574, 54, 8),
(575, 54, 28),
(582, 44, 10),
(583, 44, 14),
(584, 44, 29),
(585, 46, 1),
(586, 46, 18),
(587, 46, 25),
(588, 46, 10),
(589, 46, 8),
(590, 46, 29),
(602, 50, 23),
(603, 50, 18),
(604, 50, 10),
(605, 50, 13),
(606, 50, 31),
(612, 48, 16),
(613, 48, 10),
(614, 48, 14),
(615, 48, 7),
(616, 48, 32),
(617, 45, 25),
(618, 45, 10),
(619, 45, 15),
(620, 45, 5),
(627, 25, 23),
(628, 25, 18),
(629, 25, 11),
(630, 25, 13),
(631, 25, 33),
(638, 12, 19),
(639, 12, 3),
(640, 12, 13),
(641, 12, 34),
(642, 9, 16),
(643, 9, 10),
(644, 9, 15),
(645, 9, 8),
(646, 9, 35),
(657, 2, 3),
(658, 2, 10),
(659, 2, 15),
(660, 2, 8),
(661, 2, 35),
(662, 2, 36),
(663, 14, 21),
(664, 14, 3),
(665, 14, 22),
(666, 14, 10),
(667, 14, 14),
(668, 14, 5),
(669, 14, 37),
(670, 59, 47),
(671, 59, 25),
(672, 59, 12),
(673, 59, 14),
(674, 59, 7),
(675, 59, 30),
(676, 58, 47),
(677, 58, 25),
(678, 58, 12),
(679, 58, 13),
(680, 58, 7),
(681, 58, 27),
(682, 57, 47),
(683, 57, 25),
(684, 57, 12),
(685, 57, 14),
(686, 57, 7),
(687, 57, 27),
(688, 56, 47),
(689, 56, 16),
(690, 56, 26),
(691, 56, 12),
(692, 56, 15),
(693, 56, 28),
(715, 10, 10),
(716, 10, 2),
(717, 10, 48),
(718, 10, 13),
(719, 10, 17),
(724, 17, 10),
(725, 17, 2),
(726, 17, 48),
(727, 17, 13),
(728, 17, 18),
(729, 17, 16),
(735, 1, 10),
(736, 1, 1),
(737, 1, 3),
(738, 1, 5),
(739, 1, 15),
(740, 1, 8),
(747, 16, 10),
(748, 16, 47),
(749, 16, 3),
(750, 16, 48),
(751, 16, 14),
(752, 8, 10),
(753, 8, 47),
(754, 8, 3),
(755, 8, 49),
(756, 8, 15),
(757, 8, 16),
(758, 8, 8),
(771, 66, 12),
(772, 66, 25),
(773, 66, 51),
(774, 66, 15),
(775, 66, 18),
(776, 65, 12),
(777, 65, 25),
(778, 65, 51),
(779, 65, 15),
(784, 70, 12),
(785, 70, 25),
(786, 70, 51),
(787, 70, 15),
(820, 38, 10),
(821, 38, 1),
(822, 38, 29),
(823, 38, 15),
(824, 38, 21),
(825, 38, 7),
(838, 64, 12),
(839, 64, 3),
(840, 64, 52),
(841, 64, 15),
(842, 64, 18),
(843, 64, 8),
(851, 68, 12),
(852, 68, 1),
(853, 68, 25),
(854, 68, 52),
(855, 68, 15),
(856, 68, 18),
(857, 68, 8),
(869, 73, 12),
(870, 73, 25),
(871, 73, 51),
(872, 73, 15),
(873, 73, 19),
(877, 75, 12),
(878, 75, 47),
(879, 75, 25),
(880, 75, 14),
(881, 76, 12),
(882, 76, 47),
(883, 76, 54),
(884, 76, 15),
(885, 76, 7),
(890, 51, 12),
(891, 51, 28),
(892, 51, 14),
(893, 51, 16),
(894, 51, 19),
(900, 78, 12),
(901, 78, 47),
(902, 78, 54),
(903, 78, 14),
(904, 77, 12),
(905, 77, 1),
(906, 77, 47),
(907, 77, 25),
(908, 77, 15),
(909, 77, 18),
(910, 74, 12),
(911, 74, 47),
(912, 74, 3),
(913, 74, 14),
(914, 79, 12),
(915, 79, 47),
(916, 79, 3),
(917, 79, 27),
(918, 79, 13),
(919, 79, 21),
(924, 80, 12),
(925, 80, 47),
(926, 80, 3),
(927, 80, 30),
(928, 80, 15),
(929, 80, 18),
(930, 81, 12),
(931, 81, 1),
(932, 81, 27),
(933, 81, 50),
(934, 81, 15),
(935, 81, 18),
(936, 71, 12),
(937, 71, 3),
(938, 71, 54),
(939, 71, 18),
(940, 82, 12),
(941, 82, 25),
(942, 82, 15),
(943, 82, 18),
(944, 82, 8),
(964, 84, 12),
(965, 84, 47),
(966, 84, 27),
(967, 84, 54),
(968, 84, 15),
(969, 84, 7),
(970, 85, 12),
(971, 85, 50),
(972, 85, 15),
(973, 85, 8),
(974, 86, 12),
(975, 86, 47),
(976, 86, 3),
(977, 86, 50),
(978, 86, 15),
(979, 86, 21),
(980, 86, 8),
(981, 87, 12),
(982, 87, 3),
(983, 87, 27),
(984, 87, 14),
(985, 87, 21),
(986, 87, 16),
(987, 87, 7),
(1009, 88, 12),
(1010, 88, 47),
(1011, 88, 3),
(1012, 88, 27),
(1013, 88, 14),
(1014, 88, 55),
(1057, 95, 12),
(1058, 95, 27),
(1059, 95, 14),
(1060, 95, 53),
(1061, 95, 7),
(1062, 94, 12),
(1063, 94, 51),
(1064, 94, 15),
(1065, 94, 53),
(1066, 94, 7),
(1092, 98, 12),
(1093, 98, 52),
(1094, 98, 56),
(1095, 98, 53),
(1096, 98, 7),
(1103, 96, 12),
(1104, 96, 27),
(1105, 96, 52),
(1106, 96, 15),
(1107, 96, 53),
(1108, 96, 7),
(1109, 97, 12),
(1110, 97, 27),
(1111, 97, 52),
(1112, 97, 57),
(1113, 97, 53),
(1114, 97, 7),
(1115, 83, 12),
(1116, 83, 1),
(1117, 83, 52),
(1118, 83, 57),
(1119, 83, 7),
(1120, 49, 10),
(1121, 49, 1),
(1122, 49, 48),
(1123, 49, 56),
(1124, 49, 18),
(1125, 3, 10),
(1126, 3, 1),
(1127, 3, 5),
(1128, 3, 57),
(1129, 3, 18),
(1130, 69, 12),
(1131, 69, 1),
(1132, 69, 51),
(1133, 69, 57),
(1134, 62, 12),
(1135, 62, 25),
(1136, 62, 51),
(1137, 62, 57),
(1138, 62, 18),
(1139, 60, 12),
(1140, 60, 51),
(1141, 60, 57),
(1142, 60, 7),
(1143, 53, 12),
(1144, 53, 27),
(1145, 53, 54),
(1146, 53, 14),
(1147, 53, 7),
(1148, 61, 12),
(1149, 61, 25),
(1150, 61, 50),
(1151, 61, 14),
(1152, 61, 16),
(1153, 52, 12),
(1154, 52, 3),
(1155, 52, 54),
(1156, 52, 14),
(1157, 52, 18),
(1158, 52, 26),
(1159, 67, 12),
(1160, 67, 3),
(1161, 67, 25),
(1162, 67, 54),
(1163, 67, 14),
(1164, 67, 16),
(1165, 67, 7),
(1166, 91, 12),
(1167, 91, 31),
(1168, 91, 15),
(1169, 91, 53),
(1170, 91, 7),
(1171, 93, 12),
(1172, 93, 27),
(1173, 93, 28),
(1174, 93, 15),
(1175, 93, 53),
(1176, 93, 7),
(1177, 92, 12),
(1178, 92, 27),
(1179, 92, 28),
(1180, 92, 15),
(1181, 92, 53),
(1182, 90, 12),
(1183, 90, 27),
(1184, 90, 28),
(1185, 90, 15),
(1186, 90, 53),
(1187, 90, 7),
(1188, 89, 12),
(1189, 89, 47),
(1190, 89, 54),
(1191, 89, 14),
(1192, 89, 18),
(1193, 89, 21),
(1194, 72, 12),
(1195, 72, 1),
(1196, 72, 51),
(1197, 72, 57);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tags`
--

CREATE TABLE `tags` (
  `tag_id` int(11) NOT NULL,
  `tag_type_id` int(11) NOT NULL,
  `tag_name` varchar(100) COLLATE latin1_general_cs NOT NULL,
  `tag_label` varchar(20) COLLATE latin1_general_cs NOT NULL,
  `tag_css` varchar(200) COLLATE latin1_general_cs NOT NULL,
  `tag_sort` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

--
-- Daten für Tabelle `tags`
--

INSERT INTO `tags` (`tag_id`, `tag_type_id`, `tag_name`, `tag_label`, `tag_css`, `tag_sort`) VALUES
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
(17, 5, 'Foodwork-Variation', 'secondary', '', 10),
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
(29, 1, 'Swing \'n\' Swim 2019', 'light', '', 80),
(30, 1, 'LC Fall Weekend 2018', 'light', '', 80),
(31, 1, 'Celje 2018', 'light', '', 80),
(32, 1, 'Sommerakademie 2019', 'light', '', 80),
(33, 1, 'LC Balboa Workshop Fall 2019', 'light', '', 80),
(34, 1, 'Swingin\' Grazy 2018', 'light', '', 80),
(35, 1, 'Dragon Swing 2019', 'light', '', 80),
(36, 1, 'Ljubljana 2019', 'light', '', 80),
(37, 1, 'Ljubljana 2018', 'light', '', 80),
(38, 1, 'Maribor 2019', 'light', '', 80),
(39, 1, 'LC Festival 2019', 'light', '', 80),
(40, 1, 'Swingin\' Grazy 2019', 'light', '', 80),
(41, 1, 'LC Balboa Cats Weekend 2019', 'light', '', 80),
(42, 1, 'Swingbreak 2019', 'light', '', 80),
(43, 1, 'Swingbreak 2018', 'light', '', 80),
(44, 1, 'Shag-a-bal 2019', 'light', '', 80),
(45, 1, 'Lindy Shock 2018', 'light', '', 80),
(46, 1, 'Sbg April Weekend 2018', 'light', '', 80),
(47, 6, 'to practise\r\n', 'danger', '', 2),
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
(58, 1, 'Sommerakademie 2018\r\n', 'light', '', 80),
(59, 1, 'LC Juni Weekend 2018', 'light', '', 80);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tag_types`
--

CREATE TABLE `tag_types` (
  `tag_type_id` int(11) NOT NULL,
  `tag_type_name` varchar(200) COLLATE latin1_general_cs NOT NULL,
  `sort_order` int(11) NOT NULL,
  `tag_type_css` varchar(200) COLLATE latin1_general_cs NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_cs;

--
-- Daten für Tabelle `tag_types`
--

INSERT INTO `tag_types` (`tag_type_id`, `tag_type_name`, `sort_order`, `tag_type_css`) VALUES
(1, 'Festival / Classes', 3, 'background-color:#00000008;'),
(2, 'Level', 5, ''),
(3, 'Dances', 1, 'background-color:#00000008;'),
(5, 'Technical', 30, 'background-color:#00000008;'),
(6, 'Rating', 2, '');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `moves`
--
ALTER TABLE `moves`
  ADD PRIMARY KEY (`move_id`);

--
-- Indizes für die Tabelle `moves_to_tags`
--
ALTER TABLE `moves_to_tags`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `tags`
--
ALTER TABLE `tags`
  ADD UNIQUE KEY `tag_id` (`tag_id`);

--
-- Indizes für die Tabelle `tag_types`
--
ALTER TABLE `tag_types`
  ADD PRIMARY KEY (`tag_type_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `moves`
--
ALTER TABLE `moves`
  MODIFY `move_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT für Tabelle `moves_to_tags`
--
ALTER TABLE `moves_to_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1198;

--
-- AUTO_INCREMENT für Tabelle `tags`
--
ALTER TABLE `tags`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT für Tabelle `tag_types`
--
ALTER TABLE `tag_types`
  MODIFY `tag_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
