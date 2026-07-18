import type { Client } from "discordx";

/**
 * Log in to Discord using the bot token.
 * 
 * Falls back to offline/mock mode if connection fails or token is rejected.
 */
export async function connectDiscord(bot: Client): Promise<void> {
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    try {
        await bot.login(process.env.BOT_TOKEN);
    } catch (err) {
        console.error(`[Bot] Failed to connect to Discord: ${(err as Error).message}`);
        console.warn("[Bot] Running bot in offline/mock mode for local development...");
    }
}
