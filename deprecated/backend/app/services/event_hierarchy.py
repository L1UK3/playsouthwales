"""Event type ordering for schedule API responses and Discord digests."""

EVENT_TYPE_PRIORITY: dict[str, int] = {
    "LEGALITY": 0,
    "RELEASE": 0,
    "REGULATION": 0,
    "WORLDS": 1,
    "INTERNATIONAL": 1,
    "REGIONAL": 1,
    "SPECIAL": 1,
    "CUP": 2,
    "CHALLENGE": 3,
    "PRE-RELEASE": 4,
    "STANDARD": 5,
    "CASUAL": 6,
}

_UNKNOWN_SCHEDULE_PRIORITY = max(EVENT_TYPE_PRIORITY.values(), default=-1) + 1

# Discord digest lists type rank before date (differs from calendar schedule sort).
DISCORD_DIGEST_TYPE_ORDER: tuple[str, ...] = (
    "CHALLENGE",
    "CUP",
    "PRE-RELEASE",
    "SPECIAL",
    "REGIONAL",
    "INTERNATIONAL",
    "WORLDS",
    "STANDARD",
    "CASUAL",
    "LEGALITY",
    "RELEASE",
    "REGULATION",
)

_DISCORD_DIGEST_RANK = {
    key: rank for rank, key in enumerate(DISCORD_DIGEST_TYPE_ORDER)
}


def get_event_type_priority(event_type: str | None) -> int:
    """Return display rank for schedule sorting; unknown types sort last."""
    if not event_type:
        return _UNKNOWN_SCHEDULE_PRIORITY
    normalized = event_type.strip().upper()
    return EVENT_TYPE_PRIORITY.get(normalized, _UNKNOWN_SCHEDULE_PRIORITY)


def schedule_sort_key(event: dict) -> tuple[str, int, str]:
    """Sort key for public schedule data: date, type hierarchy, start time."""
    date = (event.get("date") or "")[:10]
    start = event.get("startTime") or ""
    return date, get_event_type_priority(event.get("eventType")), start


def sort_events_for_schedule(events: list[dict]) -> list[dict]:
    """Return events ordered for calendar and list views."""
    return sorted(events, key=schedule_sort_key)


def digest_sort_key(event: dict) -> tuple[int, str, str]:
    """Sort key for Discord digests: type hierarchy, then date and start time."""
    event_type = event.get("eventType") or ""
    rank = _DISCORD_DIGEST_RANK.get(
        event_type.strip().upper(), len(_DISCORD_DIGEST_RANK)
    )
    return rank, (event.get("date") or "")[:10], event.get("startTime") or ""


def sort_events_for_digest(events: list[dict]) -> list[dict]:
    """Return events ordered for Discord daily and weekly digests."""
    return sorted(events, key=digest_sort_key)
