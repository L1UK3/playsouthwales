-- Seed data for Play! South Wales
-- Cardiff, Swansea, and Newport leagues, one-off events, and weekly events.

-- Clean up existing data to avoid primary key/unique constraint violations
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.weekly_events CASCADE;
TRUNCATE TABLE public.leagues CASCADE;
TRUNCATE TABLE public.leaderboards CASCADE;

-- Insert Leagues (Stores)
INSERT INTO public.leagues (
    id,
    name,
    logo,
    website,
    "socialLink",
    "eventLink",
    "brandColor",
    "webLink",
    location,
    latitude,
    longitude,
    accessibility,
    directions
) VALUES
(
    1,
    'Cardiff Dragon Guild',
    '/logos/cardiff-dragon-guild.png',
    'https://www.cardiffdragonguild.co.uk',
    'https://facebook.com/CardiffDragonGuild',
    'https://events.com/en-us/leagues/1',
    '#f15a24',
    'https://www.cardiffdragonguild.co.uk',
    'Sloper Road, Cardiff, CF11 8AB',
    51.468205,
    -3.204561,
    'Fully wheelchair accessible with step-free access.',
    'Near Cardiff City Stadium. Free parking on site.'
),
(
    2,
    'Mana Haven Cardiff',
    '/logos/mana-haven.png',
    'https://www.manahavencardiff.co.uk',
    'https://facebook.com/ManaHavenCardiff',
    'https://events.com/en-us/leagues/2',
    '#ffcc00',
    'https://www.manahavencardiff.co.uk',
    '29 Morgan Arcade, Cardiff, CF10 1AF',
    51.4795,
    -3.1785,
    'Ground floor is fully accessible.',
    'In Morgan Arcade, short walk from Cardiff Central Station.'
),
(
    3,
    'Kraken Hoard Swansea',
    '/logos/krakens-hoard.png',
    'https://www.krakenshoard.co.uk',
    'https://facebook.com/KrakensHoardSwansea',
    'https://events.com/en-us/leagues/3',
    '#4a2c84',
    'https://www.krakenshoard.co.uk',
    '8-9 Dillwyn Street, Swansea, SA1 4AE',
    51.6186,
    -3.9482,
    'Wheelchair friendly ground floor layout.',
    'Swansea Centre, near Quadrant Shopping Centre.'
),
(
    4,
    'Newport Card Crypt',
    '/logos/newport-card-crypt.png',
    'https://www.newportcardcrypt.co.uk',
    'https://facebook.com/NewportCardCrypt',
    'https://events.com/en-us/leagues/4',
    '#8b5a2b',
    'https://www.newportcardcrypt.co.uk',
    'Newport Arcade, Newport, NP20 1GD',
    51.5878,
    -2.9961,
    'Step-free access from High Street entrance.',
    'Inside Newport Arcade, near Newport Train Station.'
);

-- Insert One-off Events (events table)
INSERT INTO public.events (
    id,
    name,
    date,
    "startTime",
    "leagueId",
    "ticketLink",
    "eventType",
    game,
    description,
    prizes,
    "entryFee",
    "excludedDates"
) VALUES
(
    1,
    'TCG League Cup - Q3',
    '2026-07-11',
    '10:00',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'CUP',
    'TCG',
    'Compete in the official Q3 League Cup tournament! Format will be Standard. Decklists are required. Swiss rounds followed by a top cut. Event capacity is 64 players.',
    'Championship Points (up to 50 for 1st place), exclusive Champion playmat for division winners, and booster packs based on attendance.',
    '£15.00',
    NULL
),
(
    2,
    'VGC Midseason Showdown',
    '2026-07-25',
    '10:30',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'CHALLENGE',
    'VGC',
    'Bring your Nintendo Switch and battle it out in the official VGC Midseason Showdown. Played under current Regulation set rules. Team lists required. Swiss rounds.',
    'Championship Points toward Worlds qualification and custom store prizes.',
    '£10.00',
    NULL
),
(
    3,
    ' GO Championship Qualifier',
    '2026-08-08',
    '11:00',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'SPECIAL',
    'GO',
    'Official  GO Great League format tournament. Double elimination bracket. Scan in and fight for local glory and a spot at the Regional championships.',
    ' GO merchandise, in-game items, and Championship Points.',
    '£5.00',
    NULL
),
(
    4,
    ' TCG Autumn Regional Warmup',
    '2026-09-05',
    '09:30',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'REGIONAL',
    'TCG',
    'Prepare for the upcoming European Regionals with a full 9-round Swiss competitive tournament. Decklists required. Strict rules enforcement.',
    'Playmats, card binders, and double booster pack support for top finishers.',
    '£20.00',
    NULL
),
(
    5,
    ' TCG League Challenge',
    '2026-07-18',
    '11:00',
    2,
    'https://www.manahavencardiff.co.uk/events',
    'CHALLENGE',
    'TCG',
    'Perfect for players wanting to get their first taste of competitive  play. Standard format. Swiss format depending on player count.',
    'Championship Points for top finishers, promo cards for all participants.',
    '£6.00',
    NULL
),
(
    6,
    ' TCG Pre-release: New Season',
    '2026-08-15',
    '12:00',
    2,
    'https://www.manahavencardiff.co.uk/events',
    'PRE-RELEASE',
    'TCG',
    'Be among the first to play with the newest upcoming  TCG set. Players receive a Build & Battle Box containing a 40-card ready-to-play deck and 4 booster packs to customize their deck.',
    '3 additional booster packs for completing all rounds.',
    '£25.00',
    NULL
),
(
    7,
    ' TCG Autumn Cup',
    '2026-09-12',
    '11:00',
    2,
    'https://www.manahavencardiff.co.uk/events',
    'CUP',
    'TCG',
    'Our annual Autumn Cup is here! Gather your cards and join a day of competitive Standard format play. Top cut will receive playmats.',
    'Exclusive Autumn Playmat, Championship Points, and custom trophy for 1st place.',
    '£12.50',
    NULL
),
(
    8,
    ' TCG League Cup - Swansea',
    '2026-07-12',
    '10:30',
    3,
    'https://www.krakenshoard.co.uk/events',
    'CUP',
    'TCG',
    'Swansea''s official Q3 League Cup. Standard format. Decklists required. Join the local community and test your skill against South Wales'' best.',
    'Championship Points, Champion Playmat for winners, and card accessories.',
    '£15.00',
    NULL
),
(
    9,
    ' TCG League Challenge - Swansea',
    '2026-07-26',
    '13:00',
    3,
    'https://www.krakenshoard.co.uk/events',
    'CHALLENGE',
    'TCG',
    'July''s official League Challenge in Swansea. Standard format. Casual-friendly competitive structure.',
    'Championship Points, promo packs, and deck accessories.',
    '£6.00',
    NULL
),
(
    10,
    ' TCG Pre-release - Swansea',
    '2026-08-22',
    '11:30',
    3,
    'https://www.krakenshoard.co.uk/events',
    'PRE-RELEASE',
    'TCG',
    'Pre-release event for the new  expansion set. Fun, casual deck building and play for all ages.',
    'Promo cards and 3 prize packs for all players.',
    '£25.00',
    NULL
),
(
    11,
    ' TCG League Challenge - Newport',
    '2026-07-19',
    '12:00',
    4,
    'https://www.newportcardcrypt.co.uk/events',
    'CHALLENGE',
    'TCG',
    'Our official monthly League Challenge in Newport. Bring your best Standard deck and battle for CP.',
    'Championship Points, exclusive promos, and store tokens.',
    '£6.00',
    NULL
),
(
    12,
    ' TCG Newport Summer Cup',
    '2026-08-01',
    '10:00',
    4,
    'https://www.newportcardcrypt.co.uk/events',
    'CUP',
    'TCG',
    'Newport''s signature Summer League Cup. Standard format, Swiss rounds, Top cut playoff.',
    'League Cup Trophy, Champion Playmat, Championship Points, and booster pack prize pool.',
    '£15.00',
    NULL
);

-- Insert Weekly Events (weekly_events table)
INSERT INTO public.weekly_events (
    id,
    name,
    date,
    "startTime",
    "leagueId",
    "ticketLink",
    "eventType",
    game,
    description,
    prizes,
    "entryFee",
    "excludedDates"
) VALUES
(
    101,
    'Thursday  TCG League',
    '2026-05-07',
    '18:00',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'CASUAL',
    'TCG',
    'Our main weekly night for  TCG players. Perfect for juniors, seniors, and masters alike. Bring a standard deck or just come to learn how to play!',
    ' League promo cards and card packs.',
    '£5.00',
    ARRAY['2026-07-16']::text[] -- Excluded Thursday July 16, 2026 (convention conflict)
),
(
    102,
    'Sunday VGC Showdown Practice',
    '2026-05-03',
    '13:00',
    1,
    'https://www.cardiffdragonguild.co.uk/events',
    'CASUAL',
    'VGC',
    'Bring your Nintendo Switch and practice your battles with other VGC trainers. Friendly feedback, team building, and practice tournament rounds.',
    'Casual bragging rights and community building.',
    'Free',
    '{}'::text[]
),
(
    103,
    'Monday  TCG Club',
    '2026-05-04',
    '17:00',
    2,
    'https://www.manahavencardiff.co.uk/events',
    'CASUAL',
    'TCG',
    'Kick off the week with fellow trainers! A relaxed evening of trading, deck-testing, and casual matches.',
    'Promo card packs for playing.',
    '£3.50',
    '{}'::text[]
),
(
    104,
    'Wednesday GO Raid Hour Meetup',
    '2026-05-06',
    '17:45',
    2,
    'https://www.manahavencardiff.co.uk/events',
    'CASUAL',
    'GO',
    'Meet up at the store, trade , and head out together for the weekly 6 PM Legendary Raid Hour across Cardiff Centre!',
    'Raid rewards and local community stickers.',
    'Free',
    '{}'::text[]
),
(
    105,
    'Wednesday Night  Standard',
    '2026-05-06',
    '18:30',
    3,
    'https://www.krakenshoard.co.uk/events',
    'STANDARD',
    'TCG',
    'Mid-week competitive tournament for testing standard format decks. Standard rules, deck lists not required.',
    '1.5 booster packs per player added to the prize pool for top cut.',
    '£6.00',
    '{}'::text[]
),
(
    106,
    'Saturday GO & TCG Casuals',
    '2026-05-02',
    '11:00',
    3,
    'https://www.krakenshoard.co.uk/events',
    'CASUAL',
    'TCG',
    'Join us for a morning of . Trade cards, play casual TCG games, or swap GO trainer codes!',
    ' stickers and promo cards.',
    '£2.50',
    '{}'::text[]
),
(
    107,
    'Friday Night  TCG',
    '2026-05-01',
    '18:00',
    4,
    'https://www.newportcardcrypt.co.uk/events',
    'CASUAL',
    'TCG',
    'End the work week with casual  play at the Newport Card Crypt. Trade, chat, and test your new deck ideas.',
    'Random promo pack giveaways.',
    '£4.00',
    '{}'::text[]
),
(
    108,
    'Tuesday VGC Weekly Tournament',
    '2026-05-05',
    '18:30',
    4,
    'https://www.newportcardcrypt.co.uk/events',
    'STANDARD',
    'VGC',
    'Our weekly VGC event in Newport. Played on Nintendo Switch. Standard current VGC season rules apply.',
    'Store credit for top 3 players.',
    '£5.00',
    '{}'::text[]
);



-- Insert Leaderboards (Standings)
INSERT INTO public.leaderboards (id, "leagueId", data) VALUES
(1, 1, '[{"position": 1, "name": "Dylan Hughes", "wins": 28, "losses": 6, "draws": 2, "attendance": 12, "points": 86}, {"position": 2, "name": "Megan Davies", "wins": 25, "losses": 8, "draws": 3, "attendance": 12, "points": 78}, {"position": 3, "name": "Harri Owen", "wins": 22, "losses": 10, "draws": 4, "attendance": 12, "points": 70}, {"position": 4, "name": "Lowri Roberts", "wins": 19, "losses": 12, "draws": 5, "attendance": 12, "points": 62}, {"position": 5, "name": "Rhys Vaughan", "wins": 18, "losses": 14, "draws": 4, "attendance": 12, "points": 58}, {"position": 6, "name": "Carys Evans", "wins": 15, "losses": 16, "draws": 5, "attendance": 12, "points": 50}, {"position": 7, "name": "Osian Griffiths", "wins": 13, "losses": 18, "draws": 5, "attendance": 12, "points": 44}, {"position": 8, "name": "Bethan Lewis", "wins": 11, "losses": 20, "draws": 5, "attendance": 12, "points": 38}, {"position": 9, "name": "Ioan Thomas", "wins": 9, "losses": 23, "draws": 4, "attendance": 12, "points": 31}, {"position": 10, "name": "Sian Williams", "wins": 6, "losses": 26, "draws": 4, "attendance": 12, "points": 22}]'::jsonb),
(2, 2, '[{"position": 1, "name": "Connor Rees", "wins": 27, "losses": 7, "draws": 2, "attendance": 12, "points": 83}, {"position": 2, "name": "Ffion Jones", "wins": 24, "losses": 9, "draws": 3, "attendance": 12, "points": 75}, {"position": 3, "name": "Gavin Morgan", "wins": 21, "losses": 11, "draws": 4, "attendance": 12, "points": 67}, {"position": 4, "name": "Elin Roberts", "wins": 20, "losses": 12, "draws": 4, "attendance": 12, "points": 64}, {"position": 5, "name": "Dewi Jenkins", "wins": 17, "losses": 15, "draws": 4, "attendance": 12, "points": 55}, {"position": 6, "name": "Catrin Lloyd", "wins": 16, "losses": 16, "draws": 4, "attendance": 12, "points": 52}, {"position": 7, "name": "Geraint Bowen", "wins": 13, "losses": 19, "draws": 4, "attendance": 12, "points": 43}, {"position": 8, "name": "Anwen Morris", "wins": 10, "losses": 22, "draws": 4, "attendance": 12, "points": 34}, {"position": 9, "name": "Iestyn Powell", "wins": 9, "losses": 23, "draws": 4, "attendance": 12, "points": 31}, {"position": 10, "name": "Mari Davies", "wins": 4, "losses": 28, "draws": 4, "attendance": 12, "points": 16}]'::jsonb),
(3, 3, '[{"position": 1, "name": "Oliver Smith", "wins": 22, "losses": 10, "draws": 4, "attendance": 12, "points": 70}, {"position": 2, "name": "Amelia Taylor", "wins": 21, "losses": 11, "draws": 4, "attendance": 12, "points": 67}, {"position": 3, "name": "Jack Davies", "wins": 20, "losses": 12, "draws": 4, "attendance": 12, "points": 64}, {"position": 4, "name": "Isabella Jones", "wins": 16, "losses": 16, "draws": 4, "attendance": 12, "points": 52}, {"position": 5, "name": "Harry Evans", "wins": 15, "losses": 17, "draws": 4, "attendance": 12, "points": 49}, {"position": 6, "name": "Sophia Roberts", "wins": 12, "losses": 20, "draws": 4, "attendance": 12, "points": 40}, {"position": 7, "name": "Charlie Williams", "wins": 11, "losses": 21, "draws": 4, "attendance": 12, "points": 37}, {"position": 8, "name": "Mia Thomas", "wins": 10, "losses": 22, "draws": 4, "attendance": 12, "points": 34}, {"position": 9, "name": "George Hughes", "wins": 8, "losses": 24, "draws": 4, "attendance": 12, "points": 28}, {"position": 10, "name": "Emily Lewis", "wins": 3, "losses": 29, "draws": 4, "attendance": 12, "points": 13}]'::jsonb),
(4, 4, '[{"position": 1, "name": "Liam Jenkins", "wins": 25, "losses": 9, "draws": 2, "attendance": 12, "points": 77}, {"position": 2, "name": "Chloe Davies", "wins": 23, "losses": 10, "draws": 3, "attendance": 12, "points": 72}, {"position": 3, "name": "Ethan Evans", "wins": 20, "losses": 12, "draws": 4, "attendance": 12, "points": 64}, {"position": 4, "name": "Nia Jones", "wins": 19, "losses": 13, "draws": 4, "attendance": 12, "points": 61}, {"position": 5, "name": "Owen Roberts", "wins": 17, "losses": 15, "draws": 4, "attendance": 12, "points": 55}, {"position": 6, "name": "Lily Hughes", "wins": 14, "losses": 18, "draws": 4, "attendance": 12, "points": 46}, {"position": 7, "name": "Mason Thomas", "wins": 12, "losses": 20, "draws": 4, "attendance": 12, "points": 40}, {"position": 8, "name": "Ella Williams", "wins": 10, "losses": 22, "draws": 4, "attendance": 12, "points": 34}, {"position": 9, "name": "Jacob Lloyd", "wins": 9, "losses": 23, "draws": 4, "attendance": 12, "points": 31}, {"position": 10, "name": "Ruby Rees", "wins": 5, "losses": 27, "draws": 4, "attendance": 12, "points": 19}]'::jsonb);

-- Reset Sequences to start after the manually specified IDs
SELECT setval('public.league_id_seq', COALESCE((SELECT MAX(id) FROM public.leagues), 1));
SELECT setval('public.event_id_seq', COALESCE((SELECT MAX(id) FROM public.weekly_events), 1));
