import os
from datetime import datetime, timedelta
from app import create_app, db
from app.models import League, Event

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Add Leagues
        leagues = [
            League(name="Firestorm Games Cardiff", logo="https://example.com/logo1.png", website="https://cardiffpokemon.com", social_link="https://facebook.com/cardiffpokemon", brand_color="#FF0000", location="Cardiff, UK", latitude=51.4816, longitude=-3.1791),
            League(name="Gamers Emporium", logo="https://example.com/logo2.png", website="https://swanseapokemon.com", brand_color="#00533A", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
            League(name="Badger Badger", logo="https://example.com/logo3.png", website="https://thecomicality.com", brand_color="#FFE600", location="Newport, UK", latitude=51.5883, longitude=-2.9978),
            League(name="Swansea Jack", logo="https://example.com/logo4.png", website="https://thegameshub.co.uk", brand_color="#FFFFFF", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
            League(name="Firestorm Games Bridgend", logo="https://example.com/logo5.png", website="https://firestormgames.co.uk", brand_color="#633434", location="Bridgend, UK", latitude=51.5008, longitude=-3.5758),
            League(name="Common Meeple", logo="https://example.com/logo6.png", website="https://commonmeeple.co.uk", brand_color="#7800BD", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
        ]

        db.session.add_all(leagues)
        db.session.commit()

        # Rules for event generation
        # Weekly: (League Index, Weekday (0=Mon, 6=Sun), Time)
        weekly_rules = [
            (0, 4, "18:00"), # Cardiff: Friday
            (1, 1, "18:00"), # GE: Tuesday
            (2, 3, "18:30"), # Badger: Thursday
            (3, 0, "19:00"), # Jack: Monday
            (4, 2, "18:00"), # Bridgend: Wednesday
            (5, 4, "18:00"), # Meeple: Friday
        ]

        start_date = datetime(2025, 11, 23)
        end_date = datetime(2026, 11, 23)
        
        all_events = []
        current_date = start_date

        while current_date <= end_date:
            weekday = current_date.weekday()
            month = current_date.month
            day = current_date.day
            year = current_date.year
            
            # 1. Weekly Standards
            for league_idx, target_weekday, start_time in weekly_rules:
                if weekday == target_weekday:
                    all_events.append(Event(
                        name=f"{leagues[league_idx].name} Standard",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time=start_time,
                        league_id=leagues[league_idx].id,
                        event_type="STANDARD",
                        game="TCG"
                    ))

            # 2. Monthly Challenges (2nd Saturday of every month for each league)
            # We'll offset them so they don't all land on the same Saturday
            if weekday == 5: # Saturday
                # Simple logic for "nth" Saturday: day between 8-14 is 2nd Sat
                if 8 <= day <= 14:
                    # League 0, 1, 2
                    for i in range(3):
                        all_events.append(Event(
                            name=f"{leagues[i].name} League Challenge",
                            date=current_date.strftime("%Y-%m-%d"),
                            start_time="11:00",
                            league_id=leagues[i].id,
                            event_type="CHALLENGE",
                            game="TCG",
                            entry_fee="£10"
                        ))
                # day between 15-21 is 3rd Sat
                elif 15 <= day <= 21:
                    # League 3, 4, 5
                    for i in range(3, 6):
                        all_events.append(Event(
                            name=f"{leagues[i].name} League Challenge",
                            date=current_date.strftime("%Y-%m-%d"),
                            start_time="11:00",
                            league_id=leagues[i].id,
                            event_type="CHALLENGE",
                            game="TCG",
                            entry_fee="£10"
                        ))

            # 3. Quarterly Cups (1st Sunday of Jan, Apr, Jul, Oct)
            if weekday == 6 and month in [1, 4, 7, 10] and 1 <= day <= 7:
                # Rotate which leagues host cups to avoid clashing too much
                # Just give them all a cup in those months for simplicity of the mock data
                for league in leagues:
                    all_events.append(Event(
                        name=f"{league.name} League Cup",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time="10:00",
                        league_id=league.id,
                        event_type="CUP",
                        game="TCG",
                        entry_fee="£20",
                        prizes="Champion Playmat + CP"
                    ))

            current_date += timedelta(days=1)

        db.session.add_all(all_events)
        db.session.commit()
        print(f"Database seeded with {len(all_events)} events!")

if __name__ == "__main__":
    seed_data()

