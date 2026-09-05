---
meta.contentType: How-to
---

# How to configure and extend the Discord bot

This guide explains how to set up bot credentials, run the bot in mock and production modes, register slash commands, and send channel notifications via the HTTP API.

## Configure Discord credentials

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**.
2. Navigate to **Bot** in the sidebar. Click **Reset Token** to generate an authentication token.
3. Scroll to **Privileged Gateway Intents** and enable **Message Content Intent**.
4. Navigate to **OAuth2 > URL Generator**. Select the `bot` and `applications.commands` scopes. Under **Bot Permissions**, grant permission to send messages and view channels.
5. Copy the generated URL into your web browser and invite the bot to your Discord server.

## Set up local environment

Create your local environment file:

```bash
cd bot
cp .env.example .env
```

Open [bot/.env](file:///d:/Projects/playsouthwales/bot/.env) and set your Discord configuration variables:

```env
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_id
GUILD_ID=your_test_discord_guild_id
PORT=5001
```

If you leave `BOT_TOKEN` empty, the bot operates in offline mock mode. This allows you to test the HTTP notifier API without a live Discord bot token.

## Run the bot service

Install dependencies and start the development server with live reload:

```bash
cd bot
npm install
npm run watch
```

The process launches the Discord client gateway and opens an Express HTTP server on port `5001`.

## Add a new slash command

The bot uses the Discordx framework with TypeScript decorators.

1. Create a new command file in [bot/src/commands/](file:///d:/Projects/playsouthwales/bot/src/commands/):

    ```typescript
    // bot/src/commands/tournament.ts
    import { CommandInteraction } from 'discord.js';
    import { Discord, Slash } from 'discordx';

    @Discord()
    export class TournamentCommands {
        @Slash({
            name: 'upcoming',
            description: 'View upcoming local tournaments',
        })
        async upcoming(interaction: CommandInteraction): Promise<void> {
            await interaction.reply({
                content:
                    "Visit https://playsouthwales.co.uk to browse this weekend's events!",
                ephemeral: true,
            });
        }
    }
    ```

2. Save the file. The `@discordx/importer` automatically discovers and registers all command files at runtime.

## Trigger notifications via HTTP

The bot listens for HTTP requests sent by the backend or automated cron jobs:

### Send a channel notification

```bash
curl -X POST http://localhost:5001/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "123456789012345678",
    "message": "🚨 Cardiff League Cup registration opens in 15 minutes!"
  }'
```

### Emit a custom bot event

```bash
curl -X POST http://localhost:5001/api/emit \
  -H "Content-Type: application/json" \
  -d '{
    "event": "tournamentAlert",
    "data": { "tournamentId": 42 }
  }'
```

## Verify and build for production

Verify formatting and build the production bundle:

```bash
cd bot
npm run build
npm run start
```
