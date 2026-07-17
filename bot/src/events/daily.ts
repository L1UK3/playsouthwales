import { Discord, On, type ArgsOf, type Client } from "discordx";
import { bot } from "../main.js";

@Discord()
export class CommonEvents {
    @On({ event: "ready" })
    onReady(_args: ArgsOf<"ready">, client: Client): void {
        console.log(`[Bot] Logged in as ${client.user?.tag}!`);
    }

    @On({ event: "dailyUpdate" })
    async onDailyUpdate(message: string, channelId?: string): Promise<void> {
        console.log(`[Bot] Received dailyUpdate: ${message}`);
        if (!bot.token || !bot.user) {
            console.warn("[Bot] Skipping Discord delivery (bot is in offline/mock mode).");
            return;
        }
        if (channelId) {
            try {
                const channel = await bot.channels.fetch(channelId);
                if (channel && channel.isTextBased() && "send" in channel) {
                    await channel.send(message);
                }
            } catch (error) {
                console.error(`[Bot] Failed to send daily update:`, error);
            }
        }
    }
}
