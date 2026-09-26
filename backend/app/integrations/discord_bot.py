import logging

import discord

from app.config import get_settings

settings = get_settings()
intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

logger = logging.getLogger(__name__)


@client.event
async def on_ready():
    print(f"We have logged in as {client.user}")


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith("$hello"):
        await message.channel.send("Hello!")


client.run(settings.discord_bot_token, log_handler=None)
