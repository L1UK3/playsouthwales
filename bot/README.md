---
meta.contentType: Reference
---

# How do I configure and run the Discord bot?

This document guides you through setting up, configuring, and deploying the Play! South Wales Discord notifier bot.

## Plan

- **Overview**: Reference documentation for the Discord bot client.
- **Goal**: Register slash commands, configure credentials, run the HTTP server, and deploy the service.
- **Audience**: Core developers and system administrators.
- **Content Plan**: Step-by-step token setup, Express REST endpoints details, slash commands listing, running tasks, and Docker deployment.
- **Open Questions**: None.

## System requirements

Ensure you have the following software installed:
- Node.js (version 18.0.0 or higher)
- NPM package manager

## Bot setup and configuration

Follow these steps to configure your Discord bot:

1. Create a new Discord application at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a bot user under the **Bot** section and click **Reset Token** to copy your credentials.
3. Enable the **Message Content Intent** toggle under the Privileged Gateway Intents section.
4. Navigate to the **OAuth2 > URL Generator** tab.
5. Select the `bot` and `applications.commands` scopes.
6. Check the required permissions (Send Messages, Embed Links, Read Message History) and copy the generated invite link to authorize the bot in your guild.
7. Create a `.env` file in the bot root directory by copying the example:
   ```bash
   cp .env.example .env
   ```
8. Populate the variables with your credentials:
   - **`BOT_TOKEN`**: The secret token of your Discord bot.
   - **`CLIENT_ID`**: The Application ID of your bot.
   - **`GUILD_ID`**: The ID of your testing Discord server (forces instant slash command sync).

## Run the bot locally

To install dependencies and start the hot-reload watch runner:
```bash
npm install
npm run watch
```

If you do not specify a valid `BOT_TOKEN`, the bot starts in offline/mock mode for local development.

## Express HTTP notifier API

The bot runs an Express HTTP server listening on port `5001` (configurable via the `PORT` environment variable) to receive updates from the backend:

- **`GET /` or `/health`**: Returns a status message indicating the service is online.
- **`POST /api/notify`**: Posts a message to a Discord channel.
  - Payload:
    ```json
    {
      "channelId": "your_channel_id_here",
      "message": "Notification content"
    }
    ```
- **`POST /api/emit`**: Emits a custom client event.
  - Payload:
    ```json
    {
      "event": "event_name_here",
      "args": []
    }
    ```

## Slash commands

The bot registers the following global slash commands:

- **`/ping`**: Checks bot latency to the gateway.
- **`/help`**: Lists bot features, automated event schedules, and available commands.

## Deploy the bot

To compile TypeScript and start the production server:
```bash
npm run build
npm run start
```

### Docker deployment

Build and start the container in detached mode:
```bash
docker-compose up -d --build bot
```
