import datetime
import logging

import httpx

from app.config import Settings
from app.dependencies import supabase
from app.services.event import get_events_from_db

logger = logging.getLogger(__name__)

DISCORD_API = "https://discord.com/api/v10"


class DiscordBroadcaster:
    def __init__(self, token: str, channel_id: int):
        self._url = f"{DISCORD_API}/channels/{channel_id}/messages"
        self._headers = {"Authorization": f"Bot {token}"}

    @classmethod
    def from_settings(cls, settings: Settings) -> "DiscordBroadcaster | None":
        if not (settings.discord_bot_token and settings.discord_channel_id):
            return None
        return cls(settings.discord_bot_token, settings.discord_channel_id)

    async def _send(self, content: str) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._url, headers=self._headers, json={"content": content}
            )
            response.raise_for_status()

    async def _send_events(self, title: str, **filters) -> None:
        events = await get_events_from_db(db=supabase, **filters)
        lines = [f"- {e['name']} on {e['date']}" for e in events]
        await self._send(
            "\n".join([title, "", *(lines or ["No events scheduled."])])
        )

    async def send_daily_update(self) -> None:
        today = datetime.datetime.now(datetime.UTC).date()
        await self._send_events("Daily Events Breakdown:", day=today)

    async def send_weekly_update(self) -> None:
        await self._send_events("Upcoming Weekly Events:", weekly=True)
