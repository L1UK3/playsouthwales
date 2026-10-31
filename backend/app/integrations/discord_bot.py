import datetime
import logging
from typing import Literal, cast

import discord

from app.config import get_settings
from app.dependencies import supabase
from app.services.event import get_events_from_db

logger = logging.getLogger(__name__)

EVENT_TYPE_LABELS: dict[str, str] = {
    "CHALLENGE": "🏅 Challenge",
    "CUP": "🏆 Cup",
    "PRE-RELEASE": "🎁 Pre-release",
    "SPECIAL": "📍 Special event",
    "REGIONAL": "📍 Regional",
    "INTERNATIONAL": "🌍 International",
    "WORLDS": "🌍 Worlds",
    "STANDARD": "⚔️ Standard league",
    "CASUAL": "🎲 Casual league",
    "LEGALITY": "✅ New TCG set legal",
    "RELEASE": "📦 TCG set release day",
    "REGULATION": "📜 New VGC regulation legal",
}

UNSANCTIONED_TYPES = {"CASUAL", "STANDARD"}
FOOTER = "\n:wales: <https://www.playsouthwales.uk>"


def _format_date(date: datetime.date | str) -> str:
    day = datetime.date.fromisoformat(date) if isinstance(date, str) else date
    return f"{day:%a} {day.day} {day:%b}"


def _event_line(event: dict, leagues: dict[int, str]) -> str:
    event_type = event["eventType"] or ""
    label = EVENT_TYPE_LABELS.get(event_type, event_type.title() or "Event")
    game = event.get("game")
    parts = [
        f"**{label}**",
        None if game == "ALL" else game,
        leagues.get(event["leagueId"]),
    ]
    return " · ".join(part for part in parts if part)


def _weekly_body(events: list[dict], leagues: dict[int, str]) -> str:
    by_day: dict[str, list[str]] = {}
    for e in sorted(
        events, key=lambda e: (e["date"], e.get("startTime") or "")
    ):
        if e["eventType"] not in UNSANCTIONED_TYPES:
            by_day.setdefault(e["date"][:10], []).append(
                _event_line(e, leagues)
            )
    return (
        "\n\n".join(
            f"__{_format_date(day)}__\n" + "\n".join(lines)
            for day, lines in by_day.items()
        )
        or "No sanctioned events this week."
    )


async def construct_message(
    kind: Literal["daily", "weekly"], day: datetime.date | None = None
) -> str:
    day = day or datetime.datetime.now(datetime.UTC).date()
    res = supabase.table("leagues").select("id, name").execute()
    leagues = {row["id"]: row["name"] for row in cast(list[dict], res.data)}

    if kind == "daily":
        events = await get_events_from_db(db=supabase, day=day)
        title = f"## 📅 Today's events\n-# {_format_date(day)}\n"
        events.sort(key=lambda e: e["eventType"] in UNSANCTIONED_TYPES)
        body = (
            "\n".join(_event_line(e, leagues) for e in events)
            or "No events today."
        )
    else:
        events = await get_events_from_db(db=supabase, weekly=True)
        title = "## 📆 Next week's sanctioned events\n"
        body = _weekly_body(events, leagues)

    return "\n".join([title, body, FOOTER])


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
        channel = client.get_partial_messageable(channel_id)
        await channel.send(content)
    return True
