import asyncio
import datetime
import logging
from collections.abc import Awaitable, Callable
from typing import Protocol, TypedDict

import discord

from app.config import Settings, get_settings
from app.dependencies import supabase

from ..services.event import get_events_from_db

logger = logging.getLogger(__name__)


intents = discord.Intents.default()
intents.message_content = True


class EventRecord(TypedDict):
    name: str
    date: str


class MessageableChannel(Protocol):
    async def send(self, content: str) -> object: ...


class DiscordBroadcastError(RuntimeError):
    """Raised when Discord cannot receive a broadcast message."""


class DiscordBroadcaster:
    def __init__(
        self,
        settings: Settings | None = None,
        discord_client: discord.Client | None = None,
        event_loader: Callable[
            ..., Awaitable[list[EventRecord]]
        ] = get_events_from_db,
    ):
        self.settings = settings or get_settings()
        self.client = discord_client or discord.Client(intents=intents)
        self._event_loader = event_loader
        self._client_task: asyncio.Task | None = None

    @property
    def channel_id(self) -> int:
        channel_id = self.settings.discord_channel_id
        if channel_id is None:
            raise RuntimeError("DISCORD_CHANNEL_ID must be configured")
        try:
            return int(channel_id)
        except (TypeError, ValueError) as error:
            raise RuntimeError(
                "DISCORD_CHANNEL_ID must be an integer"
            ) from error

    async def start(self) -> None:
        token = self.settings.discord_bot_token
        if not token:
            raise RuntimeError("DISCORD_BOT_TOKEN must be configured")
        logger.info("Starting Discord client for channel %s", self.channel_id)
        self._client_task = asyncio.create_task(self.client.start(token))
        self._client_task.add_done_callback(self._log_client_failure)

    @staticmethod
    def _log_client_failure(task: asyncio.Task) -> None:
        if task.cancelled():
            return
        try:
            task.result()
        except Exception:
            logger.exception("Discord client stopped unexpectedly")

    async def stop(self) -> None:
        if not self.client.is_closed():
            await self.client.close()
        if self._client_task and not self._client_task.done():
            self._client_task.cancel()
            try:
                await self._client_task
            except asyncio.CancelledError:
                pass
        self._client_task = None

    async def _get_channel(self) -> MessageableChannel:
        try:
            if not self.client.is_ready():
                await asyncio.wait_for(
                    self.client.wait_until_ready(), timeout=10
                )
            channel = self.client.get_channel(self.channel_id)
            if channel is None:
                channel = await self.client.fetch_channel(self.channel_id)
        except (
            discord.Forbidden,
            discord.HTTPException,
            discord.NotFound,
        ) as error:
            raise DiscordBroadcastError(
                f"Unable to access Discord channel {self.channel_id}: {error}"
            ) from error
        if not hasattr(channel, "send"):
            raise DiscordBroadcastError(
                f"Discord channel {self.channel_id} cannot receive messages"
            )
        return channel

    async def _send_events(
        self,
        message_title: str,
        *,
        day: datetime.date | None = None,
        weekly=False,
    ) -> None:
        channel = await self._get_channel()
        events = await self._event_loader(db=supabase, day=day, weekly=weekly)
        message_lines = [message_title, ""]
        message_lines.extend(
            f"- {event['name']} on {event['date']}" for event in events
        )
        if not events:
            message_lines.append("No events scheduled.")
        await channel.send("\n".join(message_lines))

    async def send_daily_update(self) -> None:
        await self._send_events(
            "Daily Events Breakdown:",
            day=datetime.datetime.now(datetime.UTC).date(),
        )

    async def send_weekly_update(self) -> None:
        await self._send_events("Upcoming Weekly Events:", weekly=True)
