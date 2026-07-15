import asyncio
from unittest.mock import AsyncMock

import pytest

from app.services import championship_scraper

BASE_EVENT = {
    "previewImage_s": None,
    "previewImageAltText_s": None,
    "isStreaming_b": None,
    "cardLinkTarget_s": None,
    "locale_s": None,
}


@pytest.mark.parametrize(
    (
        "event_type",
        "region_s",
        "display_date_range",
        "expected_dates",
        "expected_count",
    ),
    [
        (
            "world",
            None,
            "Aug. 28-30",
            ["2026-08-28", "2026-08-29", "2026-08-30"],
            3,
        ),
        (
            "regional",
            "Europe",
            "Aug. 14-15",
            ["2026-08-14", "2026-08-15"],
            2,
        ),
    ],
)
def test_sync_championship_data_creates_expected_rows(
    mock_supabase,
    supabase_table,
    monkeypatch,
    event_type,
    region_s,
    display_date_range,
    expected_dates,
    expected_count,
):
    supabase_table("leagues", [{"id": 7}])
    events_chain = supabase_table("events", [])

    monkeypatch.setattr(championship_scraper, "supabase", mock_supabase)
    monkeypatch.setattr(
        championship_scraper, "CHAMP_SERIES_URL", "https://example.com"
    )
    monkeypatch.setattr(
        championship_scraper,
        "CHAMP_SERIES_API_URL",
        "https://api.example.com/championships",
    )
    monkeypatch.setattr(
        championship_scraper,
        "fetch_championship_data",
        AsyncMock(
            return_value=[
                {
                    **BASE_EVENT,
                    "eventName_s": "Test Championship",
                    "uRL_s": "/events/test-championship",
                    "displayDateRange_s": display_date_range,
                    "type_s": event_type,
                    "region_s": region_s,
                    "year_s": "2026",
                    "eventLocation_s": "Cardiff",
                }
            ]
        ),
    )

    result = asyncio.run(championship_scraper.sync_championship_data())

    assert result["success"] is True
    assert result["inserted"] == expected_count
    assert events_chain.insert.call_count == 1

    inserted_rows = events_chain.insert.call_args.args[0]
    assert len(inserted_rows) == expected_count
    assert [row["date"] for row in inserted_rows] == expected_dates
    assert [row["id"] for row in inserted_rows] == [
        f"champ-test-championship-{index + 1}"
        for index in range(expected_count)
    ]
    assert all(
        row["ticketLink"] == "https://example.com/events/test-championship"
        for row in inserted_rows
    )
