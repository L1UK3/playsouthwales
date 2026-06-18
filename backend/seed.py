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
            League(name="FS - Cardiff", logo="https://example.com/logo1.png", website="https://cardiffpokemon.com", social_link="https://facebook.com/cardiffpokemon", brand_color="#FF0000", location="Cardiff, UK", latitude=51.4816, longitude=-3.1791),
            League(name="Gamers Emporium", logo="https://example.com/logo2.png", website="https://swanseapokemon.com", brand_color="#00533A", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
            League(name="Brown Bear", logo="https://example.com/logo3.png", website="https://thecomicality.com", brand_color="#FFE600", location="Newport, UK", latitude=51.5883, longitude=-2.9978),
            League(name="Swansea Jack", logo="https://example.com/logo4.png", website="https://thegameshub.co.uk", brand_color="#FFFFFF", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
            League(name="FS - Bridgend", logo="https://example.com/logo5.png", website="https://firestormgames.co.uk", brand_color="#633434", location="Bridgend, UK", latitude=51.5008, longitude=-3.5758),
            League(name="Common Meeple", logo="https://example.com/logo6.png", website="https://commonmeeple.co.uk", brand_color="#7800BD", location="Swansea, UK", latitude=51.6214, longitude=-3.9436),
        ]

        db.session.add_all(leagues)
        db.session.commit()

        # Rules for event generation
        # Weekly: (League Index, Weekday (0=Mon, 6=Sun), Time, Type, Description, Prizes)
        weekly_rules = [
            (0, 4, "18:00", "STANDARD", "Weekly Standard tournament. 3 rounds of Swiss.", "1 Pack per win"), # Cardiff: Friday
            (1, 1, "18:00", "STANDARD", "Weekly Standard tournament. 3 rounds of Swiss.", "1 Pack per win"), # GE: Tuesday
            (2, 3, "18:30", "STANDARD", "Weekly Standard tournament. 3 rounds of Swiss.", "1 Pack per win"), # Brown Bear: Thursday
            (3, 0, "19:00", "STANDARD", "Weekly Standard tournament. 3 rounds of Swiss.", "1 Pack per win"), # Jack: Monday
            (4, 2, "18:00", "STANDARD", "Weekly Standard tournament. 3 rounds of Swiss.", "1 Pack per win"), # FS - Bridgend: Wednesday
            (5, 6, "15:00", "CASUAL", "Sunday Casual play. Bring any deck and meet other players!", "Promo cards for participation"), # Common Meeple: Sunday
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
            
            # 1. Weekly Events
            for league_idx, target_weekday, start_time, e_type, desc, prizes in weekly_rules:
                if weekday == target_weekday:
                    all_events.append(Event(
                        name=f"{leagues[league_idx].name} {e_type.capitalize()}",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time=start_time,
                        league_id=leagues[league_idx].id,
                        event_type=e_type,
                        game="TCG",
                        description=desc,
                        prizes=prizes,
                        ticket_link="https://example.com/ticket-link"
                    ))

            # 2. Monthly Challenges
            if weekday == 5: # Saturday
                if 1 <= day <= 7: league_indices = [0]
                elif 8 <= day <= 14: league_indices = [1]
                elif 15 <= day <= 21: league_indices = [2]
                elif 22 <= day <= 28: league_indices = [3]
                else: league_indices = []
                
                for idx in league_indices:
                    all_events.append(Event(
                        name=f"{leagues[idx].name} League Challenge",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time="11:00",
                        league_id=leagues[idx].id,
                        event_type="CHALLENGE",
                        game="TCG",
                        entry_fee="£10",
                        description="A more competitive event where players compete for Championship Points.",
                        prizes="Booster packs based on attendance + Championship Points.",
                        ticket_link="https://example.com/ticket-link"
                    ))

            if weekday == 6: # Sunday
                if 1 <= day <= 7: league_indices = [4]
                elif 8 <= day <= 14: league_indices = [5]
                else: league_indices = []

                for idx in league_indices:
                    all_events.append(Event(
                        name=f"{leagues[idx].name} League Challenge",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time="11:00",
                        league_id=leagues[idx].id,
                        event_type="CHALLENGE",
                        game="TCG",
                        entry_fee="£10",
                        description="A more competitive event where players compete for Championship Points.",
                        prizes="Booster packs based on attendance + Championship Points.",
                        ticket_link="https://example.com/ticket-link"
                    ))

            # 3. Quarterly Cups
            if weekday == 6: # Sunday
                cup_league = -1
                if month in [1, 7]:
                    if 15 <= day <= 21: cup_league = 0
                    elif 22 <= day <= 28: cup_league = 1
                elif month in [2, 8]:
                    if 15 <= day <= 21: cup_league = 2
                    elif 22 <= day <= 28: cup_league = 3
                elif month in [3, 9]:
                    if 15 <= day <= 21: cup_league = 4
                    elif 22 <= day <= 28: cup_league = 5
                elif month in [4, 10]:
                    if 15 <= day <= 21: cup_league = 0
                    elif 22 <= day <= 28: cup_league = 1
                elif month in [5, 11]:
                    if 15 <= day <= 21: cup_league = 2
                    elif 22 <= day <= 28: cup_league = 3
                elif month in [6, 12]:
                    if 15 <= day <= 21: cup_league = 4
                    elif 22 <= day <= 28: cup_league = 5

                if cup_league != -1:
                    all_events.append(Event(
                        name=f"{leagues[cup_league].name} League Cup",
                        date=current_date.strftime("%Y-%m-%d"),
                        start_time="10:00",
                        league_id=leagues[cup_league].id,
                        event_type="CUP",
                        game="TCG",
                        entry_fee="£20",
                        description="A high-stakes tournament. The pinnacle of local League play.",
                        prizes="Champion Playmat, Booster Boxes, and a large amount of Championship Points.",
                        ticket_link="https://example.com/ticket-link"
                    ))

            # 4. Pre-releases (May 4th to May 17th)
            # Each league runs 2 pre-release events.
            # We will assign them to specific days in the window.
            # Window 2026: May 4 (Mon) to May 17 (Sun)
            if year == 2026 and month == 5:
                # Store-by-store assignments to avoid clashes
                # FS - Cardiff (0): Sat 9th (11:00), Sun 10th (11:00) - Clashes with Challenge on Sat 9th? No, FS - Cardiff Challenge is 1st Sat (2nd May).
                # FS - GE (1): Sat 16th (11:00), Sun 17th (11:00) - Clashes with Challenge on Sat 16th? FS - GE Challenge is 2nd Sat (9th May).
                # FS - Badger (2): Sat 9th (11:00), Sun 10th (11:00) - FS - Badger Challenge is 3rd Sat (16th May).
                # FS - Jack (3): Sat 16th (11:00), Sun 17th (11:00) - FS - Jack Challenge is 4th Sat (23rd May).
                # FS - Bridgend (4): Sat 9th (11:00), Sun 10th (11:00) - FS - Bridgend Challenge is 1st Sun (3rd May).
                # FS - Meeple (5): Sat 16th (11:00), Sun 17th (11:00) - FS - Meeple Challenge is 2nd Sun (10th May).

                pre_release_assignments = {
                    (2026, 5, 9): [0, 2, 4],
                    (2026, 5, 10): [0, 2, 4],
                    (2026, 5, 16): [1, 3, 5],
                    (2026, 5, 17): [1, 3, 5],
                }
                
                if (year, month, day) in pre_release_assignments:
                    for idx in pre_release_assignments[(year, month, day)]:
                        all_events.append(Event(
                            name=f"{leagues[idx].name} Pre-release",
                            date=current_date.strftime("%Y-%m-%d"),
                            start_time="11:00",
                            league_id=leagues[idx].id,
                            event_type="PRE-RELEASE",
                            game="TCG",
                            entry_fee="£25",
                            description="Get your hands on the newest set before it officially releases! Build a deck from a Build & Battle Box.",
                            prizes="3 additional booster packs at the end of the event.",
                            ticket_link="https://example.com/ticket-link"
                        ))

            current_date += timedelta(days=1)

        db.session.add_all(all_events)
        db.session.commit()
        print(f"Database seeded with {len(all_events)} events!")

if __name__ == "__main__":
    seed_data()
