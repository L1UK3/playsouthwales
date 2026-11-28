import { env } from "cloudflare:workers";

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Post `content` to the digest channel. Returns false, without calling
 * Discord, while the bot token or channel id is unset; throws when Discord
 * rejects the message.
 */
export async function sendDiscordMessage(content: string): Promise<boolean> {
	const token = env.DISCORD_BOT_TOKEN;
	const channelId = env.DISCORD_CHANNEL_ID;
	if (!token || !channelId) {
		console.warn("Discord bot token or channel id is not configured.");
		return false;
	}

	const response = await fetch(
		`${DISCORD_API}/channels/${channelId}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bot ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
		},
	);
	if (!response.ok) {
		throw new Error(
			`Discord rejected the message: ${response.status} ${await response.text()}`,
		);
	}
	return true;
}
