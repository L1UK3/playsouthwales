-- Clean up existing data to ensure idempotent seeding
TRUNCATE public.events, public.weekly_events, public.leagues CASCADE;

-- Insert Leagues
INSERT INTO public.leagues (id, name, logo, website, "socialLink", "eventLink", "brandColor", "webLink", location, latitude, longitude, accessibility, directions) VALUES
(1, 'Dragon''s Valley Gaming', 'https://example.com/logos/dragons-valley.png', 'https://dragonsvalley.example.com', 'https://facebook.com/dragonsvalley', 'https://events.example.com/dragonsvalley', '#d32f2f', 'https://dragonsvalley.example.com/store', 'Cardiff, Wales', 51.481583, -3.179090, 'Wheelchair accessible entrance and seating available.', 'Located near Cardiff Central Station, walk down St Mary Street.'),
(2, 'Swansea Spellbook Cards', 'https://example.com/logos/swansea-spellbook.png', 'https://swanseaspellbook.example.com', 'https://facebook.com/swanseaspellbook', 'https://events.example.com/swanseaspellbook', '#1976d2', 'https://swanseaspellbook.example.com/shop', 'Swansea, Wales', 51.621440, -3.943646, 'Ground level entry with wide doors, accessible restrooms.', 'A short walk from Swansea bus station, right opposite the market.'),
(3, 'Newport Nexus Games', 'https://example.com/logos/newport-nexus.png', 'https://newportnexus.example.com', 'https://facebook.com/newportnexus', 'https://events.example.com/newportnexus', '#388e3c', 'https://newportnexus.example.com/club', 'Newport, Wales', 51.587740, -2.998360, 'Stair-free access to main gaming and retail area.', 'Situated in Newport city center, near Friars Walk shopping center.');

-- Reset sequence for leagues
SELECT setval('public.league_id_seq', (SELECT MAX(id) FROM public.leagues));

-- Insert Standard Events (satisfying all event types and months: June, July, August 2026)
INSERT INTO public.events (id, name, date, "startTime", "leagueId", "ticketLink", "eventType", game, description, prizes, "entryFee", "excludedDates") VALUES
-- June 2026 (Previous Month)
(1, 'Midweek Pokemon TCG Casual', '2026-06-03', '18:00', 1, 'https://tickets.example.com/evt1', 'CASUAL', 'TCG', 'Casual play and friendly matchmaking for all Pokemon TCG trainers.', 'Booster pack for participation', '£5.00', NULL),
(2, 'VGC Standard Showdown', '2026-06-07', '13:00', 2, 'https://tickets.example.com/evt2', 'STANDARD', 'VGC', 'Standard regulation format tournament. Bring your team on Nintendo Switch.', 'Championship points and store credit', '£8.00', NULL),
(3, 'Pokemon GO League Challenge', '2026-06-13', '11:00', 3, 'https://tickets.example.com/evt3', 'CHALLENGE', 'GO', 'Official Pokemon GO local tournament. Great League 1500 CP cap.', 'Official badges and store credit', '£6.00', NULL),
(4, 'Summer League TCG Cup', '2026-06-20', '10:00', 1, 'https://tickets.example.com/evt4', 'CUP', 'TCG', 'Official TCG League Cup. High stakes and competitive matches.', 'Exclusive Cup Playmat and booster boxes', '£15.00', NULL),
(5, 'New Expansion TCG Pre-Release', '2026-06-27', '12:00', 2, 'https://tickets.example.com/evt5', 'PRE-RELEASE', 'TCG', 'Get hands-on with the new expansion set early. Build a 40-card deck.', 'Pre-release promo card and 3 booster packs', '£25.00', NULL),

-- July 2026 (Current Month)
(6, 'Welsh Special Championship TCG', '2026-07-04', '09:00', 1, 'https://tickets.example.com/evt6', 'SPECIAL', 'TCG', 'Premier level event bringing players from all over the country.', 'High Championship Points yield and cash prizes', '£20.00', NULL),
(7, 'Cardiff VGC Regional Championship', '2026-07-11', '08:30', 1, 'https://tickets.example.com/evt7', 'REGIONAL', 'VGC', 'Official regional championship for Video Game Championship (VGC) players.', 'Travel awards and physical trophies', '£35.00', NULL),
(8, 'Europe TCG International Open', '2026-07-18', '08:00', 2, 'https://tickets.example.com/evt8', 'INTERNATIONAL', 'TCG', 'Large-scale international open tournament hosted locally.', 'Championship point multipliers and cash prize pool', '£45.00', NULL),
(9, 'VGC World Warm-up Invitational', '2026-07-25', '10:00', 3, 'https://tickets.example.com/evt9', 'WORLDS', 'VGC', 'Invitation-only practice tournament for worlds-qualified competitors.', 'Custom trophies and exclusive merchandise', '£10.00', NULL),

-- August 2026 (Next Month)
(10, 'VGC Casual Gaming Night', '2026-08-05', '17:30', 2, NULL, 'CASUAL', 'VGC', 'Relaxed night of friendly VGC battles and team building tips.', 'None', 'Free', NULL),
(11, 'August Pokemon GO Cup', '2026-08-09', '14:00', 3, 'https://tickets.example.com/evt11', 'STANDARD', 'GO', 'Monthly standard tournament for local Pokemon GO players.', 'Store credit and custom badges', '£5.00', NULL),
(12, 'TCG League Challenge August', '2026-08-15', '11:00', 1, 'https://tickets.example.com/evt12', 'CHALLENGE', 'TCG', 'Earn Championship Points in this local League Challenge.', 'Promo cards and Championship points', '£7.00', NULL),
(13, 'VGC Late Summer Cup', '2026-08-22', '10:30', 2, 'https://tickets.example.com/evt13', 'CUP', 'VGC', 'Late summer official League Cup for VGC division.', 'Championship points and store vouchers', '£12.00', NULL),
(14, 'Autumn Set Pre-Release TCG', '2026-08-29', '12:00', 3, 'https://tickets.example.com/evt14', 'PRE-RELEASE', 'TCG', 'Early access to the upcoming Autumn TCG set expansion.', 'Build & Battle kits and promotional cards', '£25.00', NULL);

-- Insert Weekly Recurring Events (templates that generate virtual events)
INSERT INTO public.weekly_events (id, name, date, "startTime", "leagueId", "ticketLink", "eventType", game, description, prizes, "entryFee", "excludedDates") VALUES
(1, 'Weekly TCG Casual Matchup', '2026-06-01', '17:00', 1, 'https://tickets.example.com/w1', 'CASUAL', 'TCG', 'Our weekly Monday casual hangout. Perfect for trading and trying new decks.', 'Promo pack for participation', '£3.00', ARRAY['2026-06-15', '2026-07-20']),
(2, 'Weekly VGC Practice Tournament', '2026-06-04', '18:30', 2, 'https://tickets.example.com/w2', 'STANDARD', 'VGC', 'Weekly Thursday tournament to test VGC teams in Swiss rounds.', 'Store credit for top cut', '£5.00', '{}'),
(3, 'Weekly GO PvP Practice', '2026-06-05', '16:30', 3, NULL, 'CASUAL', 'GO', 'Friday afternoon Pokemon GO PVP matchmaking and raiding.', 'None', 'Free', '{}');

-- Reset sequence for events and weekly events (shared sequence)
SELECT setval('public.event_id_seq', GREATEST((SELECT MAX(id) FROM public.events), (SELECT MAX(id) FROM public.weekly_events)));
