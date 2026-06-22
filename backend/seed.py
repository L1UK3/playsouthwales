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
            "location": "South Wales Gaming Centre, Trade Street, Cardiff",
            "latitude": 51.4743,
            "longitude": -3.1784,
        },
        {
            "name": "Geek Retreat Cardiff",
            "logo": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150",
            "website": "https://geek-retreat.uk/locations/geek-retreat-cardiff",
            "socialLink": "https://facebook.com/GeekRetreatCardiff",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/17439",
            "brandColor": "oklch(0.79 0.16 85)",  # Geek Retreat Yellow
            "webLink": "https://geek-retreat.uk/locations/geek-retreat-cardiff/events",
            "location": "24-26 Morgan Arcade, Cardiff",
            "latitude": 51.4795,
            "longitude": -3.1764,
        },
        {
            "name": "The Gamers' Emporium Swansea",
            "logo": "https://images.unsplash.com/photo-1613771404724-17c1e8a0022d?w=150",
            "website": "https://www.thegamersemporium.co.uk",
            "socialLink": "https://facebook.com/TheGamersEmporium",
            "pokemonLink": "https://events.pokemon.com/en-us/leagues/19842",
            "brandColor": "oklch(0.60 0.22 150)",  # Leaf Green
            "webLink": "https://www.thegamersemporium.co.uk/events",
            "location": "8 High Street, Swansea",
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
            "location": "Upstairs Tesco Extra, Newport Retail Park, Newport",
            "latitude": 51.5794,
            "longitude": -2.9351,
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
        {
            "name": "Cardiff TCG League Challenge",
            "date": "2026-07-10",
            "startTime": "18:30",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-challenge-07-10",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Official Play! Pokémon TCG League Challenge. Standard Format. Decklists required.",
            "prizes": "Championship Points + Booster Pack prizes",
            "entryFee": "£7.50",
        },
        {
            "name": "Cardiff TCG League Cup",
            "date": "2026-07-25",
            "startTime": "10:00",
            "leagueId": league_ids["Firestorm Games Cardiff"],
            "ticketLink": "https://www.firestormgames.co.uk/events/cardiff-tcg-cup-07-25",
            "eventType": "CUP",
            "game": "TCG",
            "description": "Premier TCG League Cup event. Best-of-3 Swiss rounds plus Top Cut. Decklists required.",
            "prizes": "Exclusive Champion Playmat + CP + Booster packs",
            "entryFee": "£15.00",
        },
        {
            "name": "Geek Retreat Weekly Pokémon Club",
            "date": "2026-07-12",
            "startTime": "12:00",
            "leagueId": league_ids["Geek Retreat Cardiff"],
            "ticketLink": "https://geek-retreat.uk/cardiff-weekly",
            "eventType": "CASUAL",
            "game": "TCG",
            "description": "Casual meet, trade, and play session. Perfect for new players and children.",
            "prizes": "Promotional packs and cards for participants",
            "entryFee": "£5.00",
        },
        {
            "name": "Swansea TCG League Challenge",
            "date": "2026-07-18",
            "startTime": "11:00",
            "leagueId": league_ids["The Gamers' Emporium Swansea"],
            "ticketLink": "https://www.thegamersemporium.co.uk/event/swansea-tcg-challenge",
            "eventType": "CHALLENGE",
            "game": "TCG",
            "description": "Swansea local League Challenge. Standard format.",
            "prizes": "Championship Points",
            "entryFee": "£6.00",
        },
        {
            "name": "Newport VGC Premier Challenge",
            "date": "2026-07-19",
            "startTime": "12:30",
            "leagueId": league_ids["Firestorm Games Newport"],
            "ticketLink": "https://www.firestormgames.co.uk/events/newport-vgc-pc",
            "eventType": "CHALLENGE",
            "game": "VGC",
            "description": "Newport VGC Premier Challenge. Double battles played on Nintendo Switch.",
            "prizes": "Championship Points",
            "entryFee": "£8.00",
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
