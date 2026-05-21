import json
import os
from datetime import datetime, timedelta, date

events = []
event_id = 1

def add_event(name, date_str, time_str, league_id, league_name, type_, game, desc="", prizes="", entry_fee=""):
    global event_id
    events.append({
        "id": event_id,
        "name": name,
        "date": date_str,
        "startTime": time_str,
        "leagueId": league_id,
        "leagueName": league_name,
        "ticketLink": f"http://example.com/tickets/{event_id}",
        "type": type_,
        "game": game,
        "description": desc,
        "prizes": prizes,
        "entryFee": entry_fee
    })
    event_id += 1

# Generate from May 1, 2025 to August 31, 2026
start_date = date(2025, 5, 1)
end_date = date(2026, 8, 31)

current_date = start_date
while current_date <= end_date:
    date_str = current_date.strftime("%Y-%m-%dT00:00:00.000Z")
    weekday = current_date.weekday() # 0 = Mon, 6 = Sun
    day = current_date.day
    
    # Track which leagues have events today to avoid clashes
    leagues_with_events = set()

    # Pre-releases (9th, 10th, 16th, 17th)
    # Each league does 2 events.
    # Distributing 10 events:
    # 9th: 1, 2, 3
    # 10th: 4, 5
    # 16th: 1, 2, 3
    # 17th: 4, 5
    if day == 9:
        add_event("New Set Pre-release", date_str, "10:00:00", 1, "Swansea Jack", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "10:30:00", 2, "Common Meeple", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "11:00:00", 3, "Gamers Emporium", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        leagues_with_events.update([1, 2, 3])
    elif day == 10:
        add_event("New Set Pre-release", date_str, "10:00:00", 4, "Firestorm Games", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "10:30:00", 5, "Badger Badger", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        leagues_with_events.update([4, 5])
    elif day == 16:
        add_event("New Set Pre-release", date_str, "10:00:00", 1, "Swansea Jack", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "10:30:00", 2, "Common Meeple", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "11:00:00", 3, "Gamers Emporium", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        leagues_with_events.update([1, 2, 3])
    elif day == 17:
        add_event("New Set Pre-release", date_str, "10:00:00", 4, "Firestorm Games", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        add_event("New Set Pre-release", date_str, "10:30:00", 5, "Badger Badger", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
        leagues_with_events.update([4, 5])

    # Weeklies
    if weekday == 2 and 1 not in leagues_with_events: # Wednesday
        add_event("Weekly Standard", date_str, "18:30:00", 1, "Swansea Jack", "STANDARD", "TCG", "Weekly standard tournament", "Pack per win", "£5.00")
    elif weekday == 4 and 3 not in leagues_with_events: # Friday
        add_event("Weekly Standard", date_str, "19:00:00", 3, "Gamers Emporium", "STANDARD", "TCG", "Weekly standard tournament", "2 Packs per win", "£6.00")
    elif weekday == 1 and 4 not in leagues_with_events: # Tuesday
        add_event("Weekly Standard", date_str, "18:30:00", 4, "Firestorm Games", "STANDARD", "TCG", "Weekly standard tournament", "Store credit", "£5.00")
    elif weekday == 6 and 2 not in leagues_with_events: # Sunday
        add_event("Sunday Casual", date_str, "13:00:00", 2, "Common Meeple", "CASUAL", "TCG", "Casual play and trading", "Promo packs", "£3.00")
    elif weekday == 3 and 5 not in leagues_with_events: # Thursday
        add_event("Weekly Standard", date_str, "18:30:00", 5, "Badger Badger", "STANDARD", "TCG", "Weekly standard tournament", "Pack per win", "£5.00")

    # Weekend Events (Challenge, Cup)
    if weekday in [5, 6]: # Saturday or Sunday
        if day <= 7:
            if weekday == 5: # First Saturday
                if 1 not in leagues_with_events:
                    add_event("League Challenge", date_str, "12:00:00", 1, "Swansea Jack", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
            else: # First Sunday
                if 2 not in leagues_with_events:
                    add_event("League Challenge", date_str, "12:00:00", 2, "Common Meeple", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
        elif 8 <= day <= 14:
            if weekday == 5: # Second Saturday
                if 3 not in leagues_with_events:
                    add_event("League Challenge", date_str, "12:00:00", 3, "Gamers Emporium", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
            elif weekday == 6: # Second Sunday
                if 4 not in leagues_with_events:
                    add_event("League Challenge", date_str, "12:00:00", 4, "Firestorm Games", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
        elif 15 <= day <= 21:
            if weekday == 5: # Third Saturday
                if 5 not in leagues_with_events:
                    add_event("League Challenge", date_str, "12:00:00", 5, "Badger Badger", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
            elif weekday == 6: # Third Sunday
                q_month = (current_date.month - 1) % 3
                l_id = -1
                l_name = ""
                if q_month == 0:
                    l_id, l_name = 1, "Swansea Jack"
                elif q_month == 1:
                    l_id, l_name = 3, "Gamers Emporium"
                elif q_month == 2:
                    l_id, l_name = 5, "Badger Badger"
                
                if l_id not in leagues_with_events:
                    add_event("League Cup", date_str, "09:30:00", l_id, l_name, "CUP", "TCG", "Large prize pool league cup", "Exclusive Playmat + CP + Packs", "£20.00")
        elif 22 <= day <= 28:
            if weekday == 5: # Fourth Saturday
                if 2 not in leagues_with_events:
                    add_event("VGC League Challenge", date_str, "10:30:00", 2, "Common Meeple", "CHALLENGE", "VGC", "Video Game League Challenge", "CP + Store credit", "£10.00")
                
                q_month = (current_date.month - 1) % 3
                l_id = -1
                l_name = ""
                if q_month == 0:
                    l_id, l_name = 2, "Common Meeple"
                elif q_month == 1:
                    l_id, l_name = 4, "Firestorm Games"
                
                if l_id != -1 and l_id not in leagues_with_events:
                    add_event("League Cup", date_str, "09:30:00", l_id, l_name, "CUP", "TCG", "Large prize pool league cup", "Exclusive Playmat + CP + Packs", "£20.00")

    current_date += timedelta(days=1)

output_file = os.path.join(os.path.dirname(__file__), "data", "events.json")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(events, f, indent=4)
