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

    # Weeklies
    if weekday == 2: # Wednesday
        add_event("Weekly Standard", date_str, "18:30:00", 1, "Swansea Jack", "STANDARD", "TCG", "Weekly standard tournament", "Pack per win", "£5.00")
    elif weekday == 4: # Friday
        add_event("Weekly Standard", date_str, "19:00:00", 3, "Gamers Emporium", "STANDARD", "TCG", "Weekly standard tournament", "2 Packs per win", "£6.00")
    elif weekday == 1: # Tuesday
        add_event("Weekly Standard", date_str, "18:30:00", 4, "Firestorm Games", "STANDARD", "TCG", "Weekly standard tournament", "Store credit", "£5.00")
    elif weekday == 6: # Sunday
        add_event("Sunday Casual", date_str, "13:00:00", 2, "Common Meeple", "CASUAL", "TCG", "Casual play and trading", "Promo packs", "£3.00")

    # Weekend Events (PR, Challenge, Cup)
    if weekday in [5, 6]: # Saturday or Sunday
        if current_date.day <= 7:
            if weekday == 5: # First Saturday
                add_event("New Set Pre-release", date_str, "10:00:00", 4, "Firestorm Games", "PRE-RELEASE", "TCG", "Get your hands on the new set early!", "Build & Battle Box + 3 packs", "£25.00")
            else: # First Sunday
                add_event("New Set Pre-release", date_str, "11:00:00", 1, "Swansea Jack", "PRE-RELEASE", "TCG", "Pre-release tournament", "Build & Battle Box + 3 packs", "£25.00")
        elif 8 <= current_date.day <= 14:
            if weekday == 6: # Second Sunday
                add_event("League Challenge", date_str, "12:00:00", 1, "Swansea Jack", "CHALLENGE", "TCG", "Earn championship points!", "CP + Packs", "£10.00")
        elif 15 <= current_date.day <= 21:
            if weekday == 5: # Third Saturday
                add_event("League Cup", date_str, "09:30:00", 3, "Gamers Emporium", "CUP", "TCG", "Large prize pool league cup", "Exclusive Playmat + CP + Packs", "£20.00")
        elif 22 <= current_date.day <= 28:
            if weekday == 5: # Fourth Saturday
                add_event("VGC League Challenge", date_str, "10:30:00", 2, "Common Meeple", "CHALLENGE", "VGC", "Video Game League Challenge", "CP + Store credit", "£10.00")

    current_date += timedelta(days=1)

output_file = os.path.join(os.path.dirname(__file__), "data", "events.json")
with open(output_file, "w") as f:
    json.dump(events, f, indent=4)
