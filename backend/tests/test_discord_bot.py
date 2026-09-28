import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import discord
import pytest

from app.integrations.discord_bot import (
    DiscordBroadcaster,
    DiscordBroadcastError,
)


@pytest.fixture
def settings():
    return SimpleNamespace(
        discord_bot_token="token",
        discord_channel_id=123,
    )


@pytest.mark.anyio
async def test_send_daily_update_sends_events_to_cached_channel(settings):
    channel = MagicMock()
    channel.send = AsyncMock()
    discord_client = MagicMock()
    discord_client.get_channel.return_value = channel
    load_events = AsyncMock(
        return_value=[{"name": "Cardiff Challenge", "date": "2026-09-28"}]
    )
    broadcaster = DiscordBroadcaster(settings, discord_client, load_events)

    await broadcaster.send_daily_update()

    load_events.assert_awaited_once()
    channel.send.assert_called_once_with(
        "Daily Events Breakdown:\n\n- Cardiff Challenge on 2026-09-28"
    )
    discord_client.fetch_channel.assert_not_called()


@pytest.mark.anyio
async def test_send_weekly_update_fetches_uncached_channel(settings):
    channel = MagicMock()
    channel.send = AsyncMock()
    discord_client = MagicMock()
    discord_client.is_ready.return_value = True
    discord_client.get_channel.return_value = None
    discord_client.fetch_channel = AsyncMock(return_value=channel)
    load_events = AsyncMock(return_value=[])
    broadcaster = DiscordBroadcaster(settings, discord_client, load_events)

    await broadcaster.send_weekly_update()

    discord_client.fetch_channel.assert_awaited_once_with(123)
    channel.send.assert_called_once_with(
        "Upcoming Weekly Events:\n\nNo events scheduled."
    )
    load_events.assert_awaited_once()
    assert load_events.call_args.kwargs["weekly"] is True
    assert load_events.call_args.kwargs["db"] is not None


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("token", "channel_id", "message"),
    [
        (None, 123, "DISCORD_BOT_TOKEN must be configured"),
        ("token", None, "DISCORD_CHANNEL_ID must be configured"),
        ("token", "not-an-id", "DISCORD_CHANNEL_ID must be an integer"),
    ],
)
async def test_start_rejects_invalid_configuration(token, channel_id, message):
    settings = SimpleNamespace(
        discord_bot_token=token,
        discord_channel_id=channel_id,
    )
    broadcaster = DiscordBroadcaster(settings, MagicMock())

    with pytest.raises(RuntimeError, match=message):
        await broadcaster.start()


@pytest.mark.anyio
async def test_start_and_stop_manage_discord_client(settings):
    discord_client = MagicMock()
    discord_client.start = AsyncMock()
    discord_client.wait_until_ready = AsyncMock()
    discord_client.is_closed.return_value = False
    discord_client.close = AsyncMock()
    broadcaster = DiscordBroadcaster(settings, discord_client)

    await broadcaster.start()
    await asyncio.sleep(0)
    await broadcaster.stop()

    discord_client.start.assert_awaited_once_with("token")
    discord_client.wait_until_ready.assert_not_awaited()
    discord_client.close.assert_awaited_once()


@pytest.mark.anyio
async def test_fetch_channel_errors_are_controlled(settings):
    discord_client = MagicMock()
    discord_client.is_ready.return_value = True
    discord_client.get_channel.return_value = None
    discord_client.fetch_channel = AsyncMock(
        side_effect=discord.Forbidden(MagicMock(), "forbidden")
    )
    broadcaster = DiscordBroadcaster(settings, discord_client)

    with pytest.raises(DiscordBroadcastError, match="Unable to access Discord"):
        await broadcaster.send_weekly_update()
