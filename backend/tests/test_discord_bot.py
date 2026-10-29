from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.config import Settings
from app.integrations.discord_bot import DiscordBroadcaster


def make_settings(token, channel_id):
    return Settings.model_construct(
        discord_bot_token=token, discord_channel_id=channel_id
    )


@pytest.mark.parametrize(
    ("token", "channel_id"), [(None, 123), ("token", None), (None, None)]
)
def test_from_settings_returns_none_when_unconfigured(token, channel_id):
    assert (
        DiscordBroadcaster.from_settings(make_settings(token, channel_id))
        is None
    )


def test_from_settings_builds_broadcaster():
    broadcaster = DiscordBroadcaster.from_settings(make_settings("token", 123))

    assert broadcaster._url.endswith("/channels/123/messages")
    assert broadcaster._headers == {"Authorization": "Bot token"}


@pytest.mark.anyio
async def test_send_daily_update_posts_events():
    broadcaster = DiscordBroadcaster("token", 123)
    events = [{"name": "League Challenge", "date": "2026-10-29"}]

    with (
        patch(
            "app.integrations.discord_bot.get_events_from_db",
            AsyncMock(return_value=events),
        ) as load_events,
        patch.object(broadcaster, "_send", AsyncMock()) as send,
    ):
        await broadcaster.send_daily_update()

    assert "day" in load_events.await_args.kwargs
    send.assert_awaited_once_with(
        "Daily Events Breakdown:\n\n- League Challenge on 2026-10-29"
    )


@pytest.mark.anyio
async def test_send_weekly_update_handles_no_events():
    broadcaster = DiscordBroadcaster("token", 123)

    with (
        patch(
            "app.integrations.discord_bot.get_events_from_db",
            AsyncMock(return_value=[]),
        ) as load_events,
        patch.object(broadcaster, "_send", AsyncMock()) as send,
    ):
        await broadcaster.send_weekly_update()

    assert load_events.await_args.kwargs["weekly"] is True
    send.assert_awaited_once_with(
        "Upcoming Weekly Events:\n\nNo events scheduled."
    )


@pytest.mark.anyio
async def test_send_raises_on_discord_error():
    broadcaster = DiscordBroadcaster("token", 123)
    request = httpx.Request("POST", broadcaster._url)
    response = httpx.Response(403, request=request)

    with patch(
        "httpx.AsyncClient.post", AsyncMock(return_value=response)
    ) as post:
        with pytest.raises(httpx.HTTPStatusError):
            await broadcaster._send("hello")

    assert post.await_args.kwargs["json"] == {"content": "hello"}
