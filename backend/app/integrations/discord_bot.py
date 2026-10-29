import datetime
import logging
from typing import Literal, cast

import discord

from app.config import get_settings
from app.dependencies import supabase
from app.services.event import get_events_from_db

logger = logging.getLogger(__name__)

"""
Message examples:

**Weekly sanctioned events breakdown**

:round_pushpin: · Gdansk Regional Championships · {Dates} 
:trophy: · {league_name} · {game} · {date}
:medal:  · {league_name} · {game} · {date}
:medal: · {league_name} · {game} · {date}
:trophy:  · {league_name} · {game} · {date}
:medal: · {league_name} · {game} · {date}

https://www.playsouthwales.uk - :wales: 




**Daily events breakdown:** 
({date})

:medal: · {league_name} · {event_name} · {game}
S · {league_name} · {event_name} · {game} 
S · {league_name} · {event_name} · {game} 
S · {league_name} · {event_name} · {game} 
C · {league_name} · {event_name} · {game} 

https://www.playsouthwales.uk - :wales: 


"""


EVENT_TYPE_ICONS: dict[str, str] = {
    "CASUAL": "C",
    "STANDARD": "S",
    "CHALLENGE": "🏅",
    "CUP": "🏆",
    "PRE-RELEASE": "PR",
    "SPECIAL": "📍",
    "REGIONAL": "📍",
    "INTERNATIONAL": "INT",
    "WORLDS": "🌍",
    "LEGALITY": "Set Legal",
    "RELEASE": "Set Release",
    "REGULATION": "Reg Legal",
}

UNSANCTIONED_TYPES = {"CASUAL", "STANDARD"}
MAJOR_EVENT_TYPES = {"SPECIAL", "REGIONAL", "INTERNATIONAL", "WORLDS"}
FOOTER = "\n<https://www.playsouthwales.uk>"


def _get_icon(event: dict) -> str:
    event_type = event["eventType"] or ""
    return EVENT_TYPE_ICONS.get(event_type, event_type)


def _format_date(date: str) -> str:
    day = datetime.date.fromisoformat(date[:10])
    return f"{day:%a} {day.day} {day:%b}"


async def construct_message(
    kind: Literal["daily", "weekly"], day: datetime.date | None = None
) -> str:
    day = day or datetime.datetime.now(datetime.UTC).date()
    res = supabase.table("leagues").select("id, name").execute()
    leagues = {row["id"]: row["name"] for row in cast(list[dict], res.data)}

    if kind == "daily":
        events = await get_events_from_db(db=supabase, day=day)
        title = f"**Daily events breakdown**\n({_format_date(str(day))})\n"
        lines = [
            f"{_get_icon(e)} · {e['game']} · {leagues.get(e['leagueId'])}"
            for e in events
        ] or ["No events today."]
    else:
        events = await get_events_from_db(db=supabase, weekly=True)
        title = "**Weekly sanctioned events breakdown**\n"
        majors: dict[str, list[dict]] = {}
        lines = []
        for e in events:
            if e["eventType"] in MAJOR_EVENT_TYPES:
                majors.setdefault(e["name"].strip(), []).append(e)
            elif e["eventType"] not in UNSANCTIONED_TYPES:
                lines.append(
                    f"{_get_icon(e)} · {e['game']} · "
                    f"{leagues.get(e['leagueId'])} · {_format_date(e['date'])}"
                )
        major_lines = []
        for name, days in majors.items():
            first, last = (
                _format_date(days[0]["date"]),
                _format_date(days[-1]["date"]),
            )
            dates = first if first == last else f"{first} - {last}"
            major_lines.append(f"{_get_icon(days[0])} · {name} · {dates}")
        lines = major_lines + lines or ["No sanctioned events this week."]

    return "\n".join([title, *lines, FOOTER])


async def send_discord_message(
    content: str, channel_id: int | None = None
) -> bool:
    """Post content to the channel; False if Discord isn't configured."""
    settings = get_settings()
    token = settings.discord_bot_token
    channel_id = channel_id or settings.discord_channel_id
    if not (token and channel_id):
        logger.warning("Discord bot token or channel ID not configured.")
        return False

    async with discord.Client(intents=discord.Intents.none()) as client:
        await client.login(token)
        await client.get_partial_messageable(channel_id).send(content)
    return True
