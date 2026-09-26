import datetime
import logging

import discord

from app.config import get_settings
from app.dependencies import supabase

from ..services.event import get_events_from_db

settings = get_settings()

logger = logging.getLogger(__name__)


class DiscordService(discord.Client):
    user: discord.ClientUser
    channel_id: str = settings.discord_channel_id

    async def on_ready(self):
        logger.info(f"Discord bot ready: {self.client.user}")

    async def send_daily_update(self):
        channel = self.get_channel(self.channel_id)
        if not channel:
            logger.error(f"Channel with ID {self.channel_id} not found.")

        events = await get_events_from_db(
            db=supabase,
            day=datetime.datetime.now(datetime.UTC).date(),
        )

        message_content = "Daily Events Breakdown:\n\n"
        for event in events:
            message_content += f"- {event['name']} on {event['date']}\n"

        await channel.send(message_content)

    async def send_weekly_update(self):
        channel = self.get_channel(self.channel_id)
        if not channel:
            logger.error(f"Channel with ID {self.channel_id} not found.")

        events = await get_events_from_db(db=supabase, weekly=True)

        message_content = "Upcoming Weekly Events:\n\n"
        for event in events:
            message_content += f"- {event['name']} on {event['date']}\n"

        await channel.send(message_content)


intents = discord.Intents.default()
intents.message_content = True

client = DiscordService(intents=intents)
client.run(settings.discord_bot_token, log_handler=None)
