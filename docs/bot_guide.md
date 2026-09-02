---
meta.contentType: How-to
---

# How do I configure and extend the Discord bot?

This guide covers setting up, running, and creating slash commands for the Discord bot.

## Quick setup

1. Create a Discord application at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under **Bot**, click **Reset Token** and copy the token. Enable **Message Content Intent**.
3. Under **OAuth2 > URL Generator**, select `bot` and `applications.commands` scopes, grant message permissions, and invite the bot to your server.
4. Copy the environment file:
    ```bash
    cd bot
    cp .env.example .env
    ```
5. Populate `bot/.env`:
    ```env
    BOT_TOKEN=your_token_here
    CLIENT_ID=your_client_id_here
    GUILD_ID=your_test_server_id_here
    PORT=5001
    ```

## Run the bot

Install dependencies and start with live reload:

```bash
npm install
npm run watch
```

If `BOT_TOKEN` is unset, the bot runs in offline mock mode for HTTP testing.

## HTTP notifier API

The bot runs an Express server on port `5001`:

- **`GET /health`**: Health check.
- **`POST /api/notify`**: Send a message to a Discord channel.
    ```json
    {
        "channelId": "1234567890",
        "message": "Tournament starting at 18:00!"
    }
    ```

## Add a slash command

Create a file in `bot/src/commands/`:

```typescript
import { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';

@Discord()
export class PingCommand {
    @Slash({ name: 'ping', description: 'Check bot latency' })
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.reply('Pong!');
    }
}
```

The bot auto-registers all commands on launch.

## Production build

```bash
npm run build
npm run start
```
