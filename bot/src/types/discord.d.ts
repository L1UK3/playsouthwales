import "discord.js";

declare module "discord.js" {
    interface ClientEvents {
        dailyUpdate: [message: string, channelId?: string];
        weeklyUpdate: [message: string, channelId?: string];
        monthlyUpdate: [message: string];
    }
}
