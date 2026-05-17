import json
from datetime import datetime

events = []
event_id = 1

def add_event(name, date_str, time_str, league_id, league_name, type_, game, desc=""):
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
        "description": desc
    })
    event_id += 1

# Weeklies:
# Swansea Jack (1): Wednesdays (6, 13, 20, 27) at 18:30
for d in [6, 13, 20, 27]:
    add_event("Weekly Standard", f"2026-05-{d:02d}T00:00:00.000Z", "18:30:00", 1, "Swansea Jack", "STANDARD", "TCG", "Weekly standard tournament")

# Gamers Emporium (3): Fridays (1, 8, 15, 22, 29) at 19:00
for d in [1, 8, 15, 22, 29]:
    add_event("Weekly Standard", f"2026-05-{d:02d}T00:00:00.000Z", "19:00:00", 3, "Gamers Emporium", "STANDARD", "TCG", "Weekly standard tournament")

# Firestorm Games (4): Tuesdays (5, 12, 19, 26) at 18:30
for d in [5, 12, 19, 26]:
    add_event("Weekly Standard", f"2026-05-{d:02d}T00:00:00.000Z", "18:30:00", 4, "Firestorm Games", "STANDARD", "TCG", "Weekly standard tournament")

# Common Meeple Casual Sundays (3, 10, 17, 24, 31)
for d in [3, 10, 17, 24, 31]:
    add_event("Sunday Casual", f"2026-05-{d:02d}T00:00:00.000Z", "13:00:00", 2, "Common Meeple", "CASUAL", "TCG", "Casual play and trading")

# Weekend Events (PR, Challenge, Cup)
# Pre-release (TCG only)
add_event("New Set Pre-release", "2026-05-02T00:00:00.000Z", "10:00:00", 4, "Firestorm Games", "PRE-RELEASE", "TCG", "Get your hands on the new set early!")
add_event("New Set Pre-release", "2026-05-17T00:00:00.000Z", "11:00:00", 1, "Swansea Jack", "PRE-RELEASE", "TCG", "Pre-release tournament")

# Challenges
add_event("May League Challenge", "2026-05-10T00:00:00.000Z", "12:00:00", 1, "Swansea Jack", "CHALLENGE", "TCG", "Earn championship points!")
add_event("VGC League Challenge", "2026-05-30T00:00:00.000Z", "10:30:00", 2, "Common Meeple", "CHALLENGE", "VGC", "Video Game League Challenge")

# Cups
add_event("May League Cup", "2026-05-23T00:00:00.000Z", "09:30:00", 3, "Gamers Emporium", "CUP", "TCG", "Large prize pool league cup")

with open("c:\\Users\\lukee\\Documents\\Projects\\playwales\\data\\events.json", "w") as f:
    json.dump(events, f, indent=4)
