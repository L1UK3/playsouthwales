import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import discord
import pytest

from app.config import Settings
from app.integrations import discord_bot
from app.integrations.discord_bot import FOOTER

LEAGUES = {1: "Cardiff Dragon Guild", 2: "Mana Haven Cardiff"}


def make_settings(token, channel_id):
    return Settings.model_construct(
        discord_bot_token=token, discord_channel_id=channel_id
    )


def make_event(event_type, date, league_id=1, name="Event", game="TCG"):
    return {
        "eventType": event_type,
        "date": date,
        "leagueId": league_id,
        "name": name,
        "game": game,
    }


def mock_db(events):
    load_events = AsyncMock(return_value=events)
    leagues_db = MagicMock()
    leagues_db.table.return_value.select.return_value.execute.return_value.data = [
        {"id": league_id, "name": name} for league_id, name in LEAGUES.items()
    ]
    return load_events, (
        patch("app.integrations.discord_bot.get_events_from_db", load_events),
        patch("app.integrations.discord_bot.supabase", leagues_db),
    )


@pytest.mark.anyio
async def test_daily_message():
    load_events, (events_patch, leagues_patch) = mock_db(
        [
            make_event("CHALLENGE", "2026-10-29", 1, "League Challenge"),
            make_event("STANDARD", "2026-10-29", 2, " Thursday League"),
            make_event("CASUAL", "2026-10-29", 2, "VGC Practice", "VGC"),
        ]
    )
    day = datetime.date(2026, 10, 29)

    with events_patch, leagues_patch:
        message = await discord_bot.construct_message("daily", day)

    assert load_events.await_args.kwargs["day"] == day
    assert message == "\n".join(
        [
            "**Daily events breakdown**\n(Thu 29 Oct)\n",
            "🏅 · TCG · Cardiff Dragon Guild",
            "S · TCG · Mana Haven Cardiff",
            "C · VGC · Mana Haven Cardiff",
            FOOTER,
        ]
    )


@pytest.mark.anyio
async def test_daily_message_without_events():
    _, (events_patch, leagues_patch) = mock_db([])

    with events_patch, leagues_patch:
        message = await discord_bot.construct_message(
            "daily", datetime.date(2026, 10, 29)
        )

    assert message == "\n".join(
        [
            "**Daily events breakdown**\n(Thu 29 Oct)\n",
            "No events today.",
            FOOTER,
        ]
    )


@pytest.mark.anyio
async def test_weekly_message_lists_majors_first_and_skips_league_play():
    regional = "Gdansk Regional Championships"
    load_events, (events_patch, leagues_patch) = mock_db(
        [
            make_event("CASUAL", "2026-11-02", 1, "Monday League"),
            make_event("CUP", "2026-11-03", 2, "League Cup"),
            make_event("SPECIAL", "2026-11-04", 1, "Go Fest", "GO"),
            make_event("CHALLENGE", "2026-11-05", 1, "Challenge", "VGC"),
            make_event("REGIONAL", "2026-11-07", 1, regional, "ALL"),
            make_event("REGIONAL", "2026-11-08", 1, regional, "ALL"),
        ]
    )

    with events_patch, leagues_patch:
        message = await discord_bot.construct_message("weekly")

    assert load_events.await_args.kwargs["weekly"] is True
    assert message == "\n".join(
        [
            "**Weekly sanctioned events breakdown**\n",
            "📍 · Go Fest · Wed 4 Nov",
            f"📍 · {regional} · Sat 7 Nov - Sun 8 Nov",
            "🏆 · TCG · Mana Haven Cardiff · Tue 3 Nov",
            "🏅 · VGC · Cardiff Dragon Guild · Thu 5 Nov",
            FOOTER,
        ]
    )


@pytest.mark.anyio
async def test_weekly_message_without_sanctioned_events():
    _, (events_patch, leagues_patch) = mock_db(
        [make_event("CASUAL", "2026-11-02")]
    )

    with events_patch, leagues_patch:
        message = await discord_bot.construct_message("weekly")

    assert message == "\n".join(
        [
            "**Weekly sanctioned events breakdown**\n",
            "No sanctioned events this week.",
            FOOTER,
        ]
    )


@pytest.mark.anyio
async def test_daily_message_tolerates_unknown_event_types():
    _, (events_patch, leagues_patch) = mock_db(
        [
            make_event("NEW TYPE", "2026-10-29"),
            make_event(None, "2026-10-29"),
        ]
    )

    with events_patch, leagues_patch:
        message = await discord_bot.construct_message(
            "daily", datetime.date(2026, 10, 29)
        )

    assert "NEW TYPE · TCG · Cardiff Dragon Guild" in message
    assert "\n · TCG · Cardiff Dragon Guild" in message


@pytest.mark.anyio
async def test_send_discord_message_logs_in_and_posts_to_channel():
    with (
        patch(
            "app.integrations.discord_bot.get_settings",
            return_value=make_settings("token", 123),
        ),
        patch.object(discord.Client, "login", AsyncMock()) as login,
        patch.object(discord.PartialMessageable, "send", AsyncMock()) as send,
    ):
        assert await discord_bot.send_discord_message("hello") is True

    login.assert_awaited_once_with("token")
    send.assert_awaited_once_with("hello")


@pytest.mark.anyio
async def test_send_discord_message_skips_when_unconfigured():
    with (
        patch(
            "app.integrations.discord_bot.get_settings",
            return_value=make_settings(None, None),
        ),
        patch.object(discord.Client, "login", AsyncMock()) as login,
    ):
        assert await discord_bot.send_discord_message("hello") is False

    login.assert_not_awaited()


@pytest.mark.anyio
async def test_send_discord_message_raises_on_discord_error():
    error = discord.Forbidden(MagicMock(status=403), "Missing Access")

    with (
        patch(
            "app.integrations.discord_bot.get_settings",
            return_value=make_settings("token", 123),
        ),
        patch.object(discord.Client, "login", AsyncMock()),
        patch.object(
            discord.PartialMessageable, "send", AsyncMock(side_effect=error)
        ),
    ):
        with pytest.raises(discord.Forbidden):
            await discord_bot.send_discord_message("hello")
