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

EVENT_TYPE_RANK = {key: rank for rank, key in enumerate(EVENT_TYPE_LABELS)}

UNSANCTIONED_TYPE = {"CASUAL", "STANDARD"}
CHAMPIONSHIP_TYPE = {"SPECIAL", "REGIONAL", "INTERNATIONAL", "WORLDS"}

FOOTER = (
    "\n-# Sanctioned events from the official Play Pokemon! schedule and from Pokédata (unofficial); "
    "Weekly events listed by league partners. <https://www.playsouthwales.uk/events>"
)


def _format_date(day: datetime.date) -> str:
    return f"{day:%a} {day.day} {day:%b}"


def _is_championship(event: dict) -> bool:
    return event["eventType"] in CHAMPIONSHIP_TYPE


def _is_sanctioned(event: dict) -> bool:
    return event["eventType"] not in UNSANCTIONED_TYPE


def _get_league_names() -> dict[int, str]:
    res = supabase.table("leagues").select("id, name").execute()
    return {row["id"]: row["name"] for row in cast(list[dict], res.data)}


def _hierarchy_key(event: dict) -> tuple[int, str, str]:
    """Sort by EVENT_TYPE_LABELS order, with unknown types last."""
    rank = EVENT_TYPE_RANK.get(event["eventType"], len(EVENT_TYPE_RANK))
    return rank, event["date"], event.get("startTime") or ""


def _championship_line(event: dict) -> str:
    emoji = EVENT_TYPE_LABELS[event["eventType"]].split()[0]
    return f"**{emoji} {event['name']}**"


def _event_line(
    event: dict, leagues: dict[int, str], show_date: bool = False
) -> str:
    event_type = event["eventType"] or ""
    label = EVENT_TYPE_LABELS.get(event_type, event_type.title() or "Event")
    game = event.get("game")
    parts = [
        f"**{label}**",
        None if game == "ALL" else game,
        leagues.get(event["leagueId"]),
    ]
    if show_date:
        event_day = datetime.date.fromisoformat(event["date"][:10])
        parts.append(_format_date(event_day))
    return " · ".join(part for part in parts if part)


def _digest_body(
    events: list[dict], leagues: dict[int, str], show_date: bool = False
) -> str:
    """List championships above the other events, most important first."""
    ordered = sorted(events, key=_hierarchy_key)
    # Multi-day championships have one row per day but share a single line.
    championships = dict.fromkeys(
        _championship_line(event)
        for event in ordered
        if _is_championship(event)
    )
    others = [
        _event_line(event, leagues, show_date)
        for event in ordered
        if not _is_championship(event)
    ]
    blocks = [block for block in (championships, others) if block]
    return "\n\n".join("\n".join(block) for block in blocks)


def _daily_body(events: list[dict], leagues: dict[int, str]) -> str:
    return _digest_body(events, leagues) or "No events tomorrow."


def _weekly_body(events: list[dict], leagues: dict[int, str]) -> str:
    sanctioned = list(filter(_is_sanctioned, events))
    body = _digest_body(sanctioned, leagues, show_date=True)
    return body or "No sanctioned events this week."


async def construct_message(
    kind: Literal["daily", "weekly"], day: datetime.date | None = None
) -> str:
    """Build a digest message; day only applies to the daily digest."""
    leagues = _get_league_names()

    if kind == "daily":
        today = datetime.datetime.now(datetime.UTC).date()
        day = day or today + datetime.timedelta(days=1)
        events = await get_events_from_db(db=supabase, day=day)
        title = f"## 📅 Tomorrow's events\n-# {_format_date(day)}\n"
        body = _daily_body(events, leagues)
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
