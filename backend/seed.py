import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
# Use the service role / secret key to bypass RLS policies during seeding, fallback to anon key if not set
supabase_key = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SECRET_KEY")
    or os.environ.get("SUPABASE_KEY")
)

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY (or secret key) must be set in environment variables.")

supabase: Client = create_client(supabase_url, supabase_key)


def seed_database():
    print("Starting database seeding...")

    # 1. Truncate existing data (deleting events first because they reference leagues via foreign key)
    print("Clearing existing events...")
    try:
        # Delete all events (filtering by id is not 0 ensures we match all)
        supabase.table("event").delete().neq("id", 0).execute()
        print("Events cleared successfully.")
    except Exception as e:
        print(f"Warning: Failed to clear events or table is empty: {e}")

    print("Clearing existing leagues...")
    try:
        # Delete all leagues
        supabase.table("league").delete().neq("id", 0).execute()
        print("Leagues cleared successfully.")
    except Exception as e:
        print(f"Warning: Failed to clear leagues or table is empty: {e}")

    # 2. Insert mock leagues
    print("Inserting mock leagues...")
    mock_leagues = [
        {
            "name": "Firestorm Games Cardiff",
            "logo": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150",
            "website": "https://www.firestormgames.co.uk",
            "socialLink": "https://facebook.com/firestormgames",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/16541",
            "brandColor": "oklch(0.62 0.17 220)",  # Firestorm Blue/Teal
            "webLink": "https://www.thesouthwalesgamingcentre.co.uk/events",
            "location": "South Wales Gaming Centre, Trade Street, Cardiff, CF10 5DT",
            "latitude": 51.4743,
            "longitude": -3.1784,
        },
        {
            "name": "The Gamers' Emporium Swansea",
            "logo": "https://images.unsplash.com/photo-1613771404724-17c1e8a0022d?w=150",
            "website": "https://www.thegamersemporium.co.uk",
            "socialLink": "https://facebook.com/TheGamersEmporium",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/19842",
            "brandColor": "oklch(0.60 0.22 150)",  # Leaf Green
            "webLink": "https://www.thegamersemporium.co.uk/events",
            "location": "8 High Street, Swansea, SA1 1LE",
            "latitude": 51.6231,
            "longitude": -3.9427,
        },
        {
            "name": "Firestorm Games Newport",
            "logo": "https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=150",
            "website": "https://www.firestormgames.co.uk/newport",
            "socialLink": "https://facebook.com/FirestormGamesNewport",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/15321",
            "brandColor": "oklch(0.55 0.21 280)",  # Newport Purple
            "webLink": "https://www.firestormgames.co.uk/newport-events",
            "location": "Upstairs Tesco Extra, Newport Retail Park, Newport, NP19 4QQ",
            "latitude": 51.5794,
            "longitude": -2.9351,
        },
        {
            "name": "Brown Bear Games Newport",
            "logo": "https://images.unsplash.com/photo-1559251606-c623743a6d76?w=150",
            "website": "https://www.brownbeargames.co.uk",
            "socialLink": "https://facebook.com/brownbeargamesnewport",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/20993",
            "brandColor": "oklch(0.45 0.12 45)",  # Brown Bear
            "webLink": "https://www.brownbeargames.co.uk/events",
            "location": "1 Newport Arcade, High Street, Newport, NP20 1GD",
            "latitude": 51.5886,
            "longitude": -2.9970,
        },
        {
            "name": "Kraken Gaming Llanelli",
            "logo": "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=150",
            "website": "https://krakengaming.co.uk",
            "socialLink": "https://facebook.com/KrakenGamingLlanelli",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/18452",
            "brandColor": "oklch(0.40 0.18 190)",  # Kraken Deep Sea Teal
            "webLink": "https://krakengaming.co.uk/events",
            "location": "52 Stepney Street, Llanelli, SA15 3TR",
            "latitude": 51.6815,
            "longitude": -4.1620,
        },
    ]

    try:
        res = supabase.table("league").insert(mock_leagues).execute()
        inserted_leagues = res.data or []
        print(f"Successfully inserted {len(inserted_leagues)} leagues.")
    except Exception as e:
        print(f"Error inserting leagues: {e}")
        return

    # Map league names to their newly generated IDs
    league_ids = {league["name"]: league["id"] for league in inserted_leagues}

    print("Inserting mock events...")
    mock_events = [
        # --- February 2026 ---
        {
            "name": "Cardiff Pokémon TCG League Challenge",
            "date": "2026-02-10",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-challenge-02-10",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Play! Pokémon League Challenge. Standard format. Decklists required.",
            "prizes": "Championship Points + booster packs",
            "entryFee": "£7.50",
        },
        {
            "name": "Newport VGC Premier Challenge",
            "date": "2026-02-15",
            "startTime": "12:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-vgc-pc-02-15",
            "eventType": "CHALLENGE",
            "game": "VGC",
            "description": "Newport VGC Premier Challenge. Played on Nintendo Switch. Standard ruleset.",
            "prizes": "Championship Points based on attendance",
            "entryFee": "£8.00",
        },
        {
            "name": "Swansea Pokémon TCG League Cup",
            "date": "2026-02-21",
            "startTime": "10:30",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-cup-feb",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Swansea Pokémon League Cup. Standard format. Best-of-3 Swiss rounds + top cut.",
            "prizes": "Champion Playmat + Championship Points + Booster packs",
            "entryFee": "£12.50",
        },
        {
            "name": "Brown Bear Pokémon Casual Gaming Night",
            "date": "2026-02-05",
            "startTime": "17:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/casual-play-02-05",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Weekly casual meetup, trade, and friendly matches. Ideal for new players.",
            "prizes": "Promotional booster packs for all participants",
            "entryFee": "£5.00",
        },
        {
            "name": "Llanelli Pokémon Club Weekly Play",
            "date": "2026-02-11",
            "startTime": "16:30",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-club-02-11",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Casual play and learn-to-play session for young trainers and families.",
            "prizes": "Promo cards and pop packs",
            "entryFee": "£4.00",
        },
        {
            "name": "Brown Bear Pokémon TCG League Challenge",
            "date": "2026-02-18",
            "startTime": "18:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/league-challenge-feb",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Newport League Challenge. Standard format. Swiss rounds.",
            "prizes": "Championship Points for top finishers",
            "entryFee": "£6.00",
        },

        # --- March 2026 ---
        {
            "name": "Cardiff Pokémon TCG League Cup",
            "date": "2026-03-08",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-cup-03-08",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Premier TCG League Cup event. Best-of-3 Swiss rounds plus Top Cut.",
            "prizes": "Exclusive Champion Playmat + CP + Booster packs",
            "entryFee": "£15.00",
        },
        {
            "name": "Swansea Pokémon TCG League Challenge",
            "date": "2026-03-14",
            "startTime": "11:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-challenge-march",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Swansea League Challenge. Standard format. Bring 60-card deck and decklist.",
            "prizes": "Championship Points + Booster pack per player",
            "entryFee": "£6.50",
        },
        {
            "name": "Brown Bear Temporal Forces Pre-Release",
            "date": "2026-03-15",
            "startTime": "11:30",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/temporal-forces-prerelease",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Get cards before release! Includes Build & Battle box with 4 booster packs.",
            "prizes": "Extra booster packs for completing the event",
            "entryFee": "£22.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Challenge",
            "date": "2026-03-18",
            "startTime": "18:00",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-challenge-march",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Llanelli League Challenge. Standard format. Standard Swiss rounds.",
            "prizes": "Championship Points + TCG booster packs",
            "entryFee": "£6.00",
        },
        {
            "name": "Newport Pokémon TCG League Challenge",
            "date": "2026-03-24",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-tcg-challenge-03-24",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Newport store League Challenge. Decklist required. Standard format.",
            "prizes": "Play! Pokémon Championship Points",
            "entryFee": "£7.50",
        },

        # --- April 2026 ---
        {
            "name": "Cardiff VGC Midseason Showdown",
            "date": "2026-04-11",
            "startTime": "09:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-vgc-mss-april",
            "eventType": "CUP",
            "game": "VGC",
            "description": "VGC Midseason Showdown tournament. Played on Nintendo Switch. Team sheets required.",
            "prizes": "Elevated Championship Points + cash/store credit prizes",
            "entryFee": "£15.00",
        },
        {
            "name": "Newport Pokémon TCG League Cup",
            "date": "2026-04-18",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-tcg-cup-04-18",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Official Newport League Cup. Standard format. Swiss with Top Cut.",
            "prizes": "Cup Playmat + booster packs + Championship Points",
            "entryFee": "£13.50",
        },
        {
            "name": "Brown Bear Pokémon TCG League Challenge",
            "date": "2026-04-19",
            "startTime": "12:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/league-challenge-april",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Monthly League Challenge at Newport Arcade. Standard format.",
            "prizes": "Championship Points for placement",
            "entryFee": "£6.00",
        },
        {
            "name": "Swansea Pokémon Casual Trade Day",
            "date": "2026-04-26",
            "startTime": "12:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/casual-trade-april",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Bring your binders and swap cards in a safe, friendly environment.",
            "prizes": "Promo cards for participating",
            "entryFee": "£3.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Challenge",
            "date": "2026-04-29",
            "startTime": "18:00",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-challenge-april",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Wednesday League Challenge at Llanelli.",
            "prizes": "Championship Points",
            "entryFee": "£6.00",
        },

        # --- May 2026 ---
        {
            "name": "Cardiff Pokémon TCG League Challenge",
            "date": "2026-05-12",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-challenge-05-12",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Tuesday night League Challenge. Standard format. Deck check at 18:15.",
            "prizes": "Championship Points and booster packs",
            "entryFee": "£7.50",
        },
        {
            "name": "Brown Bear Twilight Masquerade Pre-Release",
            "date": "2026-05-16",
            "startTime": "11:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/twilight-masquerade-prerelease",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Twilight Masquerade Pre-Release tournament. Build a deck with the new cards.",
            "prizes": "Twilight Masquerade booster packs for completing the Swiss rounds",
            "entryFee": "£22.00",
        },
        {
            "name": "Newport VGC Premier Challenge",
            "date": "2026-05-17",
            "startTime": "12:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-vgc-pc-05-17",
            "eventType": "CHALLENGE",
            "game": "VGC",
            "description": "VGC Premier Challenge. Played on Nintendo Switch. Regulation G ruleset.",
            "prizes": "Championship Points",
            "entryFee": "£8.00",
        },
        {
            "name": "Swansea Pokémon TCG League Cup",
            "date": "2026-05-23",
            "startTime": "10:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-cup-may",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Premier TCG League Cup in Swansea. Best-of-3 Swiss rounds and Top Cut.",
            "prizes": "Winner's Playmat, Championship Points, and prize boosters",
            "entryFee": "£14.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Challenge",
            "date": "2026-05-27",
            "startTime": "18:00",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-challenge-may",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official mid-week League Challenge at Llanelli.",
            "prizes": "Championship Points based on finishing rank",
            "entryFee": "£6.00",
        },

        # --- June 2026 ---
        {
            "name": "Cardiff Pokémon TCG League Cup",
            "date": "2026-06-07",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-cup-06-07",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Summer League Cup at Firestorm. Best-of-3 Swiss rounds and Top Cut.",
            "prizes": "Winner Playmat + CP + Booster packs",
            "entryFee": "£15.00",
        },
        {
            "name": "Brown Bear Pokémon TCG League Challenge",
            "date": "2026-06-14",
            "startTime": "12:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/league-challenge-june",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Sunday League Challenge at Newport Arcade. standard format.",
            "prizes": "Championship Points + Promos",
            "entryFee": "£6.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Cup",
            "date": "2026-06-20",
            "startTime": "10:30",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-cup-june",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Official League Cup at Kraken Gaming. Standard format. Swiss with Top Cut.",
            "prizes": "Winner Playmat + CP + Booster packs",
            "entryFee": "£12.50",
        },
        {
            "name": "Swansea Pokémon TCG League Challenge",
            "date": "2026-06-21",
            "startTime": "11:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-challenge-june",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Sunday morning League Challenge in Swansea. Standard format.",
            "prizes": "Championship Points and prize booster packs",
            "entryFee": "£6.50",
        },
        {
            "name": "Newport Pokémon TCG League Challenge",
            "date": "2026-06-23",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-tcg-challenge-06-23",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Newport store League Challenge. Standard format. Swiss rounds.",
            "prizes": "Championship Points",
            "entryFee": "£7.50",
        },

        # --- July 2026 ---
        {
            "name": "Cardiff Pokémon TCG League Challenge",
            "date": "2026-07-07",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-challenge-07-07",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Tuesday night League Challenge. Standard format. Bring decklist.",
            "prizes": "Championship Points and booster packs",
            "entryFee": "£7.50",
        },
        {
            "name": "Newport Pokémon TCG League Cup",
            "date": "2026-07-11",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-tcg-cup-07-11",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Summer Newport League Cup. Best-of-3 Swiss with Top Cut.",
            "prizes": "Winner Playmat + CP + Booster packs",
            "entryFee": "£13.50",
        },
        {
            "name": "Swansea Pokémon TCG League Challenge",
            "date": "2026-07-18",
            "startTime": "11:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-challenge-july",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Swansea League Challenge. Standard format.",
            "prizes": "Championship Points",
            "entryFee": "£6.50",
        },
        {
            "name": "Brown Bear Pokémon TCG League Challenge",
            "date": "2026-07-19",
            "startTime": "12:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/league-challenge-july",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Newport Arcade League Challenge. Swiss rounds. Standard format.",
            "prizes": "Championship Points + Promos",
            "entryFee": "£6.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Challenge",
            "date": "2026-07-29",
            "startTime": "18:00",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-challenge-july",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Llanelli mid-week League Challenge. Standard format.",
            "prizes": "Championship Points",
            "entryFee": "£6.00",
        },

        # --- August 2026 ---
        {
            "name": "Cardiff Shrouded Fable Celebration",
            "date": "2026-08-04",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-shrouded-fable-celebration",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Celebrate the release of the Shrouded Fable special expansion set with casual play and giveaways.",
            "prizes": "Shrouded Fable promo items and booster packs",
            "entryFee": "£10.00",
        },
        {
            "name": "Swansea Pokémon TCG League Cup",
            "date": "2026-08-15",
            "startTime": "10:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-cup-august",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Late summer League Cup in Swansea. Best-of-3 Swiss rounds and Top Cut.",
            "prizes": "Winner's Playmat, Championship Points, and prize boosters",
            "entryFee": "£14.00",
        },
        {
            "name": "Newport VGC Premier Challenge",
            "date": "2026-08-16",
            "startTime": "12:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-vgc-pc-08-16",
            "eventType": "CHALLENGE",
            "game": "VGC",
            "description": "VGC Premier Challenge. Played on Nintendo Switch. Standard format.",
            "prizes": "Championship Points",
            "entryFee": "£8.00",
        },
        {
            "name": "Brown Bear Pokémon TCG League Challenge",
            "date": "2026-08-23",
            "startTime": "12:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/league-challenge-august",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Newport League Challenge at Newport Arcade. Standard format.",
            "prizes": "Championship Points for placement",
            "entryFee": "£6.00",
        },
        {
            "name": "Llanelli Pokémon TCG League Challenge",
            "date": "2026-08-26",
            "startTime": "18:00",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-challenge-august",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Wednesday League Challenge at Llanelli.",
            "prizes": "Championship Points based on finishing rank",
            "entryFee": "£6.00",
        },

        # --- September 2026 ---
        {
            "name": "Brown Bear Stellar Crown Pre-Release",
            "date": "2026-09-06",
            "startTime": "11:00",
            "leagueId": league_ids["Brown Bear Games Newport"],
            "ticketLink": "https://www.brownbeargames.co.uk/events/stellar-crown-prerelease",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Be among the first to play with cards from Stellar Crown expansion set.",
            "prizes": "Stellar Crown booster packs for completing all rounds",
            "entryFee": "£22.00",
        },
        {
            "name": "Cardiff Pokémon TCG League Cup",
            "date": "2026-09-13",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-cup-09-13",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Autumn League Cup at Firestorm. Best-of-3 Swiss rounds and Top Cut.",
            "prizes": "Winner Playmat + CP + Booster packs",
            "entryFee": "£15.00",
        },
        {
            "name": "Swansea Pokémon TCG League Challenge",
            "date": "2026-09-19",
            "startTime": "11:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-challenge-september",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Sunday morning League Challenge in Swansea. Standard format.",
            "prizes": "Championship Points and prize booster packs",
            "entryFee": "£6.50",
        },
        {
            "name": "Newport Pokémon TCG League Challenge",
            "date": "2026-09-22",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-tcg-challenge-09-22",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Newport store League Challenge. Standard format. Swiss rounds.",
            "prizes": "Championship Points",
            "entryFee": "£7.50",
        },
        {
            "name": "Llanelli Pokémon TCG League Cup",
            "date": "2026-09-26",
            "startTime": "10:30",
            "leagueId": league_ids["Kraken Gaming Llanelli"],
            "ticketLink": "https://krakengaming.co.uk/events/pokemon-cup-september",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Official Autumn League Cup at Kraken Gaming. Standard format.",
            "prizes": "Winner Playmat + CP + Booster packs",
            "entryFee": "£12.50",
        },
    ]

    try:
        res = supabase.table("event").insert(mock_events).execute()
        inserted_events = res.data or []
        print(f"Successfully inserted {len(inserted_events)} events.")
    except Exception as e:
        print(f"Error inserting events: {e}")
        return

    print("Database seeding completed successfully!")


if __name__ == "__main__":
    seed_database()
