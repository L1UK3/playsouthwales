"""Tests for centralized schedule and digest event ordering."""

from app.services.event_hierarchy import (
    sort_events_for_digest,
    sort_events_for_schedule,
)


def _make(
    event_id: int,
    event_type: str,
    date: str = "2026-09-12",
    start_time: str | None = None,
) -> dict:
    return {
        "id": event_id,
        "name": f"Event {event_id}",
        "date": date,
        "startTime": start_time,
        "leagueId": 0,
        "eventType": event_type,
        "game": "TCG",
    }


def test_schedule_sort_same_day_follows_event_type_hierarchy():
    events = [
        _make(1, "CASUAL"),
        _make(2, "STANDARD"),
        _make(3, "PRE-RELEASE"),
        _make(4, "CHALLENGE"),
        _make(5, "CUP"),
        _make(6, "REGIONAL"),
        _make(7, "LEGALITY"),
    ]
    order = [e["eventType"] for e in sort_events_for_schedule(events)]
    assert order == [
        "LEGALITY",
        "REGIONAL",
        "CUP",
        "CHALLENGE",
        "PRE-RELEASE",
        "STANDARD",
        "CASUAL",
    ]


def test_schedule_sort_date_precedes_event_type():
    events = [_make(1, "WORLDS", "2026-09-13"), _make(2, "CASUAL")]
    order = [e["id"] for e in sort_events_for_schedule(events)]
    assert order == [2, 1]


def test_schedule_sort_equal_rank_uses_start_time():
    events = [
        _make(1, "CUP", start_time="14:00"),
        _make(2, "CUP", start_time="10:00"),
    ]
    order = [e["id"] for e in sort_events_for_schedule(events)]
    assert order == [2, 1]


def test_schedule_sort_unknown_types_after_casual():
    events = [_make(1, "MYSTERY"), _make(2, "CASUAL")]
    order = [e["id"] for e in sort_events_for_schedule(events)]
    assert order == [2, 1]


def test_digest_sort_prefers_type_rank_before_date():
    events = [
        _make(1, "CUP", "2026-11-03"),
        _make(2, "CHALLENGE", "2026-11-05"),
        _make(3, "CHALLENGE", "2026-11-06"),
    ]
    order = [e["id"] for e in sort_events_for_digest(events)]
    assert order == [2, 3, 1]
