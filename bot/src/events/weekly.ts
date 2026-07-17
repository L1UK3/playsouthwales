import { Discord, On } from "discordx";
import { bot } from "../main.js";

@Discord()
export class WeeklyEvents {
    @On({ event: "weeklyUpdate" })
    async weeklyUpdate(message: string, channelId?: string): Promise<void> {
        console.log(`[Bot] Received weeklyUpdate: ${message}`);
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
                console.error(`[Bot] Failed to send weekly update:`, error);
            }
        }
    }

    @On({ event: "monthlyUpdate" })
    async monthlyUpdate(message: string): Promise<void> {
        console.log(`[Bot] Received monthlyUpdate: ${message}`);
    }
}
