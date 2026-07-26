import type { Request, Response } from "express";
import type { Client } from "discordx";

/**
 * Handle health check GET requests.
 * 
 * Returns a JSON body indicating the service status is healthy.
 */
export function handleHealthCheck(req: Request, res: Response): void {
    res.status(200).json({ status: "healthy" });
}

/**
 * Handle notification message requests.
 * 
 * Retrieves channelId and message from the request body to post to Discord.
 */
export async function handleNotify(bot: Client, req: Request, res: Response): Promise<void> {
    const { channelId, message } = req.body;

    if (!channelId || !message) {
        res.status(400).json({
            error: "BadRequest",
            message: "Missing channelId or message properties in the request body"
        });
        return;
    }

    try {
        const channel = await bot.channels.fetch(channelId);
        if (channel && channel.isTextBased() && "send" in channel) {
            await channel.send(message);
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({
                error: "NotFound",
                message: `Discord channel ${channelId} was not found or is not a sendable text channel`
            });
        }
    } catch (e) {
        console.warn("[Bot] Notify endpoint running in mock mode - cannot fetch channel:", e);
        console.log(`[Mock Notify] #${channelId}: ${message}`);
        res.status(200).json({ success: true, mock: true });
    }
}

/**
 * Handle custom event emission requests.
 * 
 * Dispatches the event inside the Discord client with optional argument arrays.
 */
export function handleEmit(bot: Client, req: Request, res: Response): void {
    const { event, args } = req.body;

    if (!event) {
        res.status(400).json({
            error: "BadRequest",
            message: "Missing event name property in the request body"
        });
        return;
    }

    bot.emit(event, ...(args || []));
    res.status(200).json({ success: true });
}
